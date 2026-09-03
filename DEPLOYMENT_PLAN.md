# Render.com Deployment Plan for Office Shift Manager

## Overview
Deploy the Office Shift Manager application to Render.com with PostgreSQL database (Free Tier).

## Architecture Changes Required

### 1. Database Migration (SQLite → PostgreSQL)
**Current:** SQLite with `better-sqlite3`  
**Target:** PostgreSQL with `pg` package

**Changes needed:**
- Update `backend/src/db.js` to use PostgreSQL
- Replace `better-sqlite3` with `pg` in `package.json`
- Update SQL queries (SQLite syntax → PostgreSQL)
- Handle JSON storage for holidays (PostgreSQL has native JSON type)

### 2. Backend Consolidation
**Current:** Two separate microservices (auth-service:5003, shift-manager-service:3002)  
**Target:** Single unified backend service

**Reason:** Render.com free tier allows one web service per project

**Changes needed:**
- Create unified backend entry point
- Combine routes from both services
- Single start command

### 3. Frontend Configuration
**Current:** Hardcoded `localhost` URLs  
**Target:** Environment-based URLs

**Changes needed:**
- Update API URLs to use environment variables or relative paths
- Build production bundle
- Serve from backend or separate static site

### 4. Render.com Configuration Files
- `render.yaml` - Infrastructure as code (optional but recommended)
- Environment variables configuration

## Implementation Steps

### Phase 1: Backend Updates
1. Install PostgreSQL dependencies
2. Rewrite database layer for PostgreSQL
3. Create unified backend server
4. Update package.json with start script

### Phase 2: Frontend Updates
1. Configure API base URL from environment
2. Update all API calls to use base URL
3. Add build configuration for production

### Phase 3: Render.com Setup
1. Create `render.yaml` for deployment
2. Configure environment variables
3. Deploy to Render.com

## Environment Variables Required

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
PORT=3000 (auto-set by Render)
```

## Estimated Changes

| File | Action |
|------|--------|
| `backend/package.json` | Update dependencies |
| `backend/src/db.js` | Rewrite for PostgreSQL |
| `backend/microservices/*/index.js` | Merge into single server |
| `frontend/src/components/*.jsx` | Update API URLs |
| `render.yaml` | Create new |
| `.env` | Update for PostgreSQL |

## Render.com Free Tier Limits

- **Web Services:** 750 hours/month (enough for one service)
- **PostgreSQL:** 90 days free trial, then $7/month
- **Static Sites:** Unlimited (free)
- **Bandwidth:** 100GB/month free

## Cost After Free Tier

- **PostgreSQL:** $7/month (Starter plan)
- **Web Service:** Free (with sleep after inactivity)
- **Total:** $7/month after 90-day trial

## Alternative Deployment Options

If Render.com doesn't meet your needs:

1. **Railway.app** - Free tier with PostgreSQL ($5 credit/month)
2. **Vercel** (frontend) + **Supabase** (backend/database) - Both free tiers
3. **Cyclic.sh** - Free tier for Node.js apps with PostgreSQL

## Next Steps

Please confirm:
1. Proceed with Render.com deployment plan?
2. Accept PostgreSQL cost after 90-day free trial ($7/month)?
3. Any questions about the implementation approach?
