import { describe, it, expect } from 'vitest';
import { Claude37ComputerUseGenerator } from '../src/js/generators/claude-37-computer-use-gen.js';

describe('Claude37ComputerUseGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new Claude37ComputerUseGenerator();
    expect(generator.name).toBe('Claude 3.7 Computer Use Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate valid Claude 3.7 Computer Use 2.0 tool spec', () => {
    const generator = new Claude37ComputerUseGenerator();
    const result = generator.generate({
      resolution: '1920x1080',
      thinkingBudget: 8192,
      validation: 'dangerous_only',
      format: 'png_lossless'
    });

    expect(result.model).toBe('claude-3-7-sonnet-20260228');
    expect(result.thinking.type).toBe('enabled');
    expect(result.thinking.budget_tokens).toBe(8192);
    expect(result.tools[0].type).toBe('computer_20260201');
    expect(result.tools[0].display_width_px).toBe(1920);
    expect(result.tools[0].display_height_px).toBe(1080);
    expect(result.safetyGuardrails.humanInTheLoopPolicy).toBe('dangerous_only');
  });

  it('should generate python operator loop script', () => {
    const generator = new Claude37ComputerUseGenerator();
    const script = generator.generateOperatorLoopScript();
    expect(script).toContain('def execute_computer_action');
    expect(script).toContain('pyautogui.click()');
    expect(script).toContain('pyautogui.screenshot()');
  });
});
