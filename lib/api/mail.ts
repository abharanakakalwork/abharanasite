import axios from 'axios';

/**
 * Interface for ZeptoMail Send Email request body
 */
interface ZeptoMailRequest {
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    email_address: {
      address: string;
      name: string;
    };
  }>;
  subject: string;
  htmlbody: string;
}

/**
 * Sends an email using the ZeptoMail HTTP API.
 * Requires ZEPTOMAIL_SEND_MAIL_TOKEN in environment variables.
 */
export async function sendZeptoMail({
  to,
  toName,
  subject,
  htmlBody,
}: {
  to: string;
  toName?: string;
  subject: string;
  htmlBody: string;
}) {
  const token = process.env.ZEPTOMAIL_SEND_MAIL_TOKEN?.trim();
  const senderEmail = process.env.ZEPTOMAIL_SENDER_EMAIL || 'yoga@abharanakakal.com';
  const senderName = process.env.ZEPTOMAIL_SENDER_NAME || 'Abharana Kakal Sanctuary';
  
  // Use .in by default as user is likely in India, but allow configuration via env if needed
  const region = process.env.ZEPTOMAIL_REGION || 'in'; 
  const apiUrl = `https://api.zeptomail.${region}/v1.1/email`;

  if (!token) {
    console.error('[ZEPTOMAIL_ERROR] Missing ZEPTOMAIL_SEND_MAIL_TOKEN environment variable.');
    throw new Error('Email service not configured correctly.');
  }

  let authHeader = token;
  
  // If the user's token already starts with 'Zoho-enczapikey' or 'ph' (case-insensitive), 
  // we trust the user-provided value and use it as is.
  // Otherwise, we add the standard prefix.
  if (!/^zoho-enczapikey/i.test(token) && !/^ph/i.test(token)) {
    authHeader = `zoho-enczapikey ${token}`;
  }

  const payload: ZeptoMailRequest = {
    from: {
      address: senderEmail,
      name: senderName,
    },
    to: [
      {
        email_address: {
          address: to,
          name: toName || to.split('@')[0],
        },
      },
    ],
    subject,
    htmlbody: htmlBody,
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('[ZEPTOMAIL_SUCCESS] Email sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    const errorMessage = errorData ? JSON.stringify(errorData) : error.message;
    console.error('[ZEPTOMAIL_ERROR] Failed to send email:', errorMessage);
    
    // Provide a more descriptive error for debugging
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}
