/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify
  output: 'export',
  
  // Optional: Add a trailing slash for Netlify compatibility
  trailingSlash: true,
  
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Optional: Configure images if needed
  images: {
    unoptimized: true, // Required for static exports
  },
}

module.exports = nextConfig
