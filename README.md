# BigCal - Yearly Calendar View

A clean and minimal calendar application that displays your entire year at a glance. Connect multiple Google Calendar and Microsoft 365 accounts to see all your events in one unified view.

## Features

- **Yearly Overview**: View all 12 months in a single page, with each month in its own row
- **Multi-Account Support**: Connect multiple Google and Microsoft calendar accounts
- **Clean Design**: Built with ShadCN UI components for a modern, minimal aesthetic
- **Color-Coded Events**: Each account's events are displayed in a unique color
- **Real-Time Sync**: Automatically fetches and displays events from all connected accounts

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - High-quality React components
- **date-fns** - Modern date utility library
- **OAuth 2.0** - Secure authentication for Google and Microsoft

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console project (for Google Calendar integration)
- Microsoft Azure app registration (for Microsoft 365 integration)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bigcal
npm install
```

### 2. Set Up Google Calendar OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. For "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - Your production URL + `/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

### 3. Set Up Microsoft Calendar OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "App registrations" → "New registration"
3. Set up your app:
   - Name: BigCal (or your choice)
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
4. After creation, go to "Certificates & secrets" → "New client secret"
5. Copy the Client ID and Client Secret value
6. Go to "API permissions" → "Add a permission" → "Microsoft Graph"
   - Add: `Calendars.Read`, `User.Read`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft Calendar OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# Base URL for OAuth callbacks
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

Generate a random secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Accounts**: Click the "Accounts" button in the top right
2. **Add Calendar**: Choose Google Calendar or Microsoft 365
3. **Authorize**: Sign in and grant calendar read permissions
4. **View Events**: Your events will automatically load and display on the calendar

## Project Structure

```
bigcal/
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth routes for Google & Microsoft
│   │   └── calendar/      # Calendar event fetching
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # ShadCN UI components
│   ├── account-manager.tsx
│   ├── month-calendar.tsx
│   ├── oauth-handler.tsx
│   └── yearly-calendar.tsx
├── hooks/
│   └── use-calendar-sync.ts
├── lib/
│   ├── calendar-store.ts  # State management
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
└── ...config files
```

## Features in Detail

### Yearly Calendar Grid

- Each month is displayed in its own card with a traditional calendar grid
- Days show up to 3 events with color coding
- "+X more" indicator for days with many events
- Current day is highlighted with a ring

### Account Management

- Add multiple accounts from different providers
- Each account gets a unique color for easy identification
- Remove accounts at any time
- Account credentials stored locally (browser localStorage)

### Event Display

- Events are color-coded by account
- Supports both all-day and timed events
- Automatically fetches up to 2500 events per account
- Events displayed chronologically within each day

## Security Notes

- OAuth tokens are stored in browser localStorage
- API routes handle token exchange server-side
- Never commit `.env.local` to version control
- Tokens are used only for read-only calendar access

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### OAuth Redirect Issues

Make sure your redirect URIs in Google Cloud Console and Azure Portal exactly match your configured URLs.

### Events Not Loading

1. Check browser console for API errors
2. Verify environment variables are set correctly
3. Ensure OAuth scopes include calendar read permissions
4. Check that access tokens are being stored (DevTools → Application → localStorage)

### Build Errors

Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
