import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saans — Winter Smog Companion',
  description:
    'A GenAI-powered assistant helping families and communities navigate severe winter smog and urban air pollution with personalized low-emission routines and transparent impact modeling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-bg text-ink selection:bg-accent selection:text-accent-ink">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="max-w-[1100px] mx-auto px-4 py-6 md:px-8">{children}</div>
      </body>
    </html>
  );
}
