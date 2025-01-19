interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface TokenCache {
  token: string;
  expiry: number;
}

interface AccountCache {
  id: string;
  expiry: number;
}

export class ZohoAuthError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ZohoAuthError';
  }
}

// Use WeakMap to allow garbage collection of unused cache entries
const tokenCache = new WeakMap<object, TokenCache>();
const accountCache = new WeakMap<object, AccountCache>();
const cacheKey = {};

const ACCOUNT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Gets a valid access token for Zoho Mail API.
 * Handles token caching and automatic refresh.
 * 
 * @throws {ZohoAuthError} If token refresh fails or credentials are missing
 * @returns Promise<string> Valid access token
 */
export async function getAccessToken(): Promise<string> {
  const cached = tokenCache.get(cacheKey);
  
  // Return cached token if it's still valid (with 5 minutes buffer)
  if (cached && Date.now() < cached.expiry - 300000) {
    return cached.token;
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new ZohoAuthError(
      'Missing Zoho OAuth credentials. Ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN are set in .env'
    );
  }

  try {
    const response = await fetch(
      'https://accounts.zoho.eu/oauth/v2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ZohoAuthError(
        'Failed to refresh access token',
        errorData || response.statusText
      );
    }

    const data: TokenResponse = await response.json();
    
    if (!data.access_token || !data.expires_in) {
      throw new ZohoAuthError('Invalid token response from Zoho');
    }

    // Cache the token and set expiry
    tokenCache.set(cacheKey, {
      token: data.access_token,
      expiry: Date.now() + (data.expires_in * 1000),
    });

    return data.access_token;
  } catch (error) {
    if (error instanceof ZohoAuthError) {
      throw error;
    }
    throw new ZohoAuthError('Failed to get access token', error);
  }
}

/**
 * Gets the Zoho account ID using the access token.
 * Handles caching to reduce API calls.
 * 
 * @throws {ZohoAuthError} If account ID fetch fails
 * @returns Promise<string> Zoho account ID
 */
export async function getAccountId(accessToken: string): Promise<string> {
  const cached = accountCache.get(cacheKey);
  
  // Return cached account ID if it's still valid
  if (cached && Date.now() < cached.expiry) {
    return cached.id;
  }

  try {
    const response = await fetch('https://mail.zoho.eu/api/accounts', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ZohoAuthError(
        'Failed to get account ID',
        errorData || response.statusText
      );
    }

    const data = await response.json();
    
    if (!data?.data?.[0]?.accountId) {
      throw new ZohoAuthError('Invalid account data response');
    }

    const accountId = data.data[0].accountId;

    // Cache the account ID
    accountCache.set(cacheKey, {
      id: accountId,
      expiry: Date.now() + ACCOUNT_CACHE_DURATION,
    });

    return accountId;
  } catch (error) {
    if (error instanceof ZohoAuthError) {
      throw error;
    }
    throw new ZohoAuthError('Failed to get account ID', error);
  }
}
