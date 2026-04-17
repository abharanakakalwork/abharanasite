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
