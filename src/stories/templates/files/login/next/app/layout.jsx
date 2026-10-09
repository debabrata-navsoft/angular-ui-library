import './globals.css';

export const metadata = { title: 'Sign in', icons: { icon: '/logo.svg' } };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
