import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const { auditId, email, company, role } = await req.json();

    // Honeypot check
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Update audit with lead info
    await supabase
      .from('audits')
      .update({ email, company, role })
      .eq('id', auditId);

    // Send email via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'AI Audit <onboarding@resend.dev>',
          to: email,
          subject: '💸 Your AI Spend Audit Report',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1d4ed8;">Your AI Spend Audit is Ready</h1>
              <p>Thanks for using AI Spend Auditor! Your personalized report is ready.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditId}" 
                style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">
                View Your Full Report →
              </a>
              <p style="color: #6b7280; font-size: 14px;">
                The Credex team will reach out if your audit shows significant savings opportunities.
              </p>
            </div>
          `,
        }),
      });
    } catch {
      console.log('Email failed but lead saved');
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}