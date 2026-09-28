import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyFitPlan — Your body. Your plan. Your journey.',
  description: 'A personalized home workout plan built around your goal, fitness level and lifestyle.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
