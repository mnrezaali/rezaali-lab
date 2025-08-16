# Rezaali Lab

Welcome to Rezaali Lab, a collection of interactive workshop apps built with Next.js.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or later
- npm (comes with Node.js)

### Local Development

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd rezaali-lab
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deploy to Netlify

### Option 1: Netlify UI
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your Git provider and repository
5. Configure the build settings:
   - Build command: `npm run export`
   - Publish directory: `out`
6. Click "Deploy site"

### Option 2: Netlify CLI (Advanced)
1. Install Netlify CLI globally
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project
   ```bash
   npm run build
   npm run export
   ```

3. Deploy to Netlify
   ```bash
   netlify deploy --prod
   ```

## 🛠 Built With

- [Next.js](https://nextjs.org/) - The React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
