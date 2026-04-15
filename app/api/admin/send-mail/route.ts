import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { sendZeptoMail } from '@/lib/api/mail';

/**
 * POST /api/admin/send-mail
 * Sends a manual email to a user using ZeptoMail.
 * Restricted to admins via withAuth.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, toName, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    // Wrap the message in a basic HTML template for better presentation
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f1e4da; border-radius: 20px;">
        <h2 style="color: #bc6746;">Abharana Kakal Sanctuary</h2>
        <hr style="border: 0.5px solid #f1e4da;" />
        <div style="color: #4a3b32; line-height: 1.6; white-space: pre-wrap;">
          ${message}
        </div>
        <hr style="border: 0.5px solid #f1e4da; margin-top: 30px;" />
        <p style="font-size: 11px; text-align: center; color: #a55a3d;">
          Abharana Kakal | Wellness Sanctuary
          <br />
          <a href="https://abharanakakal.com" style="color: #bc6746; text-decoration: none;">www.abharanakakal.com</a>
        </p>
      </div>
    `;

    await sendZeptoMail({
      to,
      toName,
      subject,
      htmlBody,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('[Admin Send Mail Error]:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
