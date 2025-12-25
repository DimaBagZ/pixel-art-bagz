/** @type {import('next').NextConfig} */
const nextConfig = {
  // Настройки для более стабильной работы с несколькими клиентами
  // Отключаем агрессивное кэширование в dev-режиме для избежания проблем с chunks
  onDemandEntries: {
    // Период в мс, в течение которого страницы остаются в памяти
    maxInactiveAge: 25 * 1000,
    // Количество страниц, которые должны оставаться одновременно
    pagesBufferLength: 2,
  },
  // Явно указываем использование Turbopack (по умолчанию в Next.js 16)
  // Это убирает предупреждение о конфликте с webpack
  turbopack: {},

  // Оптимизации для production
  compress: true, // Включить gzip compression

  // Оптимизация изображений
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Заголовки для кэширования и безопасности
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    
    return [
      {
        // Применяем к статическим файлам (кроме SVG в dev режиме)
        source: "/:all*(jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // SVG файлы - меньше кэширование в dev, больше в production
        source: "/:all*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: isDev
              ? "public, max-age=0, must-revalidate"
              : "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Применяем к API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },

  // Отключаем заголовок X-Powered-By для безопасности
  poweredByHeader: false,

  // React Strict Mode для выявления проблем в development
  reactStrictMode: true,
};

module.exports = nextConfig;

