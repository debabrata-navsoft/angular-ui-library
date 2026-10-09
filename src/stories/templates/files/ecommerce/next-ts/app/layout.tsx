import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shopora: online store',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
