import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail } from '@/app/_lib/utils/validation/emailValidation';
import { getAccessToken, getAccountId, ZohoAuthError } from '@/app/_lib/utils/zohoAuth';
import { getEmailTemplate } from '@/app/_lib/utils/email/template';
import { headers } from 'next/headers';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_EMAILS_PER_WINDOW = 50;
const emailCounts = new Map<string, { count: number; timestamp: number }>();

/**
 * Checks if the request is within rate limits
 * @param ip Client IP address
 * @returns boolean indicating if request should be allowed
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = emailCounts.get(ip);

  // Clean up old entries
  if (userLimit && now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    emailCounts.delete(ip);
    return true;
  }

  if (!userLimit) {
    emailCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= MAX_EMAILS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json().catch(() => ({}));
    const { email, heroUrl, name, heroName, personalityName, color } = body;

    if (!email || !heroUrl || !name || !heroName || !personalityName || !color) {
      return NextResponse.json(
        { error: 'Email, hero URL, and hero information are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate hero URL format and origin
    try {
      const urlObj = new URL(heroUrl);
      const origin = request.headers.get('origin');
      
      // Allow localhost and Netlify domains
      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        'https://hero-app.netlify.app',
        origin // Include the current origin for flexibility
      ];

      if (!allowedOrigins.includes(urlObj.origin)) {
        console.error('Invalid URL origin:', urlObj.origin, 'Expected one of:', allowedOrigins);
        throw new Error('Invalid URL origin');
      }
    } catch (error) {
      console.error('URL validation error:', error);
      return NextResponse.json(
        { error: 'Invalid hero URL' },
        { status: 400 }
      );
    }

    const fromEmail = process.env.ZOHO_MAIL_FROM_EMAIL;
    
    if (!fromEmail) {
      console.error('Missing Zoho Mail configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get fresh access token and account ID
    const accessToken = await getAccessToken();
    const accountId = await getAccountId(accessToken);

    const emailData = {
      fromAddress: fromEmail,
      toAddress: email,
      subject: 'Din Superhelt-Match',
      content: getEmailTemplate({ heroUrl, name, heroName, personalityName, color }),
      mailFormat: "html"
    };

    const response = await fetch(`https://mail.zoho.eu/api/accounts/${accountId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Zoho API error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      if (response.status === 401) {
        throw new ZohoAuthError('Invalid or expired access token');
      }
      
      throw new Error(
        errorData?.data?.message || 
        errorData?.message || 
        `Failed to send email (${response.status}: ${response.statusText})`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);

    if (error instanceof ZohoAuthError) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
