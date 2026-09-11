import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '오늘 살 수 있는 집 | 서울 아파트 자산 시뮬레이터',
  description:
    '나의 자산과 대출 조건으로 알아보는 서울 아파트 최대 매수가. 시나리오, 대출상품, 금리와 정책 변화를 함께 비교해 보세요.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
