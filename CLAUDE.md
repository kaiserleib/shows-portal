# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

A show signup system for 302 Comedy. Comics can sign up for open mics and shows, and showrunners can manage their events.

## Related Repos

- **302comedy-supabase** - Database migrations and edge functions (shared backend)
- **video-portal** - Video portal for performers (shares same Supabase project)

## Tech Stack

- React 19 + Vite (frontend)
- Supabase (authentication + PostgreSQL database) - shared with video-portal
- react-router-dom for routing
- Sentry for error tracking

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Environment Variables

See `.env.example` - uses same Supabase project as video-portal.

## App Structure

```
src/
  pages/
    LandingPage.jsx       # Public shows list
    ShowPage.jsx          # Public show details + signup form
    Dashboard.jsx         # Showrunner dashboard
    MySignups.jsx         # Comic's signup history
  components/             # Reusable components
  styles/                 # CSS modules
  supabaseClient.js       # Supabase client config
  App.jsx                 # Main app with routing
```

## Database Tables (in 302comedy-supabase)

- `showrunners` - Producers who can create shows
- `shows` - Individual show instances
- `show_signups` - Comic registrations for shows
- `show_lottery_results` - Audit trail for bucket/lottery draws
- `profiles` - Shared with video-portal

## Signup Strategies

1. **Curated** - Unlimited signups, showrunner picks lineup
2. **Numbered** - Online gets evens, in-person gets odds, order at signup time
3. **Bucket** - Random lottery selection

## Authentication

- Google OAuth via Supabase Auth (same as video-portal)
- Magic link option for email-only login
- Comics can sign up anonymously (just email) or with full account
