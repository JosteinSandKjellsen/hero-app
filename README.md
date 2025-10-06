# hero-app

A Next.js application that generates personalized superhero identities based on personality quiz results, using AI for image generation.

## Features

### Core Features

- **Multi-Session Support**: Run the app simultaneously at multiple locations with proper data isolation
- Personality quiz to determine superhero traits and matching hero colors
- AI-powered superhero image generation using Leonardo AI
- Superhero name generation using Google's Gemini AI
- Real-time camera capture for hero transformation photos
- Multi-language support (English and Norwegian)
- Email delivery of personalized hero results
- Print view with shareable URLs
- Interactive personality type exploration
- Daily statistics and hero generation tracking
- Gallery view of all generated heroes

### Session Management

The application supports multi-location deployments with session-based data organization:

- **Session-Based Data Isolation**: Create separate sessions for different events, locations, or time periods
- **Dynamic Session Selection**: Users are prompted to choose their session when multiple are active
- **Admin Session Management**: Create, edit, activate/deactivate, and delete sessions
- **Data Preservation**: Heroes and statistics are preserved even when sessions are deleted
- **Flexible Filtering**: View data by specific session or across all sessions

### Personality Quiz & Assessment

- Interactive quiz with dynamically loaded questions
- Real-time progress tracking
- Personality type matching algorithm
- Color profile analysis based on responses
- Immediate feedback and trait matching

### AI Integration

- Leonardo AI integration for superhero image generation
- Google's Gemini AI for personalized hero name creation
- Real-time image processing and transformation
- Custom prompts based on personality traits and colors

### Latest Heroes

View the three most recently generated superheroes on the `/latest` page. This feature showcases:

- The three most recent hero transformations in a card layout
- Interactive cards displaying personality types and traits
- Generated hero names with AI-created images
- Quick access to print individual results
- Language-specific hero descriptions

### Statistics & Analytics

Access today's hero generation statistics on the `/stats` page to see:

- Total heroes generated for the current day
- Real-time distribution of personality types
- Popular hero colors and traits for the day
- Insights into personality matching patterns
- Trend analysis and popularity metrics
- Color distribution visualization

### Generated Heroes Gallery

Browse and manage all generated heroes on the `/generated-heroes` page, featuring:

- Complete list of all generated heroes with pagination
- Quick actions for printing individual heroes
- Ability to delete unwanted hero entries
- Detailed view of hero information including names, personality types, and images
- Multi-language support for hero descriptions
- Sort and filter capabilities

### Camera Integration

- Real-time camera capture functionality
- Image preview and retake options
- Automatic image quality optimization
- Mobile-responsive camera interface
- Fallback to file upload when camera is unavailable

### Internationalization

- Full support for English and Norwegian languages
- Language-specific personality descriptions
- Localized user interface elements
- Cultural adaptation of hero names and traits
- Easy language switching with preserved state

### Results Sharing

- Email delivery of personalized hero results
- Print-friendly view with custom layouts
- Shareable URLs for hero profiles
- Social media sharing capabilities
- Option to download hero cards as images

## Pages & Routes

The application supports multiple languages through the `[locale]` parameter (e.g., 'en' for English, 'no' for Norwegian). All routes are available in both languages.

### Main Pages

- **`/[locale]`**: Home page
  - Take the personality quiz
  - Answer questions to determine your superhero traits
  - Upload a photo for AI transformation
  - Get your personalized superhero identity
  - Session selection modal (when multiple sessions are active)

- **`/[locale]/personalities`**: Personality Types
  - View all available personality types
  - Learn about different hero archetypes
  - Understand traits and characteristics of each type

- **`/[locale]/latest`**: Latest Heroes
  - View the three most recently generated heroes
  - Interactive cards showing personality types and traits
  - Generated names and AI-created images
  - Quick access to print individual results
  - Session selection modal for data filtering

- **`/[locale]/generated-heroes`**: Hero Gallery
  - Browse complete list of generated heroes
  - Pagination for easy navigation
  - Delete unwanted entries
  - Print individual hero results
  - Session filtering dropdown for admin use

- **`/[locale]/overview`**: Hero Overview
  - Real-time display of the 8 latest heroes in a grid layout
  - Live-updating statistics and hero distribution
  - Interactive pie chart showing type distribution
  - Color-based statistics with percentages
  - Automatic updates every 20 seconds
  - Session selection modal for filtering data by location/event

- **`/[locale]/sessions`**: Session Management (Admin)
  - Create and manage sessions for different locations or events
  - Set session names, descriptions, start/end dates
  - Activate or deactivate sessions as needed
  - Delete old sessions while preserving hero data
  - View session statistics (hero count, stats count)

- **`/[locale]/stats`**: Statistics Dashboard
  - View today's hero generation statistics
  - See personality type distribution
  - Track popular hero colors and traits
  - Real-time insights into matching patterns

- **`/[locale]/print`**: Print View
  - Printer-friendly display of hero results
  - Accessible via query parameters:
    - `name`: Person's real name
    - `heroName`: Generated superhero name
    - `imageId`: Generated image identifier
    - `personalityName`: Personality type
    - `color`: Personality color (red, yellow, green, blue)
    - `heroScore`: Hero score (0-10)
    - `gender`: (optional) 'male' or 'female'

## API Routes

The application provides several API endpoints for data management and AI integration:

### Session API

- **`GET /api/sessions`**: Retrieve all sessions or filter by active status (`?active=true`)
- **`POST /api/sessions`**: Create a new session with name, description, and date range
- **`PUT /api/sessions`**: Update an existing session (name, dates, active status)
- **`DELETE /api/sessions?id={sessionId}`**: Delete a session (preserves associated heroes/stats)

### Hero Data

- **`GET /api/latest-heroes`**: Retrieve recent heroes with optional session filtering (`?sessionId={id}`)
- **`POST /api/latest-heroes`**: Save a new hero with session association
- **`GET /api/generated-heroes`**: Paginated hero list with session filtering
- **`GET /api/hero-stats`**: Get statistics with optional session filtering (`?sessionId={id}`)
- **`POST /api/hero-stats`**: Record hero generation statistics

### AI Services

- **`POST /api/hero-image`**: Generate superhero images using Leonardo AI
- **`POST /api/hero-name`**: Generate superhero names using Google Gemini AI
- **`GET /api/hero-image/[id]`**: Serve generated images with optimization

### Session URL Parameters

Many pages support session-based filtering through URL parameters:

- **`?sessionId={id}`**: Filter data to specific session
- **Example**: `/en/overview?sessionId=abc123` shows only data from session "abc123"
- **All Sessions**: When no sessionId is provided or `sessionId=null`, shows data from all sessions

## Database Setup

The application uses PostgreSQL with Prisma ORM for data persistence. The database stores hero statistics and latest generated heroes.

### Database Schema

The database includes three main models:

- **Session**: Manages different events, locations, or time periods
  - Session metadata (name, description, dates)
  - Active/inactive status
  - Relationships to heroes and stats

- **HeroStats**: Tracks hero generation statistics
  - Color distributions
  - Creation timestamps
  - Optional session association

- **LatestHero**: Stores recently generated heroes
  - User information
  - Personality details
  - Image references
  - Color scores
  - Timestamps
  - Optional session association

### Session-Based Data Organization

The application organizes data using an optional session system:

- **Heroes and Statistics**: Can be associated with specific sessions or remain session-independent
- **Multi-Location Support**: Different physical locations can use different active sessions
- **Data Persistence**: When sessions are deleted, associated heroes and stats remain in the database
- **Admin Flexibility**: Admins can view data by session or across all sessions using "All Sessions" filter

### Data Retention Policy

The application implements different retention policies for different data types:

- **Heroes and Images**: Generated hero data and Leonardo.ai images are deleted after 30 days
- **Sessions**: Old sessions (ended >30 days ago) are automatically deleted after 30 days
- **Data Preservation**: When sessions are deleted, associated heroes and stats are preserved
- **Cleanup Process**: Automated cleanup runs daily using Netlify Edge Functions

### Development Database Setup

1. The project uses Prisma's Data Platform for the database. Get your database URL from [Prisma Data Platform](https://cloud.prisma.io).

2. Add the database URL to your environment variables:

   ```bash
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
