import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Interview Vault & Studios Q&A Enrichment Verification', () => {
  const topicsJsonPath = path.resolve(__dirname, '../interview/topics.json');
  const interviewHtmlPath = path.resolve(__dirname, '../interview/index.html');
  const studiosLearnHtmlPath = path.resolve(__dirname, '../studios/learn/index.html');

  const topicsData = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8'));
  const interviewHtml = fs.readFileSync(interviewHtmlPath, 'utf8');
  const studiosLearnHtml = fs.readFileSync(studiosLearnHtmlPath, 'utf8');

  it('1. should contain at least 37 topics and 490+ interview questions in topics.json', () => {
    let totalTopics = 0;
    let totalQuestions = 0;

    for (const pillar of Object.values(topicsData)) {
      for (const topic of Object.values(pillar.topics || {})) {
        totalTopics++;
        totalQuestions += (topic.interview || []).length;
      }
    }

    expect(totalTopics).toBeGreaterThanOrEqual(37);
    expect(totalQuestions).toBeGreaterThanOrEqual(490);
  });

  it('2. should contain all 8 new studio and modern architecture topics under tools.topics', () => {
    const toolsTopics = topicsData.tools.topics;
    const requiredKeys = [
      'studio_sync',
      'developer_studios_engine',
      'claude_plugins_marketplace',
      'vllm_inference_serving',
      'enterprise_rag_retrieval',
      'agentic_swarms_mcp',
      'ebpf_continuous_profiling',
      'cloud_finops_reclamation',
      'database_reliability_patroni'
    ];

    for (const key of requiredKeys) {
      expect(toolsTopics[key], `Missing topic key: ${key}`).toBeDefined();
      const topic = toolsTopics[key];
      expect(topic.title).toBeTruthy();
      expect(topic.prereqs).toBeTruthy();
      expect(topic.yield).toBeTruthy();
    }
  });

  it('3. should validate complete technical interview schema for all tools topics', () => {
    const toolsTopics = topicsData.tools.topics;

    for (const [key, topic] of Object.entries(toolsTopics)) {
      // Purpose schema
      expect(topic.purpose, `Invalid purpose in ${key}`).toBeDefined();
      expect(topic.purpose.solve).toBeTruthy();
      expect(topic.purpose.why).toBeTruthy();

      // Flow schema
      expect(topic.flow, `Invalid flow in ${key}`).toBeDefined();
      expect(topic.flow.learning).toContain('➜');
      expect(topic.flow.execution).toContain('➜');

      // Labs schema
      expect(topic.labs, `Invalid labs in ${key}`).toBeDefined();
      expect(topic.labs.command).toBeTruthy();
      expect(topic.labs.prod).toBeTruthy();

      // ArchGaps schema
      expect(topic.archGaps, `Invalid archGaps in ${key}`).toBeDefined();
      expect(topic.archGaps.mermaid).toContain('graph');
      expect(topic.archGaps.spof).toBeTruthy();

      // Interview Q&A schema
      expect(Array.isArray(topic.interview), `interview not array in ${key}`).toBe(true);
      expect(topic.interview.length).toBeGreaterThanOrEqual(6);
      for (const q of topic.interview) {
        expect(q.q, `Question missing q in ${key}`).toBeTruthy();
        expect(q.intent, `Question missing intent in ${key}`).toBeTruthy();
        expect(q.strong, `Question missing strong in ${key}`).toBeTruthy();
        expect(q.expert, `Question missing expert in ${key}`).toBeTruthy();
        expect(q.leadership, `Question missing leadership in ${key}`).toBeTruthy();
        expect(q.red, `Question missing red in ${key}`).toBeTruthy();
      }

      // Quiz schema
      expect(Array.isArray(topic.quiz), `quiz not array in ${key}`).toBe(true);
      expect(topic.quiz.length).toBeGreaterThanOrEqual(3);
      for (const qz of topic.quiz) {
        expect(qz.q).toBeTruthy();
        expect(qz.options.length).toBeGreaterThanOrEqual(3);
        expect(qz.options).toContain(qz.a);
        expect(qz.explanation).toBeTruthy();
      }

      // Incident schema
      expect(topic.incident, `Invalid incident in ${key}`).toBeDefined();
      expect(topic.incident.title).toBeTruthy();
      expect(topic.incident.fix).toBeTruthy();
    }
  });

  it('4. should register new topics in interview/index.html level mapper and level configuration', () => {
    expect(interviewHtml).toContain("'developer_studios_engine'");
    expect(interviewHtml).toContain("'claude_plugins_marketplace'");
    expect(interviewHtml).toContain("'vllm_inference_serving'");
    expect(interviewHtml).toContain("'enterprise_rag_retrieval'");
    expect(interviewHtml).toContain("'agentic_swarms_mcp'");
    expect(interviewHtml).toContain("'ebpf_continuous_profiling'");
    expect(interviewHtml).toContain("'cloud_finops_reclamation'");
    expect(interviewHtml).toContain("'database_reliability_patroni'");

    // Level configuration
    expect(interviewHtml).toContain("selectedTopicKey = 'vllm_inference_serving'");
    expect(interviewHtml).toContain("selectedTopicKey = 'developer_studios_engine'");
  });

  it('5. should integrate Technical Interview Defense Drill in studios/learn/index.html Step 5', () => {
    expect(studiosLearnHtml).toContain('id="step5InterviewQuestion"');
    expect(studiosLearnHtml).toContain('id="step5InterviewIntent"');
    expect(studiosLearnHtml).toContain('id="step5InterviewStrong"');
    expect(studiosLearnHtml).toContain('id="step5InterviewExpert"');
    expect(studiosLearnHtml).toContain('id="step5InterviewRedFlag"');
    expect(studiosLearnHtml).toContain('id="step5VaultLink"');
    expect(studiosLearnHtml).toContain('STAFF/PRINCIPAL INTERVIEW DEFENSE DRILL');
  });
});
