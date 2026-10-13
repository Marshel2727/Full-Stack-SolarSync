import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { QueryProvider } from '../context/QueryProvider';
import { SolarProvider } from '../context/SolarContext';
import { ToastContainer } from '../components/ui/ToastContainer';
import { RoleSwitcher } from '../components/shared/RoleSwitcher';

const isRoleDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_ROLE_DEMO === 'true';

export const metadata: Metadata = {
  title: 'SolarSync — Integrated Clean Energy Ecosystem Platform',
  description:
    'Platform ekosistem energi surya terpadu untuk edukasi, estimasi kebutuhan sistem PLTS, pengajuan instalasi, dan pemantauan energi real-time.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-slateText font-sans antialiased selection:bg-primary-fixed selection:text-primary-dark min-h-screen">
        <QueryProvider><AuthProvider>
          <SolarProvider>
            {children}
            <ToastContainer />
            {/* Role comes from authenticated server sessions, not a demo switcher. */}
          </SolarProvider>
        </AuthProvider></QueryProvider>
      </body>
    </html>
  );
}
