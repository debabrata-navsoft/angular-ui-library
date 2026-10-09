import './globals.css';

export const metadata = { title: 'Shopora: online store', icons: { icon: '/logo.svg' } };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
