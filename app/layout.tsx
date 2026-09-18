import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeNest — AI Coding Learning',
  description: 'Learn Python, SQL, Java and more with an AI coding tutor.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
