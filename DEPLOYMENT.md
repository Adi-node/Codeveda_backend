# Backend Deployment Guide - Vercel Serverless

This guide will help you deploy your Express.js backend as serverless functions on Vercel.

## What Changed for Serverless

### ✅ **Serverless Adaptations Made:**

1. **Created `api/index.js`** - Serverless entry point that replaces `server.js`
2. **Updated CORS Configuration** - Added support for Vercel domains
3. **Modified Logging** - Simplified logging for serverless environment
4. **Removed Server Listener** - Serverless functions don't need `app.listen()`
5. **Added Route Handling** - All routes now handled through single serverless function

### 🔧 **Key Differences:**

- **No persistent server**: Each request starts a new function instance
- **Stateless**: No in-memory state between requests (good - you're using Supabase)
- **Cold starts**: First request may be slower
- **10-second timeout**: Functions must complete within 10 seconds

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Your database must be accessible from Vercel
3. **Environment Variables**: All secrets must be configured in Vercel

## Environment Variables Setup

### Required Environment Variables:

Set these in Vercel Dashboard under Project Settings > Environment Variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-random-jwt-secret-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Environment
NODE_ENV=production
```

### 🔑 **How to Get These Values:**

1. **Supabase Values**: Go to your Supabase project > Settings > API
2. **JWT Secret**: Generate with `openssl rand -base64 32`
3. **Frontend URL**: Your deployed frontend Vercel URL

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel serverless deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect it as a Node.js project
   - Set environment variables in dashboard
   - Deploy!

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables (repeat for each var)
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add FRONTEND_URL

# Deploy to production
vercel --prod
```

### Method 3: Using Package Scripts

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production  
npm run deploy:vercel

# Test locally with serverless simulation
npm run local:serverless
```

## File Structure After Setup

```
backend/
├── api/
│   └── index.js          # Serverless entry point
├── src/
│   ├── routes/           # Your existing routes
│   ├── middleware/       # Your existing middleware
│   ├── models/           # Your existing models
│   └── config/           # Your existing config
├── vercel.json           # Vercel configuration
├── package.json          # Updated with deployment scripts
├── server.js             # Original server (still works for local dev)
└── DEPLOYMENT.md         # This guide
```

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "CodeVeda API is running on Vercel Serverless",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Test Authentication
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Test with Frontend
Update your frontend's `VITE_API_URL` to point to your deployed backend:
```bash
VITE_API_URL=https://your-backend.vercel.app
```

## Common Issues & Solutions

### Issue: Cold Start Timeouts
**Symptoms**: First request takes long or times out
**Solution**: 
- Optimize imports (only import what you need)
- Use connection pooling in Supabase
- Consider upgrading to Vercel Pro for faster cold starts

### Issue: CORS Errors
**Symptoms**: Browser blocks requests from frontend
**Solution**:
- Set `FRONTEND_URL` environment variable
- Ensure your frontend domain is in CORS origins
- Check browser network tab for exact error

### Issue: Database Connection Errors
**Symptoms**: "Missing Supabase environment variables"
**Solution**:
- Verify all Supabase environment variables are set
- Check Supabase project is accessible from Vercel
- Test connection with a simple health check

### Issue: Function Timeout
**Symptoms**: 504 errors or timeout messages
**Solution**:
- Optimize database queries
- Check for infinite loops
- Consider breaking large operations into smaller chunks

### Issue: Environment Variables Not Working
**Symptoms**: "undefined" values in production
**Solution**:
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

## Performance Considerations

### ✅ **Optimizations Included:**

1. **Connection Reuse**: Supabase client is initialized once per function
2. **Minimal Logging**: Reduced logging overhead in production
3. **Helmet Security**: Optimized security headers
4. **Rate Limiting**: Prevents abuse

### 🚀 **Further Optimizations:**

1. **Database Indexes**: Ensure your Supabase tables have proper indexes
2. **Connection Pooling**: Supabase handles this automatically
3. **Caching**: Consider Redis or in-memory caching for frequent queries
4. **Async Operations**: All database operations are already async

## Monitoring & Debugging

### Vercel Dashboard:
- **Functions**: Monitor function performance and errors
- **Logs**: View real-time function logs
- **Analytics**: Track usage and performance

### Supabase Dashboard:
- **API Logs**: Monitor database queries
- **Performance**: Check slow queries
- **Auth**: Monitor authentication events

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Frontend `VITE_API_URL` updated to backend URL
- [ ] CORS configured with correct frontend URL
- [ ] Database accessible from Vercel
- [ ] Health check endpoint working
- [ ] Authentication flow tested
- [ ] Rate limiting configured appropriately
- [ ] Error handling tested
- [ ] Logs monitored in Vercel dashboard

## Rollback Strategy

If issues arise:
1. **Vercel**: Use "Rollback" in Vercel dashboard
2. **Environment**: Check environment variables
3. **Local Testing**: Test with `npm run local:serverless`
4. **Database**: Verify Supabase connectivity

## Need Help?

1. **Vercel Docs**: [vercel.com/docs/functions/serverless-functions](https://vercel.com/docs/functions/serverless-functions)
2. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
3. **Function Logs**: Check Vercel dashboard for detailed error logs
4. **Local Testing**: Use `vercel dev` to simulate serverless locally

---

Your backend is now ready for serverless deployment on Vercel! 🚀