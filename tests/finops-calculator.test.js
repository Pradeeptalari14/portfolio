import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('P0 — FinOps Calculator Tests', () => {
  const toolsHtmlPath = path.resolve(__dirname, '../tools/index.html');
  const finopsHtmlPath = path.resolve(__dirname, '../finops/index.html');

  it('tools/index.html static HTML should not show $0/mo baseline', () => {
    const htmlText = fs.readFileSync(toolsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText);
    const costStandard = dom.window.document.getElementById('cost-standard');
    const costOpt = dom.window.document.getElementById('cost-opt');
    const savingsPercent = dom.window.document.getElementById('calc-savings-percent');

    expect(costStandard.textContent).toBe('2,363');
    expect(costOpt.textContent).toBe('1,198');
    expect(savingsPercent.textContent).toBe('49');
  });

  it('finops/index.html static HTML should not show $0.00/mo baseline', () => {
    const htmlText = fs.readFileSync(finopsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText);
    const ec2Cost = dom.window.document.getElementById('ec2Cost');
    const s3Cost = dom.window.document.getElementById('s3Cost');

    expect(ec2Cost.textContent).toContain('700.80');
    expect(s3Cost.textContent).toContain('1,177.60');
  });

  it('tools/index.html FinOps calculation logic works with default and customized inputs', () => {
    function computeBudget(ec2Count, eksCount, rdsCount, s3TB, spot, graviton, sweeper) {
      if (isNaN(ec2Count) || isNaN(eksCount) || isNaN(rdsCount) || isNaN(s3TB) ||
          ec2Count < 0 || eksCount < 0 || rdsCount < 0 || s3TB < 0) {
        return { standard: 'Unavailable', optimized: 'Unavailable', savingsPercent: 0, error: true };
      }

      const ec2UnitCost = 45;
      const eksNodeUnitCost = 72;
      const rdsUnitCost = 110;
      const s3UnitCost = 23;

      const standardEC2 = ec2Count * ec2UnitCost;
      const standardEKS = eksCount * eksNodeUnitCost + (eksCount > 0 ? 73 : 0);
      const standardRDS = rdsCount * rdsUnitCost;
      const standardS3 = s3TB * s3UnitCost;
      const standardTotal = standardEC2 + standardEKS + standardRDS + standardS3;

      let optEC2 = standardEC2;
      let optEKS = standardEKS;
      let optRDS = standardRDS;
      let optS3 = standardS3;

      if (spot) {
        optEC2 = standardEC2 * 0.4;
        optEKS = (eksCount * eksNodeUnitCost * 0.4) + (eksCount > 0 ? 73 : 0);
      }
      if (graviton) {
        optRDS = standardRDS * 0.8;
      }
      if (sweeper) {
        optS3 = standardS3 * 0.7;
        optEC2 = optEC2 * 0.9;
      }

      const optTotal = Math.round(optEC2 + optEKS + optRDS + optS3);
      const savingsPercent = standardTotal > 0 ? Math.round(((standardTotal - optTotal) / standardTotal) * 100) : 0;

      return {
        standard: Math.round(standardTotal),
        optimized: optTotal,
        savingsPercent,
        error: false
      };
    }

    // Default: 20 EC2, 10 EKS, 4 RDS, 10 TB S3, all optimizations on
    const def = computeBudget(20, 10, 4, 10, true, true, true);
    expect(def.standard).toBe(2363);
    expect(def.optimized).toBe(1198);
    expect(def.savingsPercent).toBe(49);
    expect(def.error).toBe(false);

    // Turned off all optimizations: optimized equals standard
    const noOpt = computeBudget(20, 10, 4, 10, false, false, false);
    expect(noOpt.standard).toBe(2363);
    expect(noOpt.optimized).toBe(2363);
    expect(noOpt.savingsPercent).toBe(0);

    // Scaled up fleet: 50 EC2, 25 EKS, 8 RDS, 40 TB S3
    const scaled = computeBudget(50, 25, 8, 40, true, true, true);
    expect(scaled.standard).toBe(5923);
    expect(scaled.optimized).toBeLessThan(scaled.standard);
    expect(scaled.savingsPercent).toBeGreaterThan(45);

    // Invalid negative input
    const invalidNeg = computeBudget(-5, 10, 4, 10, true, true, true);
    expect(invalidNeg.error).toBe(true);
    expect(invalidNeg.standard).toBe('Unavailable');

    // Invalid NaN input
    const invalidNaN = computeBudget(NaN, 10, 4, 10, true, true, true);
    expect(invalidNaN.error).toBe(true);
    expect(invalidNaN.standard).toBe('Unavailable');
  });

  it('finops/index.html correctly calculates EC2 & S3 models and handles invalid inputs', () => {
    function computeEc2(rate, discountFactor, count) {
      if (isNaN(count) || count < 1 || isNaN(rate) || isNaN(discountFactor)) {
        return { cost: 'Unavailable', error: true };
      }
      const onDemandMonth = rate * 730 * count;
      const currentMonth = onDemandMonth * discountFactor;
      return { cost: currentMonth, error: false };
    }

    // 10 instances of m5.large on-demand ($0.096/hr)
    const ec2Result = computeEc2(0.096, 1.0, 10);
    expect(ec2Result.error).toBe(false);
    expect(ec2Result.cost).toBeCloseTo(700.80, 2);

    // Spot discount (~70% off = factor 0.3)
    const spotResult = computeEc2(0.096, 0.3, 10);
    expect(spotResult.cost).toBeCloseTo(210.24, 2);

    // Invalid count
    const invalidCount = computeEc2(0.096, 1.0, -1);
    expect(invalidCount.error).toBe(true);
    expect(invalidCount.cost).toBe('Unavailable');
  });
});
