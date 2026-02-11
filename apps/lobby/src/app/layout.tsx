import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '春秋 - Chunqiu Strategy Game',
  description: 'A turn-based strategy game set in ancient China Spring and Autumn period',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
