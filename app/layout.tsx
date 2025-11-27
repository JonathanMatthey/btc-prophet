import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BTC Prophet - Bitcoin Price Prediction Game',
  description: 'Predict if Bitcoin goes up or down in 60 seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <div className="min-h-screen relative">
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#0066FF]/10 via-[#00D4FF]/5 to-transparent pointer-events-none" />
          {children}
        </div>
      </body>
    </html>
  );
}
