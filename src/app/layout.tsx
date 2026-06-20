import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Conserium",
  description: "Personal AI memory for saved knowledge.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var theme=localStorage.getItem("conserium-theme");document.documentElement.dataset.theme=theme==="light"?"light":"dark";}catch{document.documentElement.dataset.theme="dark";}`,
      }}
    />
  );
}
