import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { runAuditEngine } from '../../../lib/auditEngine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function generateSummary(results: any[], totalSavings: number, useCase: string): Promise<string> {
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
- Tools audited: ${results.map((r: any) => r.toolName).join(', ')}
- Total monthly savings found: $${totalSavings}
- Key recommendations: ${results.filter((r: any) => r.savings > 0).map((r: any) => r.recommendation).join(', ')}

Write a direct, confident summary. Start with their savings opportunity. Be specific about which tools and why. End with one actionable next step. No fluff. Plain text only, no bullet points.`
        }],
      }),
    });

    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.content[0].text;
  } catch {
    const topSaving = [...results].sort((a, b) => b.savings - a.savings)[0];
    return `Your AI stack audit reveals $${totalSavings}/month in potential savings across ${results.length} tool(s). ${topSaving?.savings > 0 ? `The biggest opportunity is ${topSaving.toolName}: ${topSaving.reason}` : 'Your current setup is well-optimized.'} For ${useCase} workflows, the recommended changes maintain full capability while eliminating unnecessary spend. Review each recommendation below and implement the highest-impact changes first.`;
  }
}

export async function POST(req: Request) {
  try {
    const { tools, teamSize, useCase } = await req.json();
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
      summary: summary,
    });

    return Response.json({ id, results, totalMonthlySavings, summary });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Audit failed' }, { status: 500 });
  }
}