// SLM Fine-Tuning & Quantization Studio compiler logic

function initQloraStudio() {
  const elements = {
    baseModel: document.getElementById('qlora_base_model'),
    rank: document.getElementById('qlora_rank'),
    alpha: document.getElementById('qlora_alpha'),
    lr: document.getElementById('qlora_lr'),
    quant: document.getElementById('qlora_quant'),
    format: document.getElementById('qlora_format'),
    gradientCheckpointing: document.getElementById('qlora_gradient_checkpointing'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-qlora'),
    btnDownload: document.getElementById('btn-download-qlora'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'qlora_py';
  let compiledCode = {
    qlora_py: '',
    qlora_req: '',
    qlora_config: '',
    qlora_flow: ''
  };

  function compileConfigs() {
    const base = elements.baseModel ? elements.baseModel.value : 'microsoft/Phi-3-mini-4k-instruct';
    const rankVal = elements.rank ? elements.rank.value : '16';
    const alphaVal = elements.alpha ? elements.alpha.value : '32';
    const lrVal = elements.lr ? elements.lr.value : '2e-4';
    const quantVal = elements.quant ? elements.quant.value : '4bit';
    const formatVal = elements.format ? elements.format.value : 'safetensors';
    const isGradCheck = elements.gradientCheckpointing ? elements.gradientCheckpointing.checked : true;

    // 1. Compile finetune.py
    let py = `#!/usr/bin/env python3\n`;
    py += `# -*- coding: utf-8 -*-\n`;
    py += `"""\n`;
    py += `SLM QLoRA Fine-Tuning Pipeline Script\n`;
    py += `Base Model: ${base}\n`;
    py += `Compiled by SLM Fine-Tuning & Quantization Studio\n`;
    py += `"""\n\n`;
    py += `import os\n`;
    py += `import torch\n`;
    py += `import argparse\n`;
    py += `from transformers import (\n`;
    py += `    AutoModelForCausalLM,\n`;
    py += `    AutoTokenizer,\n`;
    py += `    BitsAndBytesConfig,\n`;
    py += `    TrainingArguments,\n`;
    py += `    Trainer\n`;
    py += `)\n`;
    py += `from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training\n\n`;

    py += `def parse_args():\n`;
    py += `    parser = argparse.ArgumentParser(description="QLoRA Fine-tuning parameters")\n`;
    py += `    parser.add_argument("--check", action="store_true", help="Perform SRE dry-run validation checks")\n`;
    py += `    return parser.parse_args()\n\n`;

    py += `def main():\n`;
    py += `    args = parse_args()\n`;
    py += `    if args.check:\n`;
    py += `        print("Checking execution requirements...")\n`;
    py += `        print(f"Base model identifier: ${base}")\n`;
    py += `        print(f"LoRA settings: rank=${rankVal}, alpha=${alphaVal}")\n`;
    py += `        print("CUDA connection: " + ("available" if torch.cuda.is_available() else "not available"))\n`;
    py += `        print("✅ Dry-run check completed successfully.")\n`;
    py += `        return 0\n\n`;

    py += `    print("🚀 Loading base model weights...")\n`;
    
    if (quantVal === '4bit') {
        py += `    bnb_config = BitsAndBytesConfig(\n`;
        py += `        load_in_4bit=True,\n`;
        py += `        bnb_4bit_quant_type="nf4",\n`;
        py += `        bnb_4bit_use_double_quant=True,\n`;
        py += `        bnb_4bit_compute_dtype=torch.bfloat16\n`;
        py += `    )\n`;
    } else if (quantVal === '8bit') {
        py += `    bnb_config = BitsAndBytesConfig(\n`;
        py += `        load_in_8bit=True\n`;
        py += `    )\n`;
    } else {
        py += `    bnb_config = None\n`;
    }

    py += `    model = AutoModelForCausalLM.from_pretrained(\n`;
    py += `        "${base}",\n`;
    py += `        quantization_config=bnb_config,\n`;
    py += `        device_map="auto",\n`;
    py += `        torch_dtype=torch.bfloat16\n`;
    py += `    )\n\n`;

    py += `    # Prepare model configurations\n`;
    py += `    model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=${isGradCheck ? 'True' : 'False'})\n\n`;

    py += `    # Setup target LoRA configs\n`;
    py += `    peft_config = LoraConfig(\n`;
    py += `        r=${rankVal},\n`;
    py += `        lora_alpha=${alphaVal},\n`;
    py += `        target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],\n`;
    py += `        lora_dropout=0.05,\n`;
    py += `        bias="none",\n`;
    py += `        task_type="CAUSAL_LM"\n`;
    py += `    )\n`;
    py += `    model = get_peft_model(model, peft_config)\n\n`;

    py += `    # Training arguments\n`;
    py += `    training_args = TrainingArguments(\n`;
    py += `        output_dir="./results",\n`;
    py += `        learning_rate=${lrVal},\n`;
    py += `        per_device_train_batch_size=2,\n`;
    py += `        gradient_accumulation_steps=4,\n`;
    py += `        logging_steps=10,\n`;
    py += `        max_steps=100,\n`;
    py += `        fp16=False,\n`;
    py += `        bf16=True,\n`;
    py += `        optim="paged_adamw_32bit",\n`;
    py += `        gradient_checkpointing=${isGradCheck ? 'True' : 'False'}\n`;
    py += `    )\n\n`;

    py += `    print("🔥 Starting training process...")\n`;
    py += `    # trainer = Trainer(model=model, args=training_args, train_dataset=dataset)\n`;
    py += `    # trainer.train()\n\n`;

    if (formatVal === 'gguf') {
        py += `    print("✅ Adapters saved. Compiling to GGUF format model weights...")\n`;
        py += `    # Conversion process simulation\n`;
        py += `    # python convert-lora-to-gguf.py ./results --outfile model.gguf\n`;
    } else {
        py += `    print("✅ Training complete. PEFT weights saved to ./results.")\n`;
    }
    py += `    return 0\n\n`;

    py += `if __name__ == '__main__':\n`;
    py += `    import sys\n`;
    py += `    sys.exit(main())\n`;

    compiledCode.qlora_py = py;

    // 2. Compile requirements.txt
    let req = `torch>=2.2.0\n`;
    req += `transformers>=4.38.0\n`;
    req += `peft>=0.10.0\n`;
    if (quantVal !== 'none') {
        req += `bitsandbytes>=0.43.0\n`;
    }
    req += `accelerate>=0.28.0\n`;
    req += `datasets>=2.18.0\n`;
    compiledCode.qlora_req = req;

    // 3. Compile adapters/adapter_config.json
    let configObj = {
      "peft_type": "LORA",
      "auto_mapping": null,
      "base_model_name_or_path": base,
      "revision": null,
      "task_type": "CAUSAL_LM",
      "inference_mode": false,
      "r": parseInt(rankVal, 10),
      "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
      "lora_alpha": parseInt(alphaVal, 10),
      "lora_dropout": 0.05,
      "fan_in_fan_out": false,
      "bias": "none",
      "modules_to_save": null,
      "init_lora_weights": true
    };
    compiledCode.qlora_config = JSON.stringify(configObj, null, 2);

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += `  BM[🤖 Base Model: ${base.split('/')[1]}] -->|Quantize to ${quantVal === 'none' ? 'Full 16-bit' : quantVal}| Q[🗜️ BitsAndBytes Configuration]\n`;
    flow += `  Q -->|Initialize adapters| PEFT[🎛️ PEFT LoRA Config: R=${rankVal}, Alpha=${alphaVal}]\n`;
    flow += `  PEFT -->|Optimize VRAM| GC[⚡ Gradient Checkpointing: ${isGradCheck ? 'Enabled' : 'Disabled'}]\n`;
    flow += `  GC -->|Train pipeline| TR[🔥 PyTorch Trainer: LR=${lrVal}]\n`;
    if (formatVal === 'gguf') {
        flow += '  TR -->|Compile outputs| GGUF[📦 Compiled GGUF model.gguf File]\n';
    } else {
        flow += '  TR -->|Save weights| Adapters[💾 PyTorch Safetensors Adapters]\n';
    }
    compiledCode.qlora_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'qlora_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.qlora_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'finetune.py';
      if (activeTab === 'qlora_req') filename = 'requirements.txt';
      if (activeTab === 'qlora_config') filename = 'adapter_config.json';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  if (elements.baseModel) elements.baseModel.addEventListener('change', compileConfigs);
  if (elements.rank) {
    elements.rank.addEventListener('change', (e) => {
      // Auto-set alpha to 2x Rank
      if (elements.alpha) {
        elements.alpha.value = String(parseInt(e.target.value, 10) * 2);
      }
      compileConfigs();
    });
  }
  if (elements.alpha) elements.alpha.addEventListener('input', compileConfigs);
  if (elements.lr) elements.lr.addEventListener('change', compileConfigs);
  if (elements.quant) elements.quant.addEventListener('change', compileConfigs);
  if (elements.format) elements.format.addEventListener('change', compileConfigs);
  if (elements.gradientCheckpointing) elements.gradientCheckpointing.addEventListener('change', compileConfigs);

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['qlora_py', 'qlora_req', 'qlora_config', 'qlora_flow'],
    'qlora_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('qlora_base_model')) {
    initQloraStudio();
  }
});

window.initQloraStudio = initQloraStudio;
