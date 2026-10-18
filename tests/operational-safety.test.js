import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('P1 — Operational Safety & Infrastructure Governance', () => {
  it('tools/index.html should not suggest terraform apply -auto-approve in runbooks', () => {
    const htmlText = fs.readFileSync(path.resolve(__dirname, '../tools/index.html'), 'utf8');
    expect(htmlText).not.toContain('terraform apply -auto-approve');
    expect(htmlText).toContain('terraform plan -out=reconcile.tfplan');
    expect(htmlText).toContain('terraform apply reconcile.tfplan');
  });

  it('AI/index.html should not suggest terraform apply -auto-approve in runbooks', () => {
    const htmlText = fs.readFileSync(path.resolve(__dirname, '../AI/index.html'), 'utf8');
    expect(htmlText).not.toContain('terraform apply -auto-approve');
    expect(htmlText).toContain('terraform plan -out=reconcile.tfplan');
    expect(htmlText).toContain('terraform apply reconcile.tfplan');
  });

  it('script.js terminal simulation should not run terraform apply -auto-approve', () => {
    const scriptText = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    expect(scriptText).not.toContain('terraform apply -auto-approve');
    expect(scriptText).toContain('terraform apply reconcile.tfplan');
  });

  it('terraform-drift-gen.js should use safe plan artifact generation', () => {
    const code = fs.readFileSync(path.resolve(__dirname, '../src/js/generators/terraform-drift-gen.js'), 'utf8');
    expect(code).not.toContain('terraform apply -auto-approve');
    expect(code).toContain('terraform plan -out=drift_reconcile.tfplan');
    expect(code).toContain('terraform apply -input=false drift_reconcile.tfplan');
  });

  it('github-provisioning-guide should not run terraform apply -auto-approve', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../tools/github-provisioning-guide/index.html'), 'utf8');
    expect(html).not.toContain('terraform apply -auto-approve');
  });
});
