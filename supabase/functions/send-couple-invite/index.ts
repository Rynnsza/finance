import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://seaavey.site';

const resend = new Resend(RESEND_API_KEY);

serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // --- Auth validation ---
    const authHeader = req.headers.get('Authorization') || '';
    let callerId: string | null = null;

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await authClient.auth.getUser(token);
      callerId = user?.id || null;
    }

    let record: Record<string, unknown>;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();

      if (body.type && body.record) {
        // Database Webhook format: { type: "INSERT", table: "...", record: {...} }
        if (body.type !== 'INSERT') {
          return new Response('Ignored non-INSERT event', { status: 200 });
        }
        record = body.record;
      } else {
        // Direct API call: { id, sender_id, recipient_email, token }
        record = body;
      }
    } else {
      return new Response('Content-Type must be application/json', { status: 400 });
    }

    const { id, sender_id, recipient_email } = record as {
      id?: string;
      sender_id?: string;
      recipient_email?: string;
    };

    if (!sender_id || !recipient_email) {
      return new Response('Missing sender_id or recipient_email', { status: 400 });
    }

    // If called directly (not via DB webhook), verify the caller owns this sender_id
    if (!record.type && callerId && callerId !== sender_id) {
      return new Response('Forbidden: sender_id does not match authenticated user', { status: 403 });
    }

    // Get sender's display name
    const svcClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: sender } = await svcClient
      .from('profiles')
      .select('display_name')
      .eq('id', sender_id)
      .single();

    const senderName = sender?.display_name || 'Seseorang';

    // Get sender's email for the "reply-to"
    const { data: senderUser } = await svcClient.auth.admin.getUserById(sender_id);
    const senderEmail = senderUser?.user?.email;

    const acceptUrl = `${APP_URL}/settings`;

    const { error: emailError } = await resend.emails.send({
      from: 'Aemy Finance <noreply@seaavey.com>',
      replyTo: senderEmail || undefined,
      to: recipient_email,
      subject: `${senderName} mengundangmu terhubung di Aemy Finance`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
                  <tr>
                    <td style="background:#ffffff;border-radius:24px;padding:40px 32px;text-align:left;">
                      <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px;">Ada yang mengundangmu ✨</h1>
                      <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                        <strong style="color:#111;">${senderName}</strong> mengundangmu untuk terhubung sebagai pasangan di
                        <strong style="color:#111;">Aemy Finance</strong> — aplikasi untuk mengelola keuangan bersama.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                          <td align="center" style="background:#111;border-radius:14px;padding:12px 28px;">
                            <a href="${acceptUrl}" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;display:block;">
                              Lihat Undangan
                            </a>
                          </td>
                        </tr>
                      </table>
                      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                      <p style="font-size:13px;color:#999;margin:0;">
                        Jika kamu tidak mengenali email ini, abaikan saja.<br />
                        © Aemy Finance
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(JSON.stringify({ error: emailError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Invitation email sent: ${id} -> ${recipient_email}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
