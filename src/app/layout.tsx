import { GlobalNav } from '@/components/GlobalNav';
import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GlobalFooter } from '@/components/GlobalFooter';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'George McCarron',
  description: 'Software engineer based in London, UK.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <GlobalNav />
        <main className='max-w-screen-lg mx-4 my-8 self-center flex-1'>
          {children}
        </main>
        <GlobalFooter />
      </body>
    </html>
  );
}
