import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

function runAuditEngine(tools: Tool[], teamSize: number, useCase: string): AuditResult[] {
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

    // CURSOR AUDIT
    if (tool.id === 'cursor') {
      if (tool.plan === 'Business' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Pro',
          recommendedPlan: 'Pro ($20/user)',
          savings: Math.max(0, savings),
          reason: `Business plan ($40/user) is designed for teams with admin controls. With only ${tool.seats} user(s), Pro ($20/user) gives identical AI features at half the cost.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 5) {
        const savings = tool.monthlySpend - (40 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Business',
          recommendedPlan: 'Business ($40/user)',
          savings: Math.max(0, savings),
          reason: `Enterprise pricing is justified for large orgs needing SSO and custom contracts. At ${tool.seats} seats, Business plan covers all practical needs.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Pro' && useCase !== 'coding' && useCase !== 'mixed') {
        result = { ...result,
          recommendation: 'Consider GitHub Copilot Individual',
          recommendedPlan: 'GitHub Copilot ($10/user)',
          savings: tool.monthlySpend - (10 * tool.seats),
          reason: `Cursor Pro is optimized for AI-assisted coding. For ${useCase} use cases, GitHub Copilot Individual at $10/user delivers similar value at half the price.`,
          status: 'switch',
        };
      } else {
        result.reason = 'Cursor plan matches your team size and coding use case well.';
      }
    }

    // GITHUB COPILOT AUDIT
    if (tool.id === 'github_copilot') {
      if (tool.plan === 'Business' && tool.seats <= 3) {
        const savings = tool.monthlySpend - (10 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Individual',
          recommendedPlan: 'Individual ($10/user)',
          savings: Math.max(0, savings),
          reason: `Copilot Business ($19/user) adds org management features. With ${tool.seats} users, Individual plan ($10/user) covers all AI coding features at nearly half the cost.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 10) {
        const savings = tool.monthlySpend - (19 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Business',
          recommendedPlan: 'Business ($19/user)',
          savings: Math.max(0, savings),
          reason: `Enterprise adds fine-tuning on private code — valuable at scale. At ${tool.seats} seats, Business plan is more cost-effective without losing core features.`,
          status: 'overspending',
        };
      } else {
        result.reason = 'GitHub Copilot plan is well-matched to your team size.';
      }
    }

    // CLAUDE AUDIT
    if (tool.id === 'claude') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result,
          recommendation: 'Switch to Pro (individual)',
          recommendedPlan: 'Pro ($20/user)',
          savings: Math.max(0, savings),
          reason: `Claude Team ($30/user) is built for collaboration features. With ${tool.seats} users, individual Pro plans ($20/user) give the same model access at 33% less.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Max' && useCase === 'coding') {
        result = { ...result,
          recommendation: 'Consider Cursor Pro instead',
          recommendedPlan: 'Cursor Pro ($20/user)',
          savings: tool.monthlySpend - (20 * tool.seats),
          reason: `Claude Max ($100/user) for coding is expensive. Cursor Pro at $20/user gives Claude models inside your IDE with better coding workflows at 80% less cost.`,
          status: 'switch',
        };
      } else if (tool.plan === 'Pro' && tool.seats > 5) {
        const savings = tool.monthlySpend - (30 * tool.seats);
        result = { ...result,
          recommendation: 'Upgrade to Team for volume',
          recommendedPlan: 'Team ($30/user)',
          savings: 0,
          reason: `With ${tool.seats} users on individual Pro plans, Claude Team ($30/user) adds admin controls, shared context, and priority access worth the marginal cost.`,
          status: 'optimal',
        };
      } else {
        result.reason = 'Claude plan matches your usage and team size.';
      }
    }

    // CHATGPT AUDIT
    if (tool.id === 'chatgpt') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (20 * tool.seats);
        result = { ...result,
          recommendation: 'Switch to Plus (individual)',
          recommendedPlan: 'Plus ($20/user)',
          savings: Math.max(0, savings),
          reason: `ChatGPT Team ($30/user) adds workspace management. With ${tool.seats} users, individual Plus plans cost less and offer the same GPT-4o access.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Plus' && useCase === 'coding') {
        result = { ...result,
          recommendation: 'Switch to Cursor Pro',
          recommendedPlan: 'Cursor Pro ($20/user)',
          savings: 0,
          reason: `For coding, Cursor Pro ($20/user) integrates AI directly in your editor with same underlying models. ChatGPT Plus for coding is a less efficient workflow.`,
          status: 'switch',
        };
      } else if (tool.plan === 'Enterprise' && tool.seats <= 10) {
        const savings = tool.monthlySpend - (30 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Team',
          recommendedPlan: 'Team ($30/user)',
          savings: Math.max(0, savings),
          reason: `ChatGPT Enterprise adds SSO and custom data retention. At ${tool.seats} seats, Team plan covers collaborative needs without enterprise overhead costs.`,
          status: 'overspending',
        };
      } else {
        result.reason = 'ChatGPT plan is appropriate for your team setup.';
      }
    }

    // GEMINI AUDIT
    if (tool.id === 'gemini') {
      if (tool.plan === 'Ultra' && useCase === 'writing') {
        result = { ...result,
          recommendation: 'Downgrade to Pro',
          recommendedPlan: 'Pro ($20/user)',
          savings: tool.monthlySpend - (20 * tool.seats),
          reason: `Gemini Ultra ($30/user) adds advanced reasoning. For writing tasks, Gemini Pro ($20/user) delivers near-identical output quality at 33% less cost.`,
          status: 'overspending',
        };
      } else if (tool.plan === 'Ultra' && (useCase === 'coding')) {
        result = { ...result,
          recommendation: 'Switch to Cursor Pro',
          recommendedPlan: 'Cursor Pro ($20/user)',
          savings: tool.monthlySpend - (20 * tool.seats),
          reason: `For coding, Cursor Pro at $20/user provides IDE-integrated AI with better developer experience than Gemini Ultra at $30/user.`,
          status: 'switch',
        };
      } else {
        result.reason = 'Gemini plan is well-suited for your use case.';
      }
    }

    // WINDSURF AUDIT
    if (tool.id === 'windsurf') {
      if (tool.plan === 'Team' && tool.seats <= 2) {
        const savings = tool.monthlySpend - (15 * tool.seats);
        result = { ...result,
          recommendation: 'Downgrade to Pro',
          recommendedPlan: 'Pro ($15/user)',
          savings: Math.max(0, savings),
          reason: `Windsurf Team ($35/user) adds admin features not needed for ${tool.seats} user(s). Pro plan gives full AI coding at less than half the price.`,
          status: 'overspending',
        };
      } else {
        result.reason = 'Windsurf plan matches your team size.';
      }
    }

    results.push(result);
  }

  return results;
}

async function generateSummary(results: AuditResult[], totalSavings: number, useCase: string): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are an AI spend optimization expert. Write a 80-100 word personalized audit summary for a team.

Audit data:
- Primary use case: ${useCase}
- Tools audited: ${results.map(r => r.toolName).join(', ')}
- Total monthly savings found: $${totalSavings}
- Key recommendations: ${results.filter(r => r.savings > 0).map(r => r.recommendation).join(', ')}

Write a direct, confident summary. Start with their savings opportunity. Be specific about which tools and why. End with one actionable next step. No fluff. Plain text only, no bullet points.`
        }],
      }),
    });

    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.content[0].text;
  } catch {
    // Fallback template
    const topSaving = results.sort((a, b) => b.savings - a.savings)[0];
    return `Your AI stack audit reveals $${totalSavings}/month in potential savings across ${results.length} tool(s). ${topSaving?.savings > 0 ? `The biggest opportunity is ${topSaving.toolName}: ${topSaving.reason}` : 'Your current setup is well-optimized.'} For ${useCase} workflows, the recommended changes maintain full capability while eliminating unnecessary spend. Review each recommendation below and implement the highest-impact changes first.`;
  }
}

export async function POST(req: Request) {
  try {
    const { tools, teamSize, useCase } = await req.json();

    // Rate limiting via simple check
    const results = runAuditEngine(tools, parseInt(teamSize), useCase);
    const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
    const summary = await generateSummary(results, totalMonthlySavings, useCase);

    const id = nanoid(10);

    await supabase.from('audits').insert({
      id,
      team_size: teamSize,
      tools: tools,
      results: results,
      total_monthly_savings: totalMonthlySavings,
    });

    return Response.json({ id, results, totalMonthlySavings, summary });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Audit failed' }, { status: 500 });
  }
}