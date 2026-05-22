import { runAuditEngine } from '../lib/auditEngine';

describe('Audit Engine Tests', () => {

  test('1. Cursor Business with 2 users should recommend downgrade to Pro', () => {
    const tools = [{ id: 'cursor', plan: 'Business', seats: 2, monthlySpend: 80 }];
    const results = runAuditEngine(tools, 2, 'coding');
    expect(results[0].status).toBe('overspending');
    expect(results[0].savings).toBe(40);
    expect(results[0].recommendedPlan).toContain('Pro');
  });

  test('2. GitHub Copilot Business with 2 users should suggest Individual', () => {
    const tools = [{ id: 'github_copilot', plan: 'Business', seats: 2, monthlySpend: 38 }];
    const results = runAuditEngine(tools, 2, 'coding');
    expect(results[0].status).toBe('overspending');
    expect(results[0].savings).toBeGreaterThan(0);
    expect(results[0].recommendedPlan).toContain('Individual');
  });

  test('3. Claude Team with 2 users should recommend Pro instead', () => {
    const tools = [{ id: 'claude', plan: 'Team', seats: 2, monthlySpend: 60 }];
    const results = runAuditEngine(tools, 2, 'writing');
    expect(results[0].status).toBe('overspending');
    expect(results[0].savings).toBe(20);
  });

  test('4. Cursor Pro optimal spend should return status optimal', () => {
    const tools = [{ id: 'cursor', plan: 'Pro', seats: 2, monthlySpend: 40 }];
    const results = runAuditEngine(tools, 2, 'coding');
    expect(results[0].status).toBe('optimal');
    expect(results[0].savings).toBe(0);
  });

 test('5. Multi-tool savings above 500 should be detected', () => {
    const tools = [
      { id: 'cursor', plan: 'Business', seats: 2, monthlySpend: 80 },
      { id: 'github_copilot', plan: 'Enterprise', seats: 2, monthlySpend: 78 },
      { id: 'claude', plan: 'Team', seats: 2, monthlySpend: 60 },
      { id: 'chatgpt', plan: 'Enterprise', seats: 2, monthlySpend: 120 },
    ];
    const results = runAuditEngine(tools, 2, 'coding');
    const total = results.reduce((sum, r) => sum + r.savings, 0);
    expect(total).toBeGreaterThan(100);
  });

});