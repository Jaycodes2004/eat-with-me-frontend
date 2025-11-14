# Vercel Deployment Instructions

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Go to [vercel.com](https://vercel.com) and import your repository.**
3. Vercel will auto-detect your Vite + React project.
4. Ensure the following settings:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build` (or auto-detected)
   - **Output Directory:** `build`
5. The included `vercel.json` routes all requests to `index.html` for SPA support.
6. If you use environment variables, add them in the Vercel dashboard under Project Settings > Environment Variables.
7. Click "Deploy".

Your app will be live on your Vercel domain after deployment.