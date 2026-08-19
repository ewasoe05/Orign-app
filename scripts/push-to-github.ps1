# Push to GitHub — run once after installing GitHub CLI

Write-Host "Step 1: Log in to GitHub (opens browser)" -ForegroundColor Cyan
gh auth login

Write-Host "`nStep 2: Create private repo and push" -ForegroundColor Cyan
gh repo create two-year-dashboard --private --source=. --remote=origin --push

Write-Host "`nDone! Next: import the repo at https://vercel.com/new" -ForegroundColor Green
Write-Host "See PRODUCTION_CHECKLIST.md for env vars and Supabase config." -ForegroundColor Green
