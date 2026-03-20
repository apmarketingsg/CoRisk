/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // In Next.js 14, the option is 'serverComponentsExternalPackages'.
    // pptxgenjs must run server-side only (uses Node.js APIs).
    serverComponentsExternalPackages: ['pptxgenjs'],
  },
}

module.exports = nextConfig
