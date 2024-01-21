import { GlobalNav } from '@/components/GlobalNav';
import './globals.css';

import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { GlobalFooter } from '@/components/GlobalFooter';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Providers from './providers';
import { ReactNode } from 'react';

config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'George McCarron',
  description: 'Software engineer based in London, UK.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} flex flex-col min-h-screen w-full`}>
        <Providers>
          <GlobalNav />
          <main className='max-w-screen-lg w-full box-border px-4 my-8 self-center flex-1'>
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
          <GlobalFooter />
        </Providers>
      </body>
    </html>
  );
}
