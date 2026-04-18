"use server";

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a booking confirmation email to the user.
 * This can be used for both "Payment Received (Pending)" and "Booking Verified (Confirmed)" states.
 */
export async function sendBookingEmail(to: string, data: {
    userName: string;
    offeringTitle: string;
    sessionDate: string;
    startTime: string;
    totalAmount: number;
    referenceCode?: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'failed';
    type: 'receipt' | 'invoice' | 'notification'
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[EMAIL_WARN] Missing RESEND_API_KEY. Skipping email sending...');
        return;
    }

    const { userName, offeringTitle, sessionDate, startTime, totalAmount, referenceCode, status } = data;

    const subject = status === 'confirmed' 
        ? `[CONFIRMED] Your Online Class: ${offeringTitle}`
        : `[PENDING] Payment Received for ${offeringTitle}`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f1e4da; border-radius: 20px;">
            <h2 style="color: #bc6746;">Abharana Kakal Sanctuary</h2>
            <hr style="border: 0.5px solid #f1e4da;" />
            <p>Namaste <strong>${userName}</strong>,</p>
            
            <p>${status === 'confirmed' 
                ? 'Your booking has been verified and confirmed! We look forward to seeing you in the sanctuary.' 
                : 'We have received your payment details. Our team is currently verifying the transaction.'}</p>
            
            <div style="background: #fdfcf6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #4a3b32;">Booking Summary</h4>
                <p style="margin: 5px 0;"><strong>Practice:</strong> ${offeringTitle}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${sessionDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${startTime}</p>
                <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${totalAmount}</p>
                ${referenceCode ? `<p style="margin: 5px 0;"><strong>Reference/UTR:</strong> ${referenceCode}</p>` : ''}
            </div>

            <p style="font-size: 12px; color: #a55a3d; font-style: italic;">
                Note: A Zoom/Meet link will be active in your dashboard or sent via a separate reminder 30 mins before the class.
            </p>

            <hr style="border: 0.5px solid #f1e4da;" />
            <p style="font-size: 11px; text-align: center; color: #a55a3d;">
                Abharana Kakal | Wellness Sanctuary | No GST Number 
            </p>
        </div>
    `;

    try {
        if (!resend) {
            console.warn('[EMAIL_WARN] Resend client not initialized. Skipping email send...');
            return;
        }

        await resend.emails.send({
            from: 'Abharana Kakal <onboarding@resend.dev>', // Should use a verified domain in prod
            to: [to],
            subject,
            html,
        });
        console.log(`[EMAIL_SUCCESS] Sent ${status} email to ${to}`);
    } catch (err) {
        console.error('[EMAIL_ERROR] Failed to send email:', err);
    }
}

/**
 * Sends a premium reminder email for monthly membership renewal.
 */
export async function sendMembershipReminderEmail(to: string, data: {
    userName: string;
    offeringTitle: string;
    expiryDate: string;
}, scheduledAt?: Date) {
    if (!process.env.RESEND_API_KEY || !resend) return;

    const { userName, offeringTitle, expiryDate } = data;

    const html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e8d5c5; border-radius: 32px; background-color: #fffdfa; color: #4a3b32;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #bc6746; font-size: 28px; margin: 0; font-style: italic;">Abharana Kakal</h1>
                <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 10px; color: #a55a3d; margin-top: 5px;">Sanctuary of Wellness</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1e4da; margin-bottom: 30px;" />
            
            <p style="font-size: 18px; line-height: 1.6;">Namaste <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; font-style: italic;">"The soul's journey is infinite, but the momentum of practice is a gift we must nurture."</p>
            
            <p style="font-size: 16px; line-height: 1.6;">Your 30-day membership for <strong>${offeringTitle}</strong> is coming to a close on <strong>${expiryDate}</strong>. We hope this month has brought a sense of peace and balance to your life.</p>
            
            <div style="background: #fdfcf6; padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0; border: 1px dashed #bc6746;">
                <h4 style="margin: 0 0 10px 0; color: #bc6746; text-transform: uppercase; letter-spacing: 2px;">Keep The Light Burning</h4>
                <p style="margin: 5px 0; font-size: 14px;">Renew your monthly membership now to ensure uninterrupted access to your live sessions and the community.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://abharanakakal.com'}/online-classes" 
                   style="display: inline-block; margin-top: 20px; padding: 14px 30px; background-color: #bc6746; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                   Renew Membership
                </a>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #7a6a62;">If you have any questions or need to adjust your practice format, our team is here to guide you.</p>
            
            <p style="margin-top: 40px; font-size: 16px;">In Light and Grace,</p>
            <p style="margin-top: 5px; font-weight: bold; color: #bc6746;">Abharana Kakal Sanctuary</p>

            <hr style="border: 0; border-top: 1px solid #f1e4da; margin-top: 40px; margin-bottom: 20px;" />
            
            <p style="font-size: 10px; text-align: center; color: #a55a3d; text-transform: uppercase; letter-spacing: 1px;">
                You are receiving this because you held an active membership in our sanctuary.
            </p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'Abharana Kakal <onboarding@resend.dev>',
            to: [to],
            subject: `Renew Your Sanctuary Journey: ${offeringTitle}`,
            html,
            scheduledAt: scheduledAt?.toISOString(),
        } as any);
        console.log(`[EMAIL_SUCCESS] Scheduled reminder for ${to} at ${scheduledAt?.toISOString()}`);
    } catch (err) {
        console.error('[EMAIL_ERROR] Failed to schedule reminder email:', err);
    }
}


/**
 * Sends a password reset email to the student.
 */
export async function sendResetPasswordEmail(to: string, resetLink: string) {
    if (!process.env.RESEND_API_KEY || !resend) {
        console.warn('[EMAIL_WARN] Resend not configured. Skipping reset email...');
        return;
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f1e4da; border-radius: 20px;">
            <h2 style="color: #bc6746;">Reset Your Password</h2>
            <hr style="border: 0.5px solid #f1e4da;" />
            <p>Namaste,</p>
            <p>We received a request to reset your password for your Abharana Kakal account.</p>
            <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
            
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #bc6746; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            
            <p>If you did not request this, you can safely ignore this email.</p>
            
            <hr style="border: 0.5px solid #f1e4da;" />
            <p style="font-size: 11px; text-align: center; color: #a55a3d;">
                Abharana Kakal | Wellness Sanctuary
            </p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'Abharana Kakal <onboarding@resend.dev>',
            to: [to],
            subject: 'Reset Your Password - Abharana Kakal',
            html,
        });
        console.log(`[EMAIL_SUCCESS] Sent password reset email to ${to}`);
    } catch (err) {
        console.error('[EMAIL_ERROR] Failed to send reset email:', err);
    }
}
