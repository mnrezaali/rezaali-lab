# GitHub Repository Setup Instructions

## 1. Initialize Git Repository
```bash
# Navigate to your project directory
cd /Users/rezaali/Documents/Vibing/windsurf/rezaali-lab

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Set up Next.js project with Netlify configuration"
```

## 2. Create a New Repository on GitHub
1. Go to [GitHub](https://github.com/new)
2. Enter "rezaali-lab" as the repository name
3. **DO NOT** initialize with README, .gitignore, or license
4. Click "Create repository"

## 3. Connect and Push to GitHub
```bash
# Add the remote repository (replace <your-github-username> with your actual GitHub username)
git remote add origin https://github.com/<your-github-username>/rezaali-lab.git

# Rename the default branch to main
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## 4. Verify Your Push
1. Refresh your GitHub repository page
2. You should see all your project files listed

## 5. Next Steps
- After pushing, you can proceed with Netlify deployment using the instructions in README.md
- Delete this file once you've completed the setup

## Troubleshooting
- If you get an authentication error, you may need to set up a personal access token:
  1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
  2. Generate a new token with 'repo' scope
  3. Use the token as your password when pushing
