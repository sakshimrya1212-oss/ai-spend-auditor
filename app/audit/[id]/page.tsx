'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

type AuditData = {
  id: string;
  results: AuditResult[];
  total_monthly_savings: number;
  summary: string;
  tools: any[];
};

export default function AuditPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditData | null>(null);
const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetch(`/api/audit/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(true); setLoading(false); return; }
        // Normalize data
        const normalized = {
          ...data,
          results: data.results || [],
          total_monthly_savings: data.total_monthly_savings ?? 0,
          summary: data.summary || '',
        };
        setAudit(normalized);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);
  
  const handleEmailSubmit = async () => {
    if (!email) return;
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId: id, email, company, role }),
    });
    setSubmitted(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-xl text-gray-400">Analyzing your AI spend...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-gray-400">Audit not found. Please run a new audit.</p>
        <a href="/" className="text-blue-400 mt-4 block">← Go back</a>
      </div>
    </div>
  );

if (!audit) return (
  
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Audit not found.</p>
    </div>
  );

const totalSavings = audit.total_monthly_savings ?? audit.results?.reduce((sum: number, r: any) => sum + r.savings, 0) ?? 0;
const annualSavings = totalSavings * 12;
const isHighSavings = totalSavings > 500;
const isOptimal = totalSavings < 100;

  const statusConfig = {
    overspending: { color: 'border-red-500 bg-red-500/10', badge: 'bg-red-500', label: '⚠️ Overspending', text: 'text-red-400' },
    switch: { color: 'border-yellow-500 bg-yellow-500/10', badge: 'bg-yellow-500', label: '🔄 Better Option', text: 'text-yellow-400' },
    optimal: { color: 'border-green-500 bg-green-500/10', badge: 'bg-green-500', label: '✅ Optimal', text: 'text-green-400' },
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">💸 Your AI Spend Audit</h1>
          <p className="text-gray-400">Here's exactly where your money is going — and where it shouldn't be.</p>
        </div>

        {/* Hero Savings Card */}
        <div className={`rounded-2xl p-8 mb-8 text-center border ${isOptimal ? 'bg-green-900/20 border-green-500' : 'bg-blue-900/20 border-blue-500'}`}>
          {isOptimal ? (
            <>
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">You're Spending Well!</h2>
              <p className="text-gray-300">Your AI stack is already well-optimized. Less than $100/month in potential savings found.</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">💰</div>
              <h2 className="text-2xl font-semibold text-gray-300 mb-2">Potential Savings Found</h2>
              <div className="text-6xl font-bold text-white mb-1">
                ${totalSavings.toFixed(0)}<span className="text-3xl text-gray-400">/mo</span>
              </div>
              <div className="text-2xl text-blue-400 font-semibold">
                ${annualSavings.toFixed(0)} per year
              </div>
            </>
          )}
        </div>

        {/* AI Summary */}
        {audit.summary && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h3 className="font-semibold text-gray-300">AI Analysis</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{audit.summary}</p>
          </div>
        )}

        {/* Per Tool Breakdown */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Tool-by-Tool Breakdown</h2>
          {audit.results.map(result => {
            const config = statusConfig[result.status];
            return (
              <div key={result.toolId} className={`rounded-2xl p-6 border ${config.color}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{result.toolName}</h3>
                    <span className="text-sm text-gray-400">Current: {result.currentPlan} — ${result.currentSpend}/mo</span>
                  </div>
                  <span className={`${config.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {config.label}
                  </span>
                </div>
                <div className="bg-black/20 rounded-xl p-4 mb-3">
                  <p className="text-sm font-semibold text-white mb-1">→ {result.recommendation}</p>
                  <p className="text-sm text-gray-400">{result.reason}</p>
                </div>
                {result.savings > 0 && (
                  <div className={`text-lg font-bold ${config.text}`}>
                    Save ${result.savings.toFixed(0)}/mo (${(result.savings * 12).toFixed(0)}/yr)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* High Savings — Credex CTA */}
        {isHighSavings && (
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500 rounded-2xl p-8 mb-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-2xl font-bold mb-2">You Could Save $500+/month</h2>
            <p className="text-gray-300 mb-6">Our team at Credex can help you capture these savings and negotiate better rates. Free 30-min consultation.</p>
            <a href="https://credex.com/consultation" target="_blank"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all">
              Book Free Credex Consultation →
            </a>
          </div>
        )}

        {/* Email Capture */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold mb-2">Report Sent!</h3>
              <p className="text-gray-400">Check your inbox for the full audit report.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">
                {isOptimal ? '🔔 Get Notified When New Optimizations Apply' : '📧 Get Full Report in Your Inbox'}
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                {isOptimal ? 'We\'ll notify you when better options become available for your stack.' : 'Capture this report + get personalized recommendations from the Credex team.'}
              </p>
              <div className="space-y-3">
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text" placeholder="Company (optional)" value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text" placeholder="Role (optional)" value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                {/* Honeypot - abuse protection */}
                <input type="text" name="website" className="hidden" tabIndex={-1} />
                <button onClick={handleEmailSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
                  {isOptimal ? 'Notify Me →' : 'Send My Report →'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <div className="text-center">
          <button onClick={copyLink}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
            {copying ? '✅ Link Copied!' : '🔗 Share This Audit'}
          </button>
          <p className="text-gray-500 text-sm mt-2">Your email and company details are never shown in shared links</p>
        </div>

      </div>
    </main>
  );
}