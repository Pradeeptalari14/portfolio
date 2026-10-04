/**
 * OpenAIMarketplaceBrokerGenerator
 * Generates quota-aware routing configurations that balance traffic across multiple
 * OpenAI / Azure OpenAI deployments based on TPM/RPM headroom, cost and priority tier.
 */
export class OpenAIMarketplaceBrokerGenerator {
  constructor() {
    this.name = 'OpenAI Compute & Quota Broker Generator';
    this.version = '1.0.0';
  }

  defaultDeployments() {
    return [
      { id: 'openai-primary', provider: 'openai', region: 'global', tpmLimit: 2000000, rpmLimit: 10000, costWeight: 1.0 },
      { id: 'azure-eastus2', provider: 'azure_openai', region: 'eastus2', tpmLimit: 1000000, rpmLimit: 6000, costWeight: 0.95 },
      { id: 'azure-swedencentral', provider: 'azure_openai', region: 'swedencentral', tpmLimit: 800000, rpmLimit: 4800, costWeight: 0.95 }
    ];
  }

  /**
   * Picks the deployment with the best headroom/cost score.
   * usage: { [deploymentId]: { tpmUsed, rpmUsed } }
   */
  selectDeployment(deployments, usage = {}, estimatedTokens = 1000) {
    let best = null;
    for (const d of deployments) {
      const u = usage[d.id] || { tpmUsed: 0, rpmUsed: 0 };
      const tpmLeft = d.tpmLimit - u.tpmUsed;
      const rpmLeft = d.rpmLimit - u.rpmUsed;
      if (tpmLeft < estimatedTokens || rpmLeft < 1) continue;
      const headroom = Math.min(tpmLeft / d.tpmLimit, rpmLeft / d.rpmLimit);
      const score = headroom / d.costWeight;
      if (!best || score > best.score) best = { id: d.id, score: Number(score.toFixed(4)) };
    }
    return best; // null => all deployments saturated, caller should queue / 429
  }

  generate(config = {}) {
    const {
      strategy = 'headroom_weighted',
      priorityTiers = true,
      fallbackMode = 'queue_with_backoff',
      dataResidency = 'any'
    } = config;

    let deployments = this.defaultDeployments();
    if (dataResidency === 'eu_only') {
      deployments = deployments.filter(d => d.region === 'swedencentral');
    }

    return {
      brokerName: 'tp-openai-marketplace-broker',
      routing: {
        strategy,
        deployments,
        healthCheckIntervalSec: 15,
        honorRetryAfterHeader: true
      },
      quotaPolicy: {
        priorityTiers: priorityTiers
          ? [
              { tier: 'interactive', reservedTpmShare: 0.6 },
              { tier: 'batch', reservedTpmShare: 0.3 },
              { tier: 'experimental', reservedTpmShare: 0.1 }
            ]
          : [],
        perTeamBudgetsUsd: true
      },
      resilience: {
        fallbackMode,
        maxRetries: 4,
        backoff: 'exponential_jitter',
        circuitBreakerErrorRate: 0.25
      },
      dataResidency
    };
  }

  generatePythonClient() {
    return `import random, time
from openai import OpenAI, AzureOpenAI, RateLimitError

def call_with_broker(broker, messages, est_tokens=1000, max_retries=4):
    for attempt in range(max_retries + 1):
        deployment = broker.select(est_tokens)
        if deployment is None:
            time.sleep(min(2 ** attempt, 30) + random.random())
            continue
        try:
            return deployment.client.chat.completions.create(
                model=deployment.model, messages=messages)
        except RateLimitError:
            broker.mark_saturated(deployment.id)
    raise RuntimeError("All deployments saturated")
`;
  }
}
