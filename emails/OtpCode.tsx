import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  code: string;
  expiresAt: Date | string;
}

export default function OtpCodeEmail({ code, expiresAt }: Props) {
  const minutes = Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 60_000),
  );
  return (
    <EmailLayout preview="Your Aneira sign-in code">
      <Heading className="m-0 font-serif text-2xl text-navy">Your sign-in code</Heading>
      <Text className="mt-4 text-base text-ink">
        Use this code to sign in to your Aneira account.
      </Text>
      <Section className="my-6 rounded-sm border border-line bg-ivory p-4 text-center">
        <Text className="m-0 font-mono text-3xl tracking-[0.4em] text-navy">{code}</Text>
      </Section>
      <Text className="text-sm text-muted">
        This code expires in {minutes} minute{minutes === 1 ? '' : 's'}. If you did not request it, you
        can safely ignore this email — we will never ask you to share it with anyone.
      </Text>
    </EmailLayout>
  );
}
