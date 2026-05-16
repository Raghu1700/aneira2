import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  branch: string;
  interest?: string;
}

export default function AtelierBookingEmail({ name, email, phone, preferredDate, branch, interest }: Props) {
  return (
    <EmailLayout preview={`Atelier booking: ${name}`}>
      <Heading className="m-0 font-serif text-2xl text-navy">Atelier booking</Heading>
      <Section className="mt-4">
        <Text className="m-0 text-sm text-ink"><strong>Name:</strong> {name}</Text>
        <Text className="m-0 text-sm text-ink"><strong>Email:</strong> {email}</Text>
        {phone ? <Text className="m-0 text-sm text-ink"><strong>Phone:</strong> {phone}</Text> : null}
        <Text className="m-0 text-sm text-ink"><strong>Branch:</strong> {branch}</Text>
        <Text className="m-0 text-sm text-ink"><strong>Preferred date:</strong> {preferredDate}</Text>
        {interest ? (
          <Text className="m-0 mt-3 text-sm text-ink"><strong>Looking for:</strong><br />{interest}</Text>
        ) : null}
      </Section>
    </EmailLayout>
  );
}
