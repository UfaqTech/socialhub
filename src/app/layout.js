import './globals.css';

export const metadata = {
  title: 'UfaqTech Admin Panel',
  description: 'Approve and manage live links from Supabase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
