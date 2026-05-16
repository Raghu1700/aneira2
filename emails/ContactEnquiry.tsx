import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ContactEnquiryEmail({ name, email, phone, subject, message }: Props) {
  return (
    <EmailLayout preview={`Contact: ${subject || name}`}>
      <Heading className="m-0 font-serif text-2xl text-navy">Contact form</Heading>
      <Section className="mt-4">
        <Text className="m-0 text-sm text-ink"><strong>Name:</strong> {name}</Text>
        <Text className="m-0 text-sm text-ink"><strong>Email:</strong> {email}</Text>
        {phone ? <Text className="m-0 text-sm text-ink"><strong>Phone:</strong> {phone}</Text> : null}
        {subject ? <Text className="m-0 text-sm text-ink"><strong>Subject:</strong> {subject}</Text> : null}
        {message ? <Text className="m-0 mt-3 text-sm text-ink"><strong>Message:</strong><br />{message}</Text> : null}
      </Section>
    </EmailLayout>
  );
}
