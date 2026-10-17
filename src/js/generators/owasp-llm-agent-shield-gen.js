/**
 * OwaspLlmAgentShieldGenerator
 * Automated configuration generator for OWASP Top 10 for LLMs & AI Agent Shield Studio.
 */
export class OwaspLlmAgentShieldGenerator {
  constructor() {
    this.name = 'OWASP Top 10 for LLMs & AI Agent Shield Studio';
    this.version = '1.0.0';
  }

  defaultConfig() {
    return {
      environment: 'production',
      enforcementMode: 'strict',
      targetRepository: 'Pradeeptalari14/tp-owasp-llm-agent-shield',
      manifest: 'guardrails-config.yaml'
    };
  }

  generate(config = {}) {
    const merged = Object.assign(this.defaultConfig(), config);
    return {
      studio: 'owasp-llm-agent-shield',
      timestamp: new Date().toISOString(),
      config: merged,
      compiledOutput: `# OWASP Top 10 for LLMs & AI Agent Shield Studio
# Environment: ${merged.environment} | Mode: ${merged.enforcementMode}
guardrails:
  version: "2.0"
  owaspCompliance:
    llm01_prompt_injection:
      classifier: "meta-llama/Llama-Guard-3-8B"
      action: "BLOCK_AND_LOG"
    llm02_insecure_output:
      sanitizer: "html-escape-strict"
    llm06_sensitive_info:
      masking: "PII_REGEX_ENTITIES"
    llm08_tool_hijacking:
      humanInTheLoop: true
      sandbox: "gVisor"`
    };
  }

  async scanPrompt(prompt, options = {}) {
    if (typeof window !== 'undefined' && window.StudioSDK) {
      return await window.StudioSDK.scanPromptGuardrails(prompt, options);
    }
    // Safe client fallback
    const lower = (prompt || '').toLowerCase();
    const hasInjection = /ignore\s+previous\s+instructions|system\s+prompt|reveal\s+instructions|you\s+are\s+now\s+dan|developer\s+mode/i.test(lower);
    const hasToolHijack = /bash|exec|rm\s+-rf|curl.*\|\s*sh|chmod\s+777|system\(|popen\(/i.test(lower);
    const hasPii = /\b\d{3}-\d{2}-\d{4}\b|sk-[a-zA-Z0-9]{20,}/i.test(prompt);

    const categories = [];
    if (hasInjection) categories.push('LLM01: Prompt Injection / Jailbreak');
    if (hasToolHijack) categories.push('LLM08: Excessive Agency / Insecure Tool Hijacking');
    if (hasPii) categories.push('LLM06: Sensitive Information Disclosure');

    let sanitized = prompt
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
      .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_API_KEY]');

    const isSafe = !hasInjection && !hasToolHijack;
    const riskScore = hasInjection && hasToolHijack ? 0.98 : (hasInjection || hasToolHijack ? 0.88 : (hasPii ? 0.45 : 0.05));

    return {
      is_safe: isSafe,
      risk_score: riskScore,
      action: isSafe ? (hasPii ? 'ALLOW_SANITIZED' : 'ALLOW') : 'BLOCK_AND_LOG',
      triggered_categories: categories,
      sanitized_prompt: sanitized,
      latency_ms: 12
    };
  }
}
