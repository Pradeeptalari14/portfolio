// AI Rules Customizer Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initAiRulesCustomizer() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const assistantType = $('assistant_type');
  const techStack = $('tech_stack');
  const codingStyle = $('coding_style');
  const commentStyle = $('comment_style');

  const guardNoPlaceholders = $('guard_no_placeholders');
  const guardNoAny = $('guard_no_any');
  const guardUnitTests = $('guard_unit_tests');
  const guardOwasp = $('guard_owasp');

  const customRules = $('custom_rules');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Inputs & Outputs
  const promptInput = $('prompt_input');
  const runSimBtn = $('run-sim-btn');
  const simStandardOutput = $('sim-standard-output');
  const simConstrainedOutput = $('sim-constrained-output');

  function compileRules() {
    if (!assistantType) return;
    const assistant = assistantType.value;
    const stack = techStack.value;
    const style = codingStyle.value;
    const comments = commentStyle.value;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    // Build constraints summary
    let constraints = [];
    if (guardNoPlaceholders.checked) constraints.push("- NEVER write placeholder comments, incomplete snippets, or TODOs. All files must be fully implemented.");
    if (guardNoAny.checked) constraints.push("- Enforce strict TypeScript typing. Do not use generic 'any' or fallback casting types.");
    if (guardUnitTests.checked) constraints.push("- Always accompany logic functions with companion testing script units using modern frameworks.");
    if (guardOwasp.checked) constraints.push("- Restrict unsafe operations, sanitize inputs to prevent injections, and enforce secure package defaults.");

    const userRules = customRules.value.trim() ? `- ${customRules.value.trim().split('\n').join('\n- ')}` : '';

    if (activeTab === 'tab-config') {
      if (assistant === 'cursor') {
        downloadNameInput.value = '.cursorrules';
        outputBox.textContent = generateCursorRules(stack, style, comments, constraints, userRules);
      } else if (assistant === 'copilot') {
        downloadNameInput.value = 'copilot-instructions.md';
        outputBox.textContent = generateCopilotInstructions(stack, style, comments, constraints, userRules);
      } else {
        downloadNameInput.value = 'system_prompt.txt';
        outputBox.textContent = generateSystemPrompt(stack, style, comments, constraints, userRules);
      }
    } else if (activeTab === 'tab-system') {
      downloadNameInput.value = 'system_prompt.txt';
      outputBox.textContent = generateSystemPrompt(stack, style, comments, constraints, userRules);
    }

    renderSimulationOutputs();
  }

  function generateCursorRules(stack, style, comments, constraints, userRules) {
    return `{
  "instruction": "You are a senior staff engineer specializing in ${stack} architecture. Align your generations with these strict guardrails:",
  "style": "${style} patterns with ${comments} documentation.",
  "rules": [
    ${constraints.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',\n    ')}
  ],
  "custom": "${userRules.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
}`;
  }

  function generateCopilotInstructions(stack, style, comments, constraints, userRules) {
    return `# GitHub Copilot Rules
# Place in repository root under .github/copilot-instructions.md

You are an expert developer specializing in **${stack}**.

## Coding Standards
- Style paradigm: Use **${style}** architecture paradigms.
- Comment strategy: Provide **${comments}** conventions.

## Strict System Constraints
${constraints.join('\n')}

${userRules ? `## Custom Rules\n${userRules}` : ''}
`;
  }

  function generateSystemPrompt(stack, style, comments, constraints, userRules) {
    return `System Instruction:
You are a software engineer specializing in ${stack} code architectures.
For all requests, follow these paradigms:
1. Programming Paradigm: ${style}
2. Commenting Rules: ${comments}

Constraints Checklist:
${constraints.join('\n')}

${userRules ? `Additional Directives:\n${userRules}` : ''}
`;
  }

  function renderSimulationOutputs() {
    if (!promptInput || !simStandardOutput || !simConstrainedOutput) return;

    const request = promptInput.value.trim() || 'Write a database query';
    const stack = techStack.value;

    let standard = '';
    let constrained = '';

    if (stack === 'nextjs') {
      standard = `// simple fetch query\nfunction fetchUsers() {\n  return fetch('/api/users')\n    .then(r => r.json());\n}`;
      constrained = `/**\n * Fetches user profile telemetry details under secure authentication tokens.\n */\nexport interface UserRecord {\n  id: string;\n  name: string;\n  status: 'active' | 'suspended';\n}\n\nexport async function fetchUsersSecurely(): Promise<UserRecord[]> {\n  const res = await fetch('/api/users', {\n    method: 'GET',\n    headers: {\n      'Accept': 'application/json',\n      'Content-Type': 'application/json'\n    }\n  });\n\n  if (!res.ok) {\n    throw new Error(\`Network response fetch failure. Status: \${res.status}\`);\n  }\n  const data = await res.json();\n  return data as UserRecord[];\n}`;
    } else if (stack === 'fastapi') {
      standard = `# simple flask/fastapi query\n@app.get("/users")\ndef get_users():\n    return db.query("SELECT * FROM users")`;
      constrained = `from fastapi import APIRouter, Depends, HTTPException, status\nfrom sqlalchemy.orm import Session\nfrom pydantic import BaseModel, EmailStr\n\nrouter = APIRouter()\n\nclass UserOut(BaseModel):\n    id: int\n    email: EmailStr\n    is_active: bool\n\n    class Config:\n        from_attributes = True\n\n@router.get("/users", response_model=list[UserOut], status_code=status.HTTP_200_OK)\ndef read_active_users(db: Session = Depends(get_db_session)):\n    """\n    Reads active users with dependency injection query patterns.\n    """\n    users = db.query(User).filter(User.is_active == True).all()\n    if not users:\n        raise HTTPException(status_code=404, detail="No users currently active")\n    return users`;
    } else {
      standard = `// Generic query\nfunction runQuery(sql) {\n  db.execute(sql);\n}`;
      constrained = `// Robust database connector\nimport { Pool } from 'pg';\n\nconst pool = new Pool();\n\nexport async function querySecure(text: string, params: any[]): Promise<any[]> {\n  if (!text.toLowerCase().includes('select')) {\n    throw new Error('Unauthorized operational mutation command rejected.');\n  }\n  const client = await pool.connect();\n  try {\n    const res = await client.query(text, params);\n    return res.rows;\n  } finally {\n    client.release();\n  }\n}`;
    }

    simStandardOutput.textContent = standard;
    simConstrainedOutput.textContent = constrained;
  }

  // Event Listeners
  [assistantType, techStack, codingStyle, commentStyle,
   guardNoPlaceholders, guardNoAny, guardUnitTests, guardOwasp].forEach(el => {
    if (el) {
      el.addEventListener('change', compileRules);
      el.addEventListener('input', compileRules);
    }
  });

  if (customRules) {
    customRules.addEventListener('input', compileRules);
  }

  if (runSimBtn) {
    runSimBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderSimulationOutputs();
    });
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'system') {
      const tab = $('tab-system');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileRules();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Trigger initial compile
  compileRules();
}

if (document.readyState !== 'loading') {
  initAiRulesCustomizer();
} else {
  document.addEventListener('DOMContentLoaded', initAiRulesCustomizer);
}
