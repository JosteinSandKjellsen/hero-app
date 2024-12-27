# hero-app

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/JosteinSandKjellsen/hero-app)

## Environment Setup

1. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to the `.env` file:
   ```
   LEONARDO_API_KEY=your_leonardo_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   - Get a Leonardo AI API key from [Leonardo AI's platform](https://leonardo.ai/)
   - Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Make sure `.env` is in your `.gitignore` to prevent exposing sensitive information.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment to Netlify

1. Connect your repository to Netlify

2. Configure environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add the following environment variables:
     ```
     LEONARDO_API_KEY=your_leonardo_api_key_here
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. Deploy your site:
   - Netlify will automatically deploy when you push to your main branch
   - You can also trigger manual deploys from the Netlify dashboard

Note: Make sure both API keys are properly set in Netlify's environment variables before deploying. The application requires these keys for hero name generation and image creation features.
