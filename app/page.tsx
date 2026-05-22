'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TOOLS = [
  { id: 'cursor', name: 'Cursor', plans: [
    { name: 'Hobby', price: 0 }, { name: 'Pro', price: 20 },
    { name: 'Business', price: 40 }, { name: 'Enterprise', price: 100 }
  ]},
  { id: 'github_copilot', name: 'GitHub Copilot', plans: [
    { name: 'Individual', price: 10 }, { name: 'Business', price: 19 },
    { name: 'Enterprise', price: 39 }
  ]},
  { id: 'claude', name: 'Claude', plans: [
    { name: 'Free', price: 0 }, { name: 'Pro', price: 20 },
    { name: 'Max', price: 100 }, { name: 'Team', price: 30 },
    { name: 'Enterprise', price: 60 }, { name: 'API Direct', price: -1 }
  ]},
  { id: 'chatgpt', name: 'ChatGPT', plans: [
    { name: 'Free', price: 0 }, { name: 'Plus', price: 20 },
    { name: 'Team', price: 30 }, { name: 'Enterprise', price: 60 },
    { name: 'API Direct', price: -1 }
  ]},
  { id: 'gemini', name: 'Gemini', plans: [
    { name: 'Free', price: 0 }, { name: 'Pro', price: 20 },
    { name: 'Ultra', price: 30 }, { name: 'API', price: -1 }
  ]},
  { id: 'windsurf', name: 'Windsurf', plans: [
    { name: 'Free', price: 0 }, { name: 'Pro', price: 15 },
    { name: 'Team', price: 35 }
  ]},
];

const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed'];

type ToolEntry = {
  enabled: boolean;
  plan: string;
  seats: number;
  monthlySpend: number;
};

type FormState = {
  tools: Record<string, ToolEntry>;
  teamSize: string;
  useCase: string;
};

const defaultForm = (): FormState => ({
  tools: Object.fromEntries(TOOLS.map(t => [t.id, {
    enabled: false, plan: t.plans[0].name, seats: 1, monthlySpend: 0
  }])),
  teamSize: '1',
  useCase: 'mixed',
});

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_audit_form');
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_audit_form', JSON.stringify(form));
  }, [form]);

  const updateTool = (toolId: string, field: keyof ToolEntry, value: any) => {
    setForm(prev => ({
      ...prev,
      tools: { ...prev.tools, [toolId]: { ...prev.tools[toolId], [field]: value } }
    }));
  };

  const handleSubmit = async () => {
    const enabledTools = Object.entries(form.tools)
      .filter(([, v]) => v.enabled)
      .map(([id, v]) => ({ id, ...v }));

    if (enabledTools.length === 0) {
      alert('Kam se kam ek tool select karo!');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tools: enabledTools, teamSize: form.teamSize, useCase: form.useCase }),
    });
    const data = await res.json();
    setLoading(false);
    router.push(`/audit/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">💸 AI Spend Auditor</h1>
          <p className="text-gray-400 text-lg">Find out exactly where you're overpaying on AI tools — free, instant, no login.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Your Team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Team Size</label>
              <input type="number" min="1" value={form.teamSize}
                onChange={e => setForm(p => ({ ...p, teamSize: e.target.value }))}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Primary Use Case</label>
              <select value={form.useCase}
                onChange={e => setForm(p => ({ ...p, useCase: e.target.value }))}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
              >
                {USE_CASES.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Your AI Tools</h2>
          {TOOLS.map(tool => {
            const entry = form.tools[tool.id];
            return (
              <div key={tool.id} className={`bg-gray-900 rounded-2xl p-5 border transition-all ${entry.enabled ? 'border-blue-500' : 'border-gray-800'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" checked={entry.enabled}
                    onChange={e => updateTool(tool.id, 'enabled', e.target.checked)}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="font-semibold text-lg">{tool.name}</span>
                </div>
                {entry.enabled && (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Plan</label>
                      <select value={entry.plan}
                        onChange={e => {
                          const plan = tool.plans.find(p => p.name === e.target.value);
                          updateTool(tool.id, 'plan', e.target.value);
                          if (plan && plan.price >= 0) updateTool(tool.id, 'monthlySpend', plan.price * entry.seats);
                        }}
                        className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm border border-gray-700"
                      >
                        {tool.plans.map(p => <option key={p.name} value={p.name}>{p.name}{p.price > 0 ? ` ($${p.price})` : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Seats</label>
                      <input type="number" min="1" value={entry.seats}
                        onChange={e => updateTool(tool.id, 'seats', +e.target.value)}
                        className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Monthly Spend ($)</label>
                      <input type="number" min="0" value={entry.monthlySpend}
                        onChange={e => updateTool(tool.id, 'monthlySpend', +e.target.value)}
                        className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm border border-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-2xl text-lg transition-all"
        >
          {loading ? '⏳ Analyzing...' : '🔍 Run Free Audit →'}
        </button>
      </div>
    </main>
  );
}