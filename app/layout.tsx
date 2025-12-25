import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Пиксель Арт Бункер",
    template: "%s | Пиксель Арт Бункер",
  },
  description:
    "Исследуй мрачный бункер в стиле Fallout, собирай предметы, повышай уровень и выживай в постапокалиптическом мире. Пиксель-арт игра с системой инвентаря, опыта и достижений.",
  keywords: [
    "пиксель арт",
    "pixel art",
    "fallout",
    "бункер",
    "игра",
    "постапокалипсис",
    "инвентарь",
    "статистика",
    "достижения",
    "pixel art game",
    "survival game",
  ],
  authors: [{ name: "BagZ" }],
  creator: "BagZ",
  publisher: "BagZ",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://pixel-art-bagz.vercel.app",
    title: "Пиксель Арт Бункер - Исследуй и выживай",
    description:
      "Исследуй мрачный бункер в стиле Fallout, собирай предметы, повышай уровень и выживай в постапокалиптическом мире.",
    siteName: "Пиксель Арт Бункер",
  },
  twitter: {
    card: "summary_large_image",
    title: "Пиксель Арт Бункер - Исследуй и выживай",
    description:
      "Исследуй мрачный бункер в стиле Fallout, собирай предметы, повышай уровень и выживай в постапокалиптическом мире.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a1a1a" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function handleChunkError(error) {
                  const message = error?.message || error || '';
                  if (
                    message.includes('ChunkLoadError') ||
                    message.includes('Failed to fetch dynamically imported module') ||
                    message.includes('Loading chunk') ||
                    error?.name === 'ChunkLoadError'
                  ) {
                    console.warn('Обнаружена ошибка загрузки chunk, перезагружаем страницу...');
                    setTimeout(function() {
                      window.location.reload();
                    }, 100);
                    return true;
                  }
                  return false;
                }
                
                window.addEventListener('error', function(event) {
                  if (handleChunkError(event.error || event)) {
                    event.preventDefault();
                  }
                });
                
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason;
                  const message = typeof reason === 'string' ? reason : reason?.message || '';
                  if (
                    message.includes('ChunkLoadError') ||
                    message.includes('Failed to fetch dynamically imported module') ||
                    message.includes('Loading chunk')
                  ) {
                    console.warn('Обнаружена ошибка загрузки chunk в Promise, перезагружаем страницу...');
                    event.preventDefault();
                    setTimeout(function() {
                      window.location.reload();
                    }, 100);
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
