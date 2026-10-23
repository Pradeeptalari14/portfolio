#!/usr/bin/env node
/**
 * Generates the engineer-role plugins under plugins/engineers/ from the role
 * definitions in scripts/data/engineer-roles/*.js.
 *
 * Output per role (Claude Code / Cowork plugin layout):
 *   <plugin>/.claude-plugin/plugin.json
 *   <plugin>/README.md
 *   <plugin>/skills/<skill>/SKILL.md
 *   <plugin>/commands/<command>.md
 *
 * The script is idempotent: running it again rewrites identical files.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data', 'engineer-roles');
const outDir = path.join(rootDir, 'plugins', 'engineers');
const VERSION = '1.0.0';
const AUTHOR = 'Talari Pradeep';

function loadRoles() {
  return fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith('.js'))
    .sort()
    .flatMap((f) => require(path.join(dataDir, f)));
}

const titleCase = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const yamlQuote = (s) => JSON.stringify(String(s));
const bullet = (items) => items.map((i) => `- ${i}`).join('\n');
const numbered = (items) => items.map((s, i) => `${i + 1}. ${s}`).join('\n');
const checklist = (items) => items.map((i) => `- [ ] ${i}`).join('\n');

function renderSkill(role, skill) {
  return `---
name: ${skill.name}
description: ${yamlQuote(skill.description)}
---

# ${titleCase(skill.name)}

> Part of the **${role.title}** plugin (\`${role.plugin}\`).

## When to use

${bullet(skill.when)}

## Workflow

${numbered(skill.steps)}

## Quality checklist

${checklist(skill.checks)}

## Output format

\`\`\`markdown
${skill.output.join('\n')}
\`\`\`

## Common pitfalls

${bullet(skill.pitfalls)}

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
`;
}

function renderCommand(role, cmd) {
  return `---
description: ${yamlQuote(cmd.description)}
argument-hint: ${yamlQuote(cmd.hint)}
---

# /${role.plugin}:${cmd.name}

${cmd.description}.

## Usage

\`\`\`
/${role.plugin}:${cmd.name} $ARGUMENTS
\`\`\`

## Steps

${numbered(cmd.steps)}

## Output

${cmd.output}

If the input is missing or ambiguous, ask one focused question before continuing.
`;
}

function renderReadme(role) {
  const skills = role.skills
    .map((s) => `| \`${s.name}\` | ${s.description.split(/ Trigger with /)[0].replace(/\.$/, '')} |`)
    .join('\n');
  const cmds = role.commands
    .map((c) => `| \`/${role.plugin}:${c.name}\` | ${c.description} |`)
    .join('\n');
  return `# ${role.icon} ${role.title}

${role.summary}

**Group:** ${role.group}  
**Typical tools:** ${role.tools.join(', ')}

## Real-World Production Scenario & Impact

- **Production Scenario:** ${role.realWorldScenario || 'Real-time incident response and architectural delivery.'}
- **Measurable Business Gain:** ${role.businessGain || 'Improved reliability and reduced toil.'}

## Connected Platform Ecosystem

- **Interactive Studio / Lab:** [${role.studioName || 'Developer Studio'}](https://talaripradeep.info${role.studioLink || '/studios/'})
- **Hands-On Learn Drill:** [${role.learnTopic || 'Learning Lab'}](https://talaripradeep.info${role.learnLink || '/studios/learn/'})
- **Visual Architecture Flow:** [${role.flowName || 'Architecture Flow'}](https://talaripradeep.info${role.flowLink || '/studios/flow/'})
- **Production Repository:** [${role.projectRepo || 'Pradeeptalari14/portfolio'}](https://github.com/${role.projectRepo || 'Pradeeptalari14/portfolio'})

## Skills

Claude applies these automatically when the conversation matches their triggers.

| Skill | Purpose |
|-------|---------|
${skills}

## Commands

| Command | Purpose |
|---------|---------|
${cmds}

## Install

\`\`\`
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install ${role.plugin}@talari-engineering-plugins
\`\`\`

## Customise

These are generic starting points. Add your own terminology, tool names, severity
definitions and runbook links to the skill files so the guidance matches your team.
`;
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\r\n/g, '\n'), 'utf8');
}

function validate(roles) {
  const errors = [];
  const plugins = new Set();
  for (const r of roles) {
    if (plugins.has(r.plugin)) errors.push(`duplicate plugin ${r.plugin}`);
    plugins.add(r.plugin);
    if (!r.skills || r.skills.length < 2) errors.push(`${r.plugin}: needs at least 2 skills`);
    if (!r.commands || r.commands.length < 2) errors.push(`${r.plugin}: needs at least 2 commands`);
    for (const s of r.skills || []) {
      for (const k of ['name', 'description', 'when', 'steps', 'checks', 'output', 'pitfalls']) {
        if (!s[k] || (Array.isArray(s[k]) && !s[k].length)) errors.push(`${r.plugin}/${s.name || '?'}: missing ${k}`);
      }
    }
    for (const c of r.commands || []) {
      for (const k of ['name', 'description', 'hint', 'steps', 'output']) {
        if (!c[k] || (Array.isArray(c[k]) && !c[k].length)) errors.push(`${r.plugin}/${c.name || '?'}: missing ${k}`);
      }
    }
  }
  return errors;
}

function main() {
  const roles = loadRoles();
  const errors = validate(roles);
  if (errors.length) {
    console.error('Role data validation failed:\n  ' + errors.join('\n  '));
    process.exit(1);
  }

  // Remove stale generated plugins so renamed or removed roles do not linger.
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });

  for (const role of roles) {
    const base = path.join(outDir, role.plugin);
    const manifest = {
      name: role.plugin,
      version: VERSION,
      description: `${role.title}: ${role.summary}`,
      author: { name: AUTHOR },
      keywords: [role.id, ...role.tools.map((t) => t.toLowerCase().replace(/\s+/g, '-'))]
    };
    write(path.join(base, '.claude-plugin', 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
    write(path.join(base, 'README.md'), renderReadme(role));
    for (const s of role.skills) write(path.join(base, 'skills', s.name, 'SKILL.md'), renderSkill(role, s));
    for (const c of role.commands) write(path.join(base, 'commands', `${c.name}.md`), renderCommand(role, c));
  }

  const skillCount = roles.reduce((n, r) => n + r.skills.length, 0);
  const cmdCount = roles.reduce((n, r) => n + r.commands.length, 0);
  console.log(`Generated ${roles.length} engineer plugins (${skillCount} skills, ${cmdCount} commands) in plugins/engineers/`);
}

main();
