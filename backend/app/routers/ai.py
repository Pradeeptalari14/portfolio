import time
import math
import uuid
import re
from typing import Dict, List, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from ..schemas import (
    AICompletionRequest,
    PromptGuardrailRequest, PromptGuardrailResponse,
    AgentMemoryStoreRequest, AgentMemoryQueryRequest, AgentMemoryFactResponse, AgentMemoryRecallResponse,
    AgentEvalRequest, AgentEvalResponse,
    InferenceProfileRequest, InferenceProfileResponse,
    A2AMessageRequest, A2AMessageResponse,
    SemanticCacheRequest, SemanticCacheResponse,
    LoRAVRAMEstimateRequest, LoRAVRAMEstimateResponse,
    FinOpsCarbonRequest, FinOpsCarbonResponse
)

router = APIRouter(prefix="/api/ai", tags=["Local AI & Ollama"])

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# In-memory fast episodic stores (backed by models when PostgreSQL active)
_IN_MEMORY_AGENT_FACTS: Dict[str, List[Dict[str, Any]]] = {}

# Known Adversarial Signatures for Prompt Guardrail Classifier
ADVERSARIAL_RULES = [
    (r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts)", "LLM01: Direct Prompt Injection", 0.95),
    (r"(disregard|forget)\s+(system|developer)\s+(prompt|rules)", "LLM01: Prompt Injection / System Override", 0.92),
    (r"you\s+are\s+now\s+(DAN|jailbreak|unrestricted|godmode)", "LLM01: Persona Jailbreak (DAN)", 0.96),
    (r"(reveal|print|expose|dump)\s+(the\s+)?(system\s+prompt|master\s+key|api_key|secret)", "LLM06: Sensitive Information Disclosure", 0.94),
    (r"(rm\s+-rf|chmod\s+777|curl\s+http.*\|\s*sh|cat\s+/etc/shadow)", "LLM08: Insecure Tool Hijacking", 0.98),
    (r"(\b\d{3}-\d{2}-\d{4}\b|\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b)", "LLM06: PII / Credit Card & SSN Exfiltration", 0.88)
]

@router.get("/models")
async def list_available_models():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass
    return {
        "models": [
            {"name": "qwen2.5-coder:7b", "details": {"family": "qwen2"}},
            {"name": "llama3.2:3b", "details": {"family": "llama"}},
            {"name": "deepseek-r1:8b", "details": {"family": "deepseek"}},
            {"name": "nomic-embed-text:latest", "details": {"family": "nomic"}}
        ],
        "status": "offline_or_custom"
    }

@router.post("/generate")
async def generate_completion(payload: AICompletionRequest):
    ollama_payload = {
        "model": payload.model,
        "prompt": payload.prompt,
        "system": payload.system_prompt or "You are an expert Cloud & AI Systems engineer for Talari Pradeep Studios Hub.",
        "stream": payload.stream,
        "options": {
            "temperature": payload.temperature
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json=ollama_payload
            )
            if resp.status_code == 200:
                return resp.json()
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
    except httpx.ConnectError:
        # Graceful simulated response when local Ollama is not active
        return {
            "model": payload.model,
            "response": (
                f"[Studios AI Assistant — Local Engine Ready]\n"
                f"Generated architectural guidance for studio query: '{payload.prompt[:80]}...'\n"
                f"To enable real GPU inference, start Ollama on {OLLAMA_HOST} with: 'ollama run {payload.model}'."
            ),
            "done": True,
            "total_duration": 42000000
        }
    except Exception as e:
        env = os.getenv("ENVIRONMENT", "development").lower()
        detail = "AI service encountered an internal error. Please check backend engine availability." if env == "production" else str(e)
        raise HTTPException(status_code=500, detail=detail)

# ==============================================================================
# 1. AI Guardrails & Prompt Injection Defense Endpoint (OWASP LLM01-LLM10)
# ==============================================================================
@router.post("/guardrails/scan", response_model=PromptGuardrailResponse)
async def scan_prompt_guardrails(payload: PromptGuardrailRequest):
    start = time.time()
    reasons = []
    max_risk = 0.0
    detected_class = None
    sanitized = payload.prompt

    for pattern, attack_name, severity in ADVERSARIAL_RULES:
        match = re.search(pattern, payload.prompt, re.IGNORECASE)
        if match:
            reasons.append(f"Adversarial signature matched: {attack_name} ('{match.group(0)[:40]}')")
            if severity > max_risk:
                max_risk = severity
                detected_class = attack_name
            # Sanitize matched token
            sanitized = re.sub(pattern, "[REDACTED_ADVERSARIAL_INPUT]", sanitized, flags=re.IGNORECASE)

    # PII Scrubbing (Email, Phone)
    sanitized = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]", sanitized)
    sanitized = re.sub(r"\+?\d[\d -]{8,}\d", "[REDACTED_PHONE]", sanitized)

    blocked = max_risk >= 0.85
    latency_ms = (time.time() - start) * 1000

    return PromptGuardrailResponse(
        blocked=blocked,
        risk_score=round(max_risk, 3),
        detected_attack_class=detected_class,
        sanitized_prompt=sanitized,
        reasons=reasons,
        latency_ms=round(latency_ms, 2)
    )

# ==============================================================================
# 2. Agent Working & Persistent Memory Endpoints (Ebbinghaus Decay & Graph Recall)
# ==============================================================================
@router.post("/memory/save", response_model=AgentMemoryFactResponse)
async def save_agent_memory(payload: AgentMemoryStoreRequest):
    now = datetime.utcnow()
    fact_id = f"fact_{uuid.uuid4().hex[:8]}"

    entry = {
        "fact_id": fact_id,
        "agent_id": payload.agent_id,
        "entity": payload.entity.strip(),
        "relation": payload.relation.strip(),
        "value": payload.value.strip(),
        "context": payload.context,
        "importance": payload.importance,
        "rehearsal_count": 1,
        "created_at": now,
        "last_accessed_at": now
    }

    if payload.agent_id not in _IN_MEMORY_AGENT_FACTS:
        _IN_MEMORY_AGENT_FACTS[payload.agent_id] = []
    
    # Consolidate: if entity + relation exists, rehearse it instead of duplicating
    existing = next((f for f in _IN_MEMORY_AGENT_FACTS[payload.agent_id] if f["entity"].lower() == payload.entity.lower() and f["relation"].lower() == payload.relation.lower()), None)
    if existing:
        existing["value"] = payload.value.strip()
        existing["rehearsal_count"] += 1
        existing["last_accessed_at"] = now
        entry = existing
    else:
        _IN_MEMORY_AGENT_FACTS[payload.agent_id].append(entry)

    return AgentMemoryFactResponse(
        fact_id=entry["fact_id"],
        agent_id=entry["agent_id"],
        entity=entry["entity"],
        relation=entry["relation"],
        value=entry["value"],
        retention_score=1.0,
        rehearsal_count=entry["rehearsal_count"],
        created_at=entry["created_at"],
        last_accessed_at=entry["last_accessed_at"]
    )

@router.post("/memory/recall", response_model=AgentMemoryRecallResponse)
async def recall_agent_memory(payload: AgentMemoryQueryRequest):
    facts = _IN_MEMORY_AGENT_FACTS.get(payload.agent_id, [])
    now = datetime.utcnow()
    q_lower = payload.query.lower()

    recalled_facts = []
    for f in facts:
        # Ebbinghaus exponential forgetting curve: R = e^(-decay * elapsed_days / stability)
        elapsed_sec = max(0.0, (now - f["last_accessed_at"]).total_seconds())
        elapsed_days = elapsed_sec / 86400.0
        stability = 1.0 + (f["rehearsal_count"] * 0.8) + (f["importance"] * 0.5)
        retention = math.exp(-0.08 * elapsed_days / stability)

        # Relevance scoring based on query match
        is_relevant = (
            q_lower in f["entity"].lower() or
            q_lower in f["relation"].lower() or
            q_lower in f["value"].lower() or
            (f["context"] and q_lower in f["context"].lower()) or
            len(q_lower.split()) > 0 and any(w in f["entity"].lower() or w in f["value"].lower() for w in q_lower.split())
        )

        if is_relevant and retention >= payload.min_retention:
            # Rehearse accessed fact
            f["rehearsal_count"] += 1
            f["last_accessed_at"] = now

            recalled_facts.append(AgentMemoryFactResponse(
                fact_id=f["fact_id"],
                agent_id=f["agent_id"],
                entity=f["entity"],
                relation=f["relation"],
                value=f["value"],
                retention_score=round(retention, 3),
                rehearsal_count=f["rehearsal_count"],
                created_at=f["created_at"],
                last_accessed_at=f["last_accessed_at"]
            ))

    recalled_facts.sort(key=lambda x: x.retention_score, reverse=True)
    top_facts = recalled_facts[:payload.top_k]

    graph_context = "\n".join(
        f"• [{f.entity}] --({f.relation})--> [{f.value}] (Retention: {f.retention_score * 100:.0f}%, Rehearsals: {f.rehearsal_count})"
        for f in top_facts
    )

    return AgentMemoryRecallResponse(
        agent_id=payload.agent_id,
        facts=top_facts,
        graph_context=graph_context,
        total_recalled=len(top_facts)
    )

# ==============================================================================
# 3. Agent Evaluation & Regression Testing Endpoint (Ragas / TruLens Matrix)
# ==============================================================================
@router.post("/eval", response_model=AgentEvalResponse)
async def evaluate_agent_output(payload: AgentEvalRequest):
    start = time.time()
    ans_words = set(re.findall(r"\w+", payload.answer.lower()))
    q_words = set(re.findall(r"\w+", payload.question.lower()))

    # 1. Answer Relevance: overlap between answer and question keywords
    overlap = len(ans_words.intersection(q_words))
    relevance = min(1.0, max(0.4, (overlap / max(1, len(q_words))) * 1.5))

    # 2. Faithfulness: verify answer content is grounded in provided contexts
    context_words = set(re.findall(r"\w+", " ".join(payload.contexts).lower()))
    if context_words:
        grounded_count = sum(1 for w in ans_words if w in context_words)
        faithfulness = min(1.0, max(0.3, grounded_count / max(1, len(ans_words))))
    else:
        faithfulness = 0.85  # Assume baseline if no context provided

    # 3. Context Recall against Ground Truth
    if payload.ground_truth:
        gt_words = set(re.findall(r"\w+", payload.ground_truth.lower()))
        recall_count = sum(1 for w in gt_words if w in context_words or w in ans_words)
        context_recall = min(1.0, max(0.2, recall_count / max(1, len(gt_words))))
    else:
        context_recall = 0.90

    hallucination_index = round(max(0.0, 1.0 - faithfulness), 3)

    verdict = "PASSED"
    if faithfulness < 0.7 or hallucination_index > 0.3:
        verdict = "FAILED"
    elif faithfulness < 0.82:
        verdict = "FLAGGED"

    eval_ms = (time.time() - start) * 1000

    return AgentEvalResponse(
        faithfulness_score=round(faithfulness, 3),
        answer_relevance_score=round(relevance, 3),
        context_recall_score=round(context_recall, 3),
        hallucination_index=hallucination_index,
        verdict=verdict,
        evaluation_ms=round(eval_ms, 2)
    )

# ==============================================================================
# 4. Model Inference & KV-Cache Profiling Endpoint (vLLM, SGLang, DeepSeek)
# ==============================================================================
@router.post("/inference/profile", response_model=InferenceProfileResponse)
async def calculate_inference_profile(payload: InferenceProfileRequest):
    # Determine bytes per parameter based on KV precision
    prec = payload.kv_precision.upper()
    kv_bytes = 2.0 if prec == "FP16" else (1.0 if prec == "FP8" else 0.5)

    # Standard model architecture heuristics: 70B = 80 layers, 64 heads, 128 head_dim
    layers = 80 if payload.model_params_b >= 60 else (32 if payload.model_params_b >= 14 else 24)
    heads = 64 if payload.model_params_b >= 60 else 32
    head_dim = 128

    # Weights in VRAM: ~2 bytes per param in standard FP16 / 1 byte in FP8
    model_weights_gb = payload.model_params_b * 2.0

    # KV Cache bytes per token = 2 (keys + values) * layers * heads * head_dim * kv_bytes
    kv_cache_per_token_bytes = 2 * layers * heads * head_dim * kv_bytes
    
    # Total KV cache for concurrent requests
    total_tokens = payload.batch_size * payload.context_window
    kv_cache_total_vram_gb = (total_tokens * kv_cache_per_token_bytes) / (1024 ** 3)

    # GPU cluster memory calculation
    gpu_vram_map = {
        "H100-SXM-80GB": 80.0,
        "A100-SXM-80GB": 80.0,
        "H200-SXM-141GB": 141.0,
        "B200-192GB": 192.0,
        "MI300X-192GB": 192.0,
        "RTX-4090-24GB": 24.0
    }
    per_gpu_vram = gpu_vram_map.get(payload.gpu_type, 80.0)
    total_available_vram_gb = per_gpu_vram * payload.gpu_count

    total_vram_required_gb = model_weights_gb + kv_cache_total_vram_gb + 4.0  # +4GB runtime overhead
    memory_headroom_gb = total_available_vram_gb - total_vram_required_gb

    # Max concurrency calculation with PagedAttention (96% memory utilization)
    available_for_kv = max(0.0, total_available_vram_gb - model_weights_gb - 4.0) * 0.96
    max_concurrency = int(available_for_kv / max(0.001, (payload.context_window * kv_cache_per_token_bytes / (1024 ** 3))))

    # Memory bandwidth lookup for TTFT / ITL
    bandwidth_map = {
        "H100-SXM-80GB": 3350.0,  # GB/s
        "A100-SXM-80GB": 2039.0,
        "H200-SXM-141GB": 4800.0,
        "B200-192GB": 8000.0,
        "MI300X-192GB": 5300.0,
        "RTX-4090-24GB": 1008.0
    }
    bandwidth = bandwidth_map.get(payload.gpu_type, 3350.0) * payload.gpu_count
    
    # Latency formulas:
    # TTFT is compute-bound for prefill: approx proportional to context_window / compute
    estimated_ttft_ms = round(12.0 + (payload.context_window / 1000.0) * 2.8, 1)
    # ITL is memory-bandwidth bound: weights / bandwidth
    estimated_itl_ms = round((model_weights_gb / bandwidth) * 1000.0 * 1.3, 1)

    speculative_speedup = 2.45 if payload.speculative_draft_model else None

    return InferenceProfileResponse(
        model_weights_vram_gb=round(model_weights_gb, 2),
        kv_cache_per_token_bytes=round(kv_cache_per_token_bytes, 1),
        kv_cache_total_vram_gb=round(kv_cache_total_vram_gb, 2),
        total_vram_required_gb=round(total_vram_required_gb, 2),
        total_available_vram_gb=round(total_available_vram_gb, 2),
        max_concurrency_capacity=max(1, max_concurrency),
        memory_headroom_gb=round(memory_headroom_gb, 2),
        estimated_ttft_ms=estimated_ttft_ms,
        estimated_itl_ms=estimated_itl_ms,
        speculative_speedup_ratio=speculative_speedup,
        paged_attention_efficiency_pct=96.4
    )

# ==============================================================================
# 5. MCP & Agent-to-Agent (A2A) Interoperability Router Endpoint
# ==============================================================================
@router.post("/a2a/route", response_model=A2AMessageResponse)
async def route_a2a_agent_message(payload: A2AMessageRequest):
    start = time.time()
    msg_id = f"a2a_{uuid.uuid4().hex[:10]}"

    # Deterministic simulation of multi-agent negotiation / tool execution
    agent_capabilities = {
        "sre_orchestrator": ["diagnose_incident", "plan_rollout", "trigger_remediation"],
        "k8s_operator": ["scale_deployment", "cordon_node", "restart_pod"],
        "security_sentinel": ["quarantine_container", "rotate_credentials", "block_ip"],
        "database_dba": ["index_vacuum", "flush_pool", "failover_replica"]
    }

    target_caps = agent_capabilities.get(payload.target_agent_id, ["general_task_execution"])
    
    response_payload = {
        "status": "ACK_RECEIVED",
        "action_executed": payload.action,
        "target_supported_capabilities": target_caps,
        "consensus_term": 4,
        "raft_leader": "sre_orchestrator",
        "result": f"Agent '{payload.target_agent_id}' successfully executed action '{payload.action}' initiated by '{payload.source_agent_id}'."
    }

    latency_ms = (time.time() - start) * 1000

    return A2AMessageResponse(
        message_id=msg_id,
        status="delivered",
        target_agent_id=payload.target_agent_id,
        response_payload=response_payload,
        latency_ms=round(latency_ms, 2)
    )

# ==============================================================================
# 6. AI Gateway Semantic Cache Endpoint
# ==============================================================================
_SEMANTIC_CACHE_STORE: List[Dict[str, Any]] = [
    {
        "query": "how do i rolling restart checkout-api deployment",
        "tokens": {"how", "do", "i", "rolling", "restart", "checkout", "api", "deployment"},
        "response": "Run kubectl rollout restart deployment/checkout-api -n production to perform zero-downtime rolling restart.",
        "tokens_count": 28,
        "key": "cache_k8s_restart"
    },
    {
        "query": "what is the prometheus cpu alert threshold",
        "tokens": {"what", "is", "the", "prometheus", "cpu", "alert", "threshold"},
        "response": "The Prometheus CPU threshold alarm fires when node utilization exceeds 85% for 5 continuous minutes.",
        "tokens_count": 24,
        "key": "cache_prom_cpu"
    },
    {
        "query": "how do i rotate database vault credentials",
        "tokens": {"how", "do", "i", "rotate", "database", "vault", "credentials"},
        "response": "Execute vault write -f transit/keys/prod-db/rotate to roll encryption keys and generate new lease credentials.",
        "tokens_count": 22,
        "key": "cache_vault_rotate"
    }
]

@router.post("/cache/lookup", response_model=SemanticCacheResponse)
async def query_semantic_cache(payload: SemanticCacheRequest):
    start = time.time()
    q_tokens = set(re.findall(r"\w+", payload.query.lower()))
    best_similarity = 0.0
    best_entry = None

    for entry in _SEMANTIC_CACHE_STORE:
        e_tokens = entry["tokens"]
        if not e_tokens or not q_tokens:
            continue
        intersection = len(q_tokens & e_tokens)
        jaccard = intersection / len(q_tokens | e_tokens)
        precision = intersection / len(q_tokens)
        similarity = (precision * 0.7) + (jaccard * 0.3)
        if similarity > best_similarity:
            best_similarity = similarity
            best_entry = entry

    latency_ms = (time.time() - start) * 1000
    is_hit = best_similarity >= payload.similarity_threshold

    if is_hit and best_entry:
        return SemanticCacheResponse(
            hit=True,
            similarity_score=round(best_similarity, 3),
            cached_response=best_entry["response"],
            latency_saved_ms=round(450.0 - latency_ms, 1),
            tokens_saved=best_entry["tokens_count"],
            cache_key=best_entry["key"]
        )

    return SemanticCacheResponse(
        hit=False,
        similarity_score=round(best_similarity, 3),
        cached_response=None,
        latency_saved_ms=0.0,
        tokens_saved=0,
        cache_key=f"miss_{uuid.uuid4().hex[:8]}"
    )

# ==============================================================================
# 7. Fine-Tuning & PEFT / LoRA VRAM Estimator Endpoint
# ==============================================================================
@router.post("/finetune/estimate-vram", response_model=LoRAVRAMEstimateResponse)
async def estimate_lora_vram(payload: LoRAVRAMEstimateRequest):
    prec = payload.precision.upper()
    bytes_per_param = 2.0 if "FP16" in prec else (0.5 if "4BIT" in prec or "QLORA" in prec else 1.0)
    base_model_vram = payload.base_model_params_b * bytes_per_param

    # Approximate layers and hidden dim from parameter count
    layers = 80 if payload.base_model_params_b >= 60 else (32 if payload.base_model_params_b >= 13 else 24)
    hidden_dim = 8192 if payload.base_model_params_b >= 60 else (4096 if payload.base_model_params_b >= 13 else 2048)

    # Trainable LoRA parameters = 2 * rank * hidden_dim * target_modules * layers
    trainable_params = 2 * payload.lora_rank * hidden_dim * payload.target_modules_count * layers
    trainable_m = trainable_params / 1e6
    ratio_pct = (trainable_params / (payload.base_model_params_b * 1e9)) * 100.0

    # Adapter weights in FP16
    adapter_weights_mb = (trainable_params * 2.0) / (1024 ** 2)

    # AdamW 8 bytes per trainable param (FP32 momentums + variances)
    opt_states_gb = (trainable_params * 8.0) / (1024 ** 3)

    # Gradients in FP16 (2 bytes per trainable param)
    grad_gb = (trainable_params * 2.0) / (1024 ** 3)

    # Activations memory with gradient checkpointing
    act_multiplier = 0.25 if payload.gradient_checkpointing else 1.0
    tokens = payload.batch_size * payload.sequence_length
    act_gb = ((tokens * hidden_dim * layers * 2.0) / (1024 ** 3)) * act_multiplier

    # CUDA context & PyTorch workspace reserve (~2.0 GB)
    total_training_vram = base_model_vram + (adapter_weights_mb / 1024.0) + opt_states_gb + grad_gb + act_gb + 2.0
    recommended_gpu_vram = math.ceil(total_training_vram * 1.15)
    fits_24gb = total_training_vram <= 23.5

    return LoRAVRAMEstimateResponse(
        base_model_vram_gb=round(base_model_vram, 2),
        trainable_params_m=round(trainable_m, 2),
        trainable_ratio_pct=round(ratio_pct, 4),
        adapter_weights_vram_mb=round(adapter_weights_mb, 2),
        optimizer_states_vram_gb=round(opt_states_gb, 3),
        gradients_vram_gb=round(grad_gb, 3),
        activations_vram_gb=round(act_gb, 2),
        total_training_vram_gb=round(total_training_vram, 2),
        recommended_min_gpu_vram_gb=recommended_gpu_vram,
        fits_in_single_gpu_24gb=fits_24gb
    )

# ==============================================================================
# 8. AI FinOps & Carbon Footprint Calculation Endpoint
# ==============================================================================
@router.post("/finops/carbon", response_model=FinOpsCarbonResponse)
async def calculate_finops_carbon(payload: FinOpsCarbonRequest):
    pricing_matrix = {
        "gpt-4o": {"prompt": 2.50, "completion": 10.00, "kwh_per_1k": 0.0012},
        "gpt-4o-mini": {"prompt": 0.15, "completion": 0.60, "kwh_per_1k": 0.0002},
        "claude-3-5-sonnet": {"prompt": 3.00, "completion": 15.00, "kwh_per_1k": 0.0014},
        "llama-3.3-70b": {"prompt": 0.35, "completion": 0.40, "kwh_per_1k": 0.0009},
        "deepseek-r1": {"prompt": 0.55, "completion": 2.19, "kwh_per_1k": 0.0011},
        "qwen2.5-coder:7b": {"prompt": 0.05, "completion": 0.10, "kwh_per_1k": 0.0003}
    }

    rates = pricing_matrix.get(payload.model.lower(), {"prompt": 1.00, "completion": 3.00, "kwh_per_1k": 0.0008})

    cost_prompt = (payload.prompt_tokens / 1_000_000.0) * rates["prompt"]
    cost_comp = (payload.completion_tokens / 1_000_000.0) * rates["completion"]
    cost_per_req = cost_prompt + cost_comp
    monthly_cost = cost_per_req * payload.monthly_requests

    monthly_prompt_tok = payload.prompt_tokens * payload.monthly_requests
    monthly_comp_tok = payload.completion_tokens * payload.monthly_requests
    monthly_total_tok = monthly_prompt_tok + monthly_comp_tok

    monthly_kwh = (monthly_total_tok / 1000.0) * rates["kwh_per_1k"]

    region_carbon = {
        "us-east-1": 379.0,    # N. Virginia
        "us-west-2": 82.0,     # Oregon (Hydroelectric)
        "eu-west-1": 295.0,    # Ireland
        "eu-central-1": 338.0, # Frankfurt
        "ap-south-1": 632.0    # Mumbai
    }
    intensity = region_carbon.get(payload.cloud_region.lower(), 350.0)
    co2_grams = monthly_kwh * intensity

    return FinOpsCarbonResponse(
        model=payload.model,
        cost_per_request_usd=round(cost_per_req, 6),
        monthly_cost_usd=round(monthly_cost, 2),
        prompt_tokens_per_month=monthly_prompt_tok,
        completion_tokens_per_month=monthly_comp_tok,
        total_tokens_per_month=monthly_total_tok,
        estimated_kwh_monthly=round(monthly_kwh, 4),
        estimated_co2_grams_monthly=round(co2_grams, 2),
        cloud_region=payload.cloud_region,
        carbon_intensity_gco2_kwh=intensity
    )


