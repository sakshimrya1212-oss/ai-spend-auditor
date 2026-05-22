type Tool = {
  id: string;
  plan: string;
  seats: number;
  monthlySpend: number;
};

type AuditResult = {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  recommendedPlan: string;
  savings: number;
  reason: string;
  status: 'overspending' | 'optimal' | 'switch';
};

const TOOL_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

export function runAuditEngine(tools: Tool[], teamSize: number, useCase: string): AuditResult[] {
  const results: AuditResult[] = [];

  for (const tool of tools) {
    let result: AuditResult = {
      toolId: tool.id,
      toolName: TOOL_NAMES[tool.id] || tool.id,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: 'Keep current plan',
      recommendedPlan: tool.plan,
      savings: 0,
      reason: 'Your current plan matches your usage.',
      status: 'optimal',
    };

    if (tool.id === 'cursor') {
      if (tool.plan === 'Business' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Pro', recommendedPlan: 'Pro ($20/user)', savings: Math.max(0, savings), reason: `Business plan ($40/user) is designed for teams with admin controls. With only ${tool.seats} user(s), Pro ($20/user) gives identical AI features at half the cost.`, status: 'overspending' };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 5) {
        const savings = tool.monthlySpend - (40 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Business', recommendedPlan: 'Business ($40/user)', savings: Math.max(0, savings), reason: `Enterprise pricing is justified for large orgs needing SSO and custom contracts. At ${tool.seats} seats, Business plan covers all practical needs.`, status: 'overspending' };
      } else if (tool.plan === 'Pro' && useCase !== 'coding' && useCase !== 'mixed') {
        result = { ...result, recommendation: 'Consider GitHub Copilot Individual', recommendedPlan: 'GitHub Copilot ($10/user)', savings: tool.monthlySpend - (10 * tool.seats), reason: `Cursor Pro is optimized for AI-assisted coding. For ${useCase} use cases, GitHub Copilot Individual at $10/user delivers similar value at half the price.`, status: 'switch' };
      } else {
        result.reason = 'Cursor plan matches your team size and coding use case well.';
      }
    }

    if (tool.id === 'github_copilot') {
      if (tool.plan === 'Business' && tool.seats <= 3) {
        const savings = tool.monthlySpend - (10 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Individual', recommendedPlan: 'Individual ($10/user)', savings: Math.max(0, savings), reason: `Copilot Business ($19/user) adds org management features. With ${tool.seats} users, Individual plan ($10/user) covers all AI coding features at nearly half the cost.`, status: 'overspending' };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 10) {
        const savings = tool.monthlySpend - (19 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Business', recommendedPlan: 'Business ($19/user)', savings: Math.max(0, savings), reason: `Enterprise adds fine-tuning on private code. At ${tool.seats} seats, Business plan is more cost-effective.`, status: 'overspending' };
      } else {
        result.reason = 'GitHub Copilot plan is well-matched to your team size.';
      }
    }

    if (tool.id === 'claude') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result, recommendation: 'Switch to Pro (individual)', recommendedPlan: 'Pro ($20/user)', savings: Math.max(0, savings), reason: `Claude Team ($30/user) is built for collaboration features. With ${tool.seats} users, individual Pro plans ($20/user) give the same model access at 33% less.`, status: 'overspending' };
      } else if (tool.plan === 'Max' && useCase === 'coding') {
        result = { ...result, recommendation: 'Consider Cursor Pro instead', recommendedPlan: 'Cursor Pro ($20/user)', savings: tool.monthlySpend - (20 * tool.seats), reason: `Claude Max ($100/user) for coding is expensive. Cursor Pro at $20/user gives Claude models inside your IDE at 80% less cost.`, status: 'switch' };
      } else {
        result.reason = 'Claude plan matches your usage and team size.';
      }
    }

    if (tool.id === 'chatgpt') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result, recommendation: 'Switch to Plus (individual)', recommendedPlan: 'Plus ($20/user)', savings: Math.max(0, savings), reason: `ChatGPT Team ($30/user) adds workspace management. With ${tool.seats} users, individual Plus plans cost less with same GPT-4o access.`, status: 'overspending' };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 10) {
        const savings = tool.monthlySpend - (30 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Team', recommendedPlan: 'Team ($30/user)', savings: Math.max(0, savings), reason: `ChatGPT Enterprise adds SSO. At ${tool.seats} seats, Team plan covers collaborative needs without enterprise overhead.`, status: 'overspending' };
      } else {
        result.reason = 'ChatGPT plan is appropriate for your team setup.';
      }
    }

    if (tool.id === 'gemini') {
      if (tool.plan === 'Ultra' && useCase === 'writing') {
        result = { ...result, recommendation: 'Downgrade to Pro', recommendedPlan: 'Pro ($20/user)', savings: tool.monthlySpend - (20 * tool.seats), reason: `Gemini Ultra ($30/user) adds advanced reasoning. For writing, Pro ($20/user) delivers near-identical output at 33% less.`, status: 'overspending' };
      } else {
        result.reason = 'Gemini plan is well-suited for your use case.';
      }
    }

    if (tool.id === 'windsurf') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (15 * tool.seats);
        result = { ...result, recommendation: 'Downgrade to Pro', recommendedPlan: 'Pro ($15/user)', savings: Math.max(0, savings), reason: `Windsurf Team ($35/user) adds admin features not needed for ${tool.seats} user(s). Pro gives full AI coding at less than half the price.`, status: 'overspending' };
      } else {
        result.reason = 'Windsurf plan matches your team size.';
      }
    }

    results.push(result);
  }

  return results;
}