/**
 * This script helps generate a refresh token for Zoho Mail API using
 * the authorization code grant flow.
 * 
 * Prerequisites:
 * 1. Create a Server-based Application in Zoho API Console (https://api-console.zoho.eu/)
 * 2. Add "Zoho Mail API" service to your project
 * 3. Set the redirect URI to http://localhost:3000/callback in the API console
 * 4. Add your credentials to .env:
 *    ZOHO_CLIENT_ID=your_client_id
 *    ZOHO_CLIENT_SECRET=your_client_secret
 */

import { config } from 'dotenv';
import http from 'http';
import { URL } from 'url';
config();

// Ensure environment variables are set and get their values
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: ${name} must be set in .env file`);
    process.exit(1);
  }
  return value;
}

const CLIENT_ID = getEnvVar('ZOHO_CLIENT_ID');
const CLIENT_SECRET = getEnvVar('ZOHO_CLIENT_SECRET');
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'ZohoMail.messages.ALL,ZohoMail.accounts.READ';

// Generate the authorization URL
const authUrl = new URL('https://accounts.zoho.eu/oauth/v2/auth');
authUrl.searchParams.append('client_id', CLIENT_ID);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', SCOPES);
authUrl.searchParams.append('access_type', 'offline');
authUrl.searchParams.append('prompt', 'consent');  // Force consent screen to ensure refresh token
authUrl.searchParams.append('redirect_uri', REDIRECT_URI);

console.log('\nBefore proceeding, ensure you have:');
console.log('1. Created a Server-based Application in Zoho API Console (https://api-console.zoho.eu/)');
console.log('2. Added "Zoho Mail API" service to your project');
console.log('3. Set the redirect URI to http://localhost:3000/callback');
console.log('4. Added your client credentials to .env file\n');

console.log('Please visit this URL to authorize the application:\n');
console.log(authUrl.toString());
console.log('\nWaiting for authorization...\n');

// Create a local server to receive the authorization code
const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url!, `http://${req.headers.host}`);
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange the authorization code for tokens
    console.log('Exchanging authorization code for tokens...');
    const tokenResponse = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token request failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.refresh_token) {
      console.log('\nSuccess! Your refresh token has been generated.\n');
      console.log('Add this to your .env file:\n');
      console.log(`ZOHO_REFRESH_TOKEN=${tokenData.refresh_token}\n`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Full response data (for debugging):');
        console.log(JSON.stringify(tokenData, null, 2));
      }

      console.log('\nIMPORTANT: After adding the refresh token to your .env file,');
      console.log('you can remove ZOHO_USERNAME and ZOHO_PASSWORD as they are');
      console.log('no longer needed.\n');
    } else {
      throw new Error('No refresh token in response: ' + JSON.stringify(tokenData));
    }

    // Send success response to browser
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Authorization successful!</h1>
      <p>You can close this window and return to the terminal.</p>
      <script>
        // Close the window automatically after 3 seconds
        setTimeout(() => window.close(), 3000);
      </script>
    `);
    
    // Close the server
    server.close(() => {
      console.log('\nAuthorization complete. You can close the browser window.\n');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Authorization Failed</h1>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>Please close this window and try again.</p>
      <script>
        // Close the window automatically after 5 seconds
        setTimeout(() => window.close(), 5000);
      </script>
    `);
    server.close(() => process.exit(1));
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Local server listening on port 3000...');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
