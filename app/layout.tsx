import type { Metadata } from 'next';
import './globals.css';
import './enhancements.css';
import { StoreProvider } from '@/components/StoreProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Drawers from '@/components/Drawers';
import Toast from '@/components/Toast';
import DiscountModal from '@/components/DiscountModal';
import RevealObserver from '@/components/Reveal';
import HashScroll from '@/components/HashScroll';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import PageFade from '@/components/PageFade';

export const metadata: Metadata = {
  title: 'Aneira by Lalitha Thanga Maaligai — A quiet language of luxury',
  description:
    'A Chennai atelier of fine jewellery. Crafted by master artisans since 1986, designed for the way modern women live.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <ScrollProgress />
          <Nav />
          <main>
            <PageFade>{children}</PageFade>
          </main>
          <Footer />
          <Drawers />
          <Toast />
          <DiscountModal />
          <RevealObserver />
          <HashScroll />
          <BackToTop />
          <a
            href="https://wa.me/919000000000?text=Hello%20Aneira%2C%20I%27m%20interested%20in"
            className="whatsapp-float"
            aria-label="Chat on WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
              <path d="M13 2C6.9 2 2 6.9 2 13c0 2.1.6 4.2 1.8 6L2 24l5.3-1.7c1.7 1 3.7 1.5 5.7 1.5 6.1 0 11-4.9 11-11S19.1 2 13 2Zm0 20c-1.8 0-3.5-.5-4.9-1.4l-.4-.2-3.1 1 1-3.1-.2-.4C4.6 16.5 4 14.8 4 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9Zm5-6.8c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.1s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 2 3 4.8 4.1.7.3 1.2.5 1.5.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" />
            </svg>
          </a>
        </StoreProvider>
      </body>
    </html>
  );
}
