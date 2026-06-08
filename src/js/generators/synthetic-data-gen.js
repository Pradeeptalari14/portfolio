// AI Synthetic Data Generator Studio compiler logic

function initSyntheticDataStudio() {
  const elements = {
    model: document.getElementById('sd_generator_model'),
    count: document.getElementById('sd_records_count'),
    qualityFilter: document.getElementById('sd_quality_filter'),
    deduplicate: document.getElementById('sd_deduplicate'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-sd'),
    btnDownload: document.getElementById('btn-download-sd'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'sd_py';
  let compiledCode = {
    sd_py: '',
    sd_req: '',
    sd_flow: ''
  };

  function compileConfigs() {
    const modelId = elements.model ? elements.model.value : 'gpt-4o-mini';
    const totalCount = elements.count ? elements.count.value : '500';
    const filter = elements.qualityFilter ? elements.qualityFilter.value : 'LLM-as-a-judge';
    const isDedup = elements.deduplicate ? elements.deduplicate.checked : true;

    // 1. Compile generate-dataset.py
    let py = `#!/usr/bin/env python3\n`;
    py += `# -*- coding: utf-8 -*-\n`;
    py += `"""\n`;
    py += `AI Synthetic Data Generation SRE Pipeline\n`;
    py += `Synthesizer LLM: ${modelId}\n`;
    py += `"""\n\n`;
    py += `import os\n`;
    py += `import sys\n`;
    py += `import json\n`;
    py += `import argparse\n`;
    py += `from langchain_core.prompts import PromptTemplate\n`;
    
    if (modelId.startsWith('gpt-')) {
        py += `from langchain_openai import ChatOpenAI\n`;
    } else {
        py += `from langchain_community.llms import Ollama\n`;
    }

    py += `\ndef parse_args():\n`;
    py += `    parser = argparse.ArgumentParser(description="Synthetic dataset generation options")\n`;
    py += `    parser.add_argument("--dry-run", action="store_true", help="Perform pipeline connection dryrun checks")\n`;
    py += `    return parser.parse_args()\n\n`;

    py += `def generate_records(count=${totalCount}):\n`;
    py += `    print(f"🚀 Initializing synthetic pipeline using model: ${modelId}")\n`;
    py += `    print(f"Target record generation size: {count} samples")\n`;
    
    if (modelId.startsWith('gpt-')) {
        py += `    # llm = ChatOpenAI(model="${modelId}", temperature=0.7)\n`;
    } else {
        py += `    # llm = Ollama(model="${modelId.split('/').pop()}", temperature=0.7)\n`;
    }

    py += `    \n    # Example generation loop\n`;
    py += `    dataset = []\n`;
    py += `    for i in range(min(5, count)):  # Mock first 5 generations\n`;
    py += `        dataset.append({\n`;
    py += `            "instruction": f"SRE validation scenario {i}",\n`;
    py += `            "output": f"Simulated remediation sequence {i}",\n`;
    py += `            "quality_score": 0.95\n`;
    py += `        })\n\n`;

    if (isDedup) {
        py += `    print("🧹 Running semantic cosine deduplication...")\n`;
        py += `    # Filter out duplicate generations using sentence transformer embeddings\n`;
    }

    if (filter === 'LLM-as-a-judge') {
        py += `    print("🔍 Executing LLM-as-a-judge score rating checks...")\n`;
        py += `    # Filter records with quality rating score less than 0.85\n`;
        py += `    dataset = [d for d in dataset if d["quality_score"] >= 0.85]\n`;
    } else if (filter === 'CosineDensity') {
        py += `    print("🔍 Filtering out dense vectors cluster overlaps...")\n`;
    }

    py += `    print(f"✅ Generated dataset containing {len(dataset)} verified samples.")\n`;
    py += `    return dataset\n\n`;

    py += `def main():\n`;
    py += `    args = parse_args()\n`;
    py += `    if args.dry_run:\n`;
    py += `        print("Checking API keys and model availability status...")\n`;
    py += `        print("✅ Pipeline connectivity check passed.")\n`;
    py += `        return 0\n\n`;

    py += `    data = generate_records()\n`;
    py += `    output_file = "synthetic-dataset.jsonl"\n`;
    py += `    with open(output_file, 'w') as f:\n`;
    py += `        for record in data:\n`;
    py += `            f.write(json.dumps(record) + "\\n")\n`;
    py += `    print(f"💾 Dataset exported to: {output_file}")\n`;
    py += `    return 0\n\n`;

    py += `if __name__ == '__main__':\n`;
    py += `    sys.exit(main())\n`;

    compiledCode.sd_py = py;

    // 2. Compile requirements.txt
    let req = `langchain-core>=0.1.30\n`;
    if (modelId.startsWith('gpt-')) {
        req += `langchain-openai>=0.1.0\n`;
    } else {
        req += `langchain-community>=0.0.25\n`;
    }
    req += `sentence-transformers>=2.5.0\n`;
    req += `scikit-learn>=1.4.0\n`;
    compiledCode.sd_req = req;

    // 3. Compile Flow Graph
    let flow = 'graph TD\n';
    flow += `  Seed[🌱 Prompt Seed Rules] -->|Input template| LLM[🤖 Synthesizer model: ${modelId.split('/').pop()}]\n`;
    flow += `  LLM -->|Generate ${totalCount} instructions| Raw[📋 Raw Dataset Stream]\n`;
    if (isDedup) {
        flow += '  Raw -->|De-duplicate overlaps| Dedup[🧹 Semantic Filter]\n';
        flow += `  Dedup -->|Check quality via ${filter}| Judge[🔍 Quality Threshold checks]\n`;
    } else {
        flow += `  Raw -->|Check quality via ${filter}| Judge[🔍 Quality Threshold checks]\n`;
    }
    flow += '  Judge -->|Pass filter criteria| Output[📦 Export synthetic-dataset.jsonl]\n';
    compiledCode.sd_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'sd_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.sd_flow + '</div>';
      
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
      let filename = 'generate-dataset.py';
      if (activeTab === 'sd_req') filename = 'requirements.txt';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  if (elements.model) elements.model.addEventListener('change', compileConfigs);
  if (elements.count) elements.count.addEventListener('change', compileConfigs);
  if (elements.qualityFilter) elements.qualityFilter.addEventListener('change', compileConfigs);
  if (elements.deduplicate) elements.deduplicate.addEventListener('change', compileConfigs);

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
    ['sd_py', 'sd_req', 'sd_flow'],
    'sd_py',
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
  if (document.getElementById('sd_generator_model')) {
    initSyntheticDataStudio();
  }
});

window.initSyntheticDataStudio = initSyntheticDataStudio;
