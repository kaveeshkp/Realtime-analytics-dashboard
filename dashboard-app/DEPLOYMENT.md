# Deployment Guide

## Overview

The Real-Time Analytics Dashboard is configured for deployment on Vercel with automated CI/CD pipelines via GitHub Actions.

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
   - Log in to [Vercel](https://vercel.com)
   - Click "Add New..." > "Project"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Environment Variables**
   - In Vercel Project Settings > "Environment Variables"
   - Add the following variables for production:
     ```
     VITE_API_URL=https://api.your-domain.com
     VITE_WS_URL=wss://api.your-domain.com/ws
     ```

3. **Deploy**
   - Vercel automatically deploys on every push to `main` branch
   - Preview deployments are created for all pull requests

### Environment Variables

#### Development (`.env.local`)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws
```

#### Production (`.env.production`)
```env
VITE_API_URL=https://api.production-domain.com
VITE_WS_URL=wss://api.production-domain.com/ws
```

**Note**: Store sensitive values in Vercel's Environment Variables dashboard, not in `.env.production`.

## Continuous Integration / Continuous Deployment

### GitHub Actions Workflow

The `.github/workflows/test-and-build.yml` workflow:

1. **Triggers** on:
   - Push to `main` or `develop` branches
   - Pull requests to `main` or `develop`

2. **Steps**:
   - Checkout code
   - Setup Node.js (tests on 18.x and 20.x)
   - Install dependencies
   - Run tests with coverage
   - Build the application
   - Upload coverage reports
   - Archive build artifacts
   - Comment on PRs with status

3. **Requirements for Merge**:
   - All tests must pass
   - Build must succeed without errors
   - Code coverage must meet thresholds (40%+)

### Setting Up Branch Protection

1. Go to Repository Settings > "Branches"
2. Click "Add rule" for the `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - ✅ Include administrators

## Local Deployment Preview

Test production-like builds locally:

```bash
# Build the production bundle
npm run build

# Preview the build
npm run preview
```

Visit `http://localhost:4173` to see the production build.

## Troubleshooting

### Build Fails with "terser not found"
```bash
npm install --save-dev terser
npm run build
```

### Environment Variables Not Loading
1. Verify `.env.local` or `.env.production` exists
2. Restart dev server: `npm run dev`
3. Check Vercel dashboard for Variable overrides

### TypeScript Errors During Build
```bash
npm run build
# Read the error messages carefully and fix file-by-file
# Ensure tsconfig.json excludes test files
```

### Bundle Size Warnings
```bash
npm run build
# Review the chunk analysis above the warning
# Consider code-splitting or lazy loading for large routes
```

## Monitoring

### Build Metrics
- Visit Vercel Dashboard > Project > "Deployments" to see:
  - Build time
  - Bundle size
  - Function count (for serverless)

### Error Tracking
- Check Vercel Logs for runtime errors
- Use the browser's DevTools Console for client-side errors
- Backend errors should be logged to your logging service

## Rollback

To rollback a deployment:

1. Go to Vercel Dashboard > Deployments
2. Find the deployment to rollback to
3. Click "..." > "Promote to Production"

Alternatively, revert the Git commit and push to main:
```bash
git revert <commit-hash>
git push origin main
```

## Analytics & Performance

### Lighthouse Checks
Use Vercel's Web Analytics or Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://your-domain.com
```

**Target Scores**:
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Core Web Vitals
Monitor at: https://your-domain.com/?lightspeed=metrics

Monitor in production using the Performance Monitoring service integrated into the app.

## Troubleshooting Checklist

- [ ] All tests passing locally: `npm run test:coverage`
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run build`
- [ ] Environment variables configured in Vercel
- [ ] Branch protection rules enabled
- [ ] Deploy preview shows correct content
- [ ] All routes accessible in preview
- [ ] WebSocket connects in production

## Next Steps

1. Configure monitoring/alerts in Vercel dashboard
2. Set up error tracking service (e.g., Sentry)
3. Configure custom domain and SSL
4. Setup analytics and performance monitoring
5. Document API endpoints and deployment procedures for team
