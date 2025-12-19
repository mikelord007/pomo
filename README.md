# Pomodoro Focus Tracker

A personal web app to track mental focus and attentional self-regulation using Pomodoro sessions. Tracks focus quality (clean/recovered/abandoned) with distraction logging and comprehensive metrics.

## Tech Stack

- **Frontend**: Next.js 16+ with TypeScript
- **Backend/DB**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - This creates the `session_status` enum and `pomodoro_sessions` table

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- **Pomodoro Timer**: 25-minute focus sessions
- **Distraction Tracking**: One-tap logging of distractions
- **Session States**: Clean (uninterrupted), Recovered (distractions but returned), Abandoned (lost focus)
- **Metrics Dashboard**: Daily trends, recovery rates, distraction patterns
- **Keyboard Shortcuts**:
  - `Space/Enter`: Start session
  - `D`: Log distraction
  - `A`: Abandon session

## Design Philosophy

- **Honesty over gamification**: No scores, no shaming
- **Distraction awareness = progress**: High distraction counts are data, not failure
- **Information-dense metrics**: Show trends and patterns, not judgments
- **Lightweight interactions**: One-tap distraction logging
