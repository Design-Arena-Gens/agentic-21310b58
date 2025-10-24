import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoTrack · Carbon Footprint Intelligence',
  description:
    'EcoTrack helps individuals and organisations measure, analyse, and reduce their carbon footprint with precision analytics and actionable recommendations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
