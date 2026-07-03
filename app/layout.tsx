import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UfaqTech SocialHub Admin Panel',
  description: 'Secure admin dashboard for managing SocialHub content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
