# Deployment Guide - AI Prompt Pro

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest and best option for Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-prompt-pro.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
5. Click "Deploy"

**Done!** Your app will be live at `https://your-app.vercel.app`

### Automatic Deployments

- Every push to `main` branch = automatic production deploy
- Pull requests = automatic preview deployments
- Zero configuration needed

---

## Alternative: Deploy to Netlify

### Step 1: Build Settings

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Step 2: Deploy

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy site"

---

## Alternative: Cloudflare Pages

### Step 1: Configure Build

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Framework preset**: Next.js

### Step 2: Environment Variables

Add in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Alternative: AWS Amplify

### Step 1: Create amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 2: Deploy

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect to GitHub
4. Add environment variables
5. Deploy

---

## Mobile App Deployment (Native Apps)

If you want native iOS/Android apps:

### Option 1: Capacitor (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

Then:
- **iOS**: Open in Xcode, build, and submit to App Store
- **Android**: Open in Android Studio, build, and submit to Play Store

### Option 2: Progressive Web App (PWA)

Add PWA support for installable web app:

```bash
npm install next-pwa
```

Update `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  reactStrictMode: true,
})
```

---

## Environment Variables

### Required Variables

Copy from your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables (if using server-side LLM calls)

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

---

## Pre-Deployment Checklist

### 1. Build Locally First

```bash
npm run build
npm start
```

Visit http://localhost:3000 and test thoroughly.

### 2. Check for Errors

```bash
npm run lint
```

Fix any linting errors.

### 3. Test All Features

- [ ] User signup/login
- [ ] Dashboard loads correctly
- [ ] Quick mode builder works
- [ ] Advanced builder works
- [ ] Library displays projects
- [ ] Tutorial modal appears for new users
- [ ] API key settings (if applicable)

### 4. Verify Environment Variables

- [ ] Supabase URL is correct
- [ ] Supabase anon key is correct
- [ ] Database tables exist (run migrations if needed)

### 5. Security Check

- [ ] No hardcoded secrets in code
- [ ] `.env.local` is in `.gitignore`
- [ ] API keys are environment variables only
- [ ] Supabase Row Level Security (RLS) is enabled

---

## Post-Deployment

### 1. Set Up Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Netlify:**
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS

### 2. Configure Supabase Auth Redirect

In your Supabase dashboard:
1. Go to Authentication → URL Configuration
2. Add your production URL to "Site URL"
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

### 3. Monitor Performance

**Vercel Analytics:**
- Enable in Project Settings → Analytics
- Track Core Web Vitals
- Monitor page load times

**Custom Analytics:**
- Add Google Analytics
- Track tutorial completion rate
- Monitor user journeys

### 4. Set Up Error Tracking (Optional)

Install Sentry:

```bash
npm install @sentry/nextjs
```

Initialize and deploy.

---

## Mobile Testing URLs

### Local Testing

- **Desktop**: http://localhost:3004
- **Mobile (same WiFi)**: http://10.0.0.196:3004

### Production Testing

- **Desktop**: Your production URL
- **Mobile**: Same production URL (responsive design)

### Test on Real Devices

1. **iOS**: Safari on iPhone/iPad
2. **Android**: Chrome on Android device
3. **Tablet**: Test on both orientations

---

## Performance Optimization

Already implemented:
- ✅ Removed unused dependencies
- ✅ Debounced search
- ✅ Auth context caching
- ✅ Skeleton loading screens
- ✅ Clean build (no warnings)

### Additional Optimizations

Enable in production:

1. **Vercel Edge Functions** (for API routes)
2. **Image Optimization** (when using images)
3. **Analytics** (Core Web Vitals)
4. **CDN caching** (automatic on Vercel/Netlify/Cloudflare)

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working

- Ensure they start with `NEXT_PUBLIC_` for client-side use
- Restart dev server after adding variables
- Redeploy after updating variables in hosting platform

### Supabase Connection Issues

- Check CORS settings in Supabase
- Verify API keys are correct
- Ensure RLS policies are set up correctly

### Mobile App Not Loading

- Check that web app is deployed first
- Verify Capacitor configuration
- Run `npx cap sync` after changes

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **Capacitor Docs**: https://capacitorjs.com/docs

---

## Cost Estimates

### Free Tier Limits

**Vercel Free:**
- Unlimited deployments
- 100GB bandwidth/month
- Good for testing and small projects

**Netlify Free:**
- 100GB bandwidth/month
- 300 build minutes/month

**Cloudflare Pages Free:**
- Unlimited bandwidth
- 500 builds/month

**Supabase Free:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users

### When to Upgrade

Upgrade to paid plans when:
- > 100GB bandwidth/month
- > 500MB database size
- Need team collaboration features
- Require custom domains on multiple projects

---

## Next Steps After Deployment

1. **Share your app** with beta testers
2. **Collect feedback** on tutorial effectiveness
3. **Monitor analytics** to see user behavior
4. **Iterate** based on real usage data
5. **Add features** from user requests

Happy deploying! 🚀
