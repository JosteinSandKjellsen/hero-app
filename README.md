# hero-app

A Next.js application that generates personalized superhero identities based on personality quiz results, using AI for image generation.

## Features

### Core Features
- Personality quiz to determine superhero traits
- AI-powered superhero image generation using Leonardo AI
- Superhero name generation using Google's Gemini AI
- Email delivery of hero results
- Print view for saving hero results

### Latest Heroes
View the three most recently generated superheroes on the `/latest` page. This feature showcases:
- The three most recent hero transformations in a card layout
- Interactive cards displaying personality types and traits
- Generated hero names with AI-created images
- Quick access to print individual hero results

### Statistics
Access today's hero generation statistics on the `/stats` page to see:
- Total heroes generated for the current day
- Real-time distribution of personality types
- Popular hero colors and traits for the day
- Insights into personality matching patterns

### Generated Heroes
Browse and manage all generated heroes on the `/generated-heroes` page, featuring:
- Complete list of all generated heroes with pagination
- Quick actions for printing individual heroes
- Ability to delete unwanted hero entries
- Detailed view of hero information including names, personality types, and images

## Database Setup

The application uses PostgreSQL with Prisma ORM for data persistence. The database stores hero statistics and latest generated heroes.

### Database Schema

The database includes two main models:

- **HeroStats**: Tracks hero generation statistics
  - Color distributions
  - Creation timestamps
  
- **LatestHero**: Stores recently generated heroes
  - User information
  - Personality details
  - Image references
  - Color scores
  - Timestamps

### Development Database Setup

1. The project uses Prisma's Data Platform for the database. Get your database URL from [Prisma Data Platform](https://cloud.prisma.io).

2. Add the database URL to your environment variables:
   ```
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_database_api_key_here"
   ```

3. Initialize the database:
   ```bash
   # Install Prisma CLI globally (if not already installed)
   npm install -g prisma

   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy
   ```

4. (Optional) Use Prisma Studio to view and edit data:
   ```bash
   npx prisma studio
   ```

## Environment Setup

1. Copy `.env.example` to a new file named `.env`:

   ```bash
   cp .env.example .env
   ```

2. Add your API keys and configuration to the `.env` file:

   ```text
   # AI Services
   LEONARDO_API_KEY=your_leonardo_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here

   # Database
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_database_api_key_here"
   PULSE_API_KEY=your_pulse_api_key_here

   # Email Service
   ZOHO_CLIENT_ID=your_zoho_client_id_here
   ZOHO_CLIENT_SECRET=your_zoho_client_secret_here
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token_here
   ZOHO_MAIL_FROM_EMAIL=your_sender_email_here
   ZOHO_ACCOUNT_ID=your_zoho_account_id_here
   ```

   - Get a Leonardo AI API key from [Leonardo AI's platform](https://leonardo.ai/)
   - Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get a database URL from [Prisma Data Platform](https://cloud.prisma.io)
   - Set up Zoho Mail API credentials:
     1. Create a Zoho account and set up Zoho Mail
     2. Create a new project in [Zoho API Console](https://api-console.zoho.com/)
     3. Create a self-client with Mail.Send scope
     4. Use the provided script to get refresh token:
        ```bash
        npm run get-zoho-token
        ```

3. Make sure `.env` is in your `.gitignore` to prevent exposing sensitive information.

Note: These API keys are used server-side only and are not exposed to the client browser.

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

2. Set up the database:
   - Create a new database in Prisma Data Platform for production
   - Get the production database URL

3. Configure environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add the following environment variables:

     ```text
     # AI Services
     LEONARDO_API_KEY=your_leonardo_api_key_here
     GEMINI_API_KEY=your_gemini_api_key_here

     # Database
     DATABASE_URL=your_production_database_url_here
     PULSE_API_KEY=your_pulse_api_key_here

     # Email Service
     ZOHO_CLIENT_ID=your_zoho_client_id_here
     ZOHO_CLIENT_SECRET=your_zoho_client_secret_here
     ZOHO_REFRESH_TOKEN=your_zoho_refresh_token_here
     ZOHO_MAIL_FROM_EMAIL=your_sender_email_here
     ZOHO_ACCOUNT_ID=your_zoho_account_id_here
     ```

4. Deploy your site:
   - Netlify will automatically deploy when you push to your main branch
   - You can also trigger manual deploys from the Netlify dashboard

Note: The API keys are used securely in server-side API routes and are never exposed to the client browser. Make sure both keys are properly set in Netlify's environment variables before deploying.

## Print View

The application includes a print view that can be accessed with query parameters to display an already generated hero. Use the following format:

```bash
/print?name=John&heroName=Thunder%20Strike&imageId=abc123&personalityName=The%20Protector&color=blue&heroScore=8
```

Query Parameters:

- `name`: The person's real name
- `heroName`: The generated superhero name
- `imageId`: The ID of the generated hero image
- `personalityName`: The personality type name
- `color`: The personality color (red, yellow, green, or blue)
- `heroScore`: A number from 0-10 representing the hero score
- `gender`: (optional) 'male' or 'female', defaults to 'male'

Example:

```bash
http://localhost:3000/print?name=John%20Doe&heroName=Thunder%20Strike&imageId=abc123&personalityName=The%20Protector&color=blue&heroScore=8&gender=male
```
