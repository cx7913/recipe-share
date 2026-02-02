import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Recipe Share - 레시피 공유 서비스',
  description: '맛있는 레시피를 공유하고 발견하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
