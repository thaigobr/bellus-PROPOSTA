/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Páginas de proposta são privadas: reforça noindex/nofollow no nível do header HTTP,
  // além das tags <meta> definidas via metadata API.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ]
  },
}

export default nextConfig
