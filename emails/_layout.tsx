import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        navy: '#334F65',
        cream: '#FAF7F2',
        ivory: '#F2EDE4',
        gold: '#C9A961',
        ink: '#1A1A1A',
        muted: '#6B6B6B',
        line: '#E5DFD4',
      },
    },
  },
};

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-cream font-sans text-ink">
          <Container className="mx-auto my-10 max-w-[560px] bg-cream p-6">
            <Section>
              <Text className="m-0 text-center text-3xl tracking-wide text-navy">Aneira</Text>
              <Text className="m-0 mt-1 text-center text-xs uppercase tracking-[0.18em] text-muted">
                A Lalitha Thanga Maaligai atelier
              </Text>
            </Section>
            <Hr className="my-6 border-line" />
            {children}
            <Hr className="my-8 border-line" />
            <Text className="m-0 text-center text-xs text-muted">
              Aneira by Lalitha Thanga Maaligai &middot; Chennai &middot;{' '}
              <a href="https://aneira.co" className="text-navy underline">
                aneira.co
              </a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
