# AI Prompt Pro - Claude Session Memory

## Project Overview
**AI Prompt Pro** (Smart Prompt Pro) - A turnkey prompt engineering platform built with Next.js 15 + TypeScript, Supabase, and deployed on Vercel.

## Live URLs
- **Production**: https://smart-prompt-pro.vercel.app
- **GitHub**: https://github.com/Bizgrowth/Smart_Prompt_Pro

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, CSS Modules
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Hosting**: Vercel (auto-deploy from GitHub)
- **AI Providers**: Claude (Anthropic), Google Gemini

### Key Design Decision: Turnkey App
The app uses **server-side API keys** (Vercel env vars) so users don't need to configure their own. This is intentional - users just sign up and use the app immediately.

## Environment Variables (Vercel)
```
CLAUDE_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_SUPABASE_URL=https://rtfehrkoxpdepjmtpbco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Database Tables (Supabase)
1. **prompt_projects** - Main project metadata
2. **prompt_components** - Versioned prompt content (32 fields)
3. **user_settings** - Encrypted API keys (legacy, not used in turnkey mode)
4. **prompt_templates** - Pre-built templates
5. **prompt_results** - Execution history

## Key Files

### API Routes (Server-side, use env vars)
- `app/api/analyze-prompt/route.ts` - Extracts fields from natural language
- `app/api/execute-prompt/route.ts` - Runs prompt against LLM
- `app/api/continue-conversation/route.ts` - Multi-turn conversations

### Main Pages
- `app/dashboard/page.tsx` - User dashboard
- `app/builder/quick/page.tsx` - Quick Mode (natural language -> structured prompt)
- `app/builder/advanced/page.tsx` - Advanced Builder (full form)
- `app/library/page.tsx` - Saved prompts library
- `app/settings/api-keys/page.tsx` - (Legacy) API key settings

### Supabase
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `supabase/schema.sql` - Full database schema

## Recent Changes (This Session)

### 1. Server-Side API Keys (Turnkey Experience)
All API routes now fall back to `process.env.CLAUDE_API_KEY` and `process.env.GEMINI_API_KEY` when no user key is provided. Users don't need to configure anything.

### 2. Removed Client-Side API Key Checks
`app/builder/quick/page.tsx` no longer checks localStorage for API keys. It just sends requests to the server.

### 3. Updated Dashboard
Removed "Set Up Your API Keys" step. Now shows:
1. Create Your First Project
2. Execute with AI (pre-configured)
3. Save & Track Performance

### 4. Fixed Select Dropdown Cursor
Added `cursor: pointer` to `.aiSuggested` select elements in `quick.module.css`.

### 5. TypeScript Fixes for Vercel
Added `as any` type assertions to Supabase queries because auto-generated types don't include custom tables.

## Workflow: Local -> GitHub -> Vercel
```bash
# 1. Make changes locally
# 2. Test with: npm run dev

# 3. Commit
git add .
git commit -m "Description

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4. Push (triggers Vercel auto-deploy)
git push origin main

# 5. Vercel builds automatically (1-2 min)
```

## Testing Accounts
- Email: dschley@aiopsexpert.com
- Supabase project: rtfehrkoxpdepjmtpbco

## Pending Work (from STATUS.md plan)

### Not Yet Implemented
- [ ] Templates page with pre-built prompts
- [ ] Execution results tracking
- [ ] Performance metrics dashboard
- [ ] user_settings table in Supabase (for cloud sync feature - optional since turnkey)

### Advanced Builder Status
The Advanced Builder exists (`app/builder/advanced/page.tsx`) but may need the same TypeScript fixes applied.

## Common Issues & Solutions

### "Property X does not exist on type 'never'"
**Cause**: Supabase auto-generated types don't include custom tables
**Fix**: Add `as any` to `.from()` calls:
```typescript
const { data } = await (supabase.from('prompt_projects') as any).select('*')
```

### useSearchParams requires Suspense
**Cause**: Next.js 15 requires Suspense for useSearchParams during static generation
**Fix**: Wrap component in Suspense:
```typescript
export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <PageContent />
        </Suspense>
    )
}
```

### Vercel not deploying latest code
**Fix**: Push a new commit to trigger fresh build

## Git Commits (Recent)
- `fbdad28` - Fix cursor on select dropdowns
- `06913e5` - Remove client-side API key requirement for turnkey experience
- `6c77358` - Use server env vars as fallback for API keys
- `f18ba4b` - Force rebuild (TypeScript fixes)
