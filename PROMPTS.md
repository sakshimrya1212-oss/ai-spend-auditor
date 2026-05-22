# Prompts

## Audit Summary Prompt

### Full Prompt

```
You are an AI spend optimization expert. Write a 80-100 word personalized audit summary for a team.

Audit data:
- Primary use case: ${useCase}
- Tools audited: ${results.map(r => r.toolName).join(', ')}
- Total monthly savings found: $${totalSavings}
- Key recommendations: ${results.filter(r => r.savings > 0).map(r => r.recommendation).join(', ')}

Write a direct, confident summary. Start with their savings opportunity. Be specific about which tools and why. End with one actionable next step. No fluff. Plain text only, no bullet points.
```

### Why I Wrote It This Way

**Direct and confident tone** — Users trust authoritative recommendations. Hedging language ("you might want to consider") kills confidence in the tool.

**Start with savings** — The number is the hook. Leading with it reinforces the value before explaining the reasoning.

**Specific tool names** — Generic summaries feel like templates. Mentioning actual tool names makes it feel personalized even when it is partially templated.

**End with one action** — Multiple calls to action cause paralysis. One clear next step drives conversion.

**Plain text only** — The summary renders inside a styled card. Markdown formatting would break the UI and look unprofessional.

**80-100 word limit** — Long enough to feel substantive, short enough to be read in full. Anything longer gets skimmed.

### What I Tried That Didn't Work

**Attempt 1 — Too open ended:**
```
Summarize this AI spend audit and give recommendations.
```
Result: Model wrote 400+ words with bullet points and markdown headers. Completely broke the UI card layout.

**Attempt 2 — Asking for JSON:**
```
Return a JSON object with fields: summary, topRecommendation, urgency.
```
Result: Inconsistent JSON structure across runs. Sometimes added extra fields, sometimes nested differently. Hard to parse reliably.

**Attempt 3 — No word limit:**
```
Write a personalized summary paragraph based on this audit data.
```
Result: Length varied wildly between 50 and 300 words. UI card looked broken on short summaries and overflowed on long ones.

### Fallback Template

When Anthropic API fails or key is missing, this template is used:

```
Your AI stack audit reveals $${totalSavings}/month in potential savings 
across ${results.length} tool(s). ${topSaving?.savings > 0 
  ? `The biggest opportunity is ${topSaving.toolName}: ${topSaving.reason}` 
  : 'Your current setup is well-optimized.'} 
For ${useCase} workflows, the recommended changes maintain full capability 
while eliminating unnecessary spend. Review each recommendation below and 
implement the highest-impact changes first.
```

### Why Fallback Exists

API calls fail. Keys expire. Rate limits hit. The audit engine runs entirely on hardcoded rules — the summary is the only AI-dependent feature. A fallback ensures the tool remains fully functional even when the API is unavailable. Users get a slightly less personalized experience but the core value (savings numbers and recommendations) is unaffected.