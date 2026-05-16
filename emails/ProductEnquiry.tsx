import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  productTitle: string;
  productHandle: string;
}

export default function ProductEnquiryEmail({ name, email, phone, message, productTitle, productHandle }: Props) {
  return (
    <EmailLayout preview={`Enquiry: ${productTitle}`}>
      <Heading className="m-0 font-serif text-2xl text-navy">Product enquiry</Heading>
      <Section className="mt-4">
        <Text className="m-0 text-sm text-ink"><strong>Piece:</strong> {productTitle}</Text>
        <Text className="m-0 text-xs text-muted">/products/{productHandle}</Text>
        <Text className="m-0 mt-3 text-sm text-ink"><strong>Name:</strong> {name}</Text>
        <Text className="m-0 text-sm text-ink"><strong>Email:</strong> {email}</Text>
        {phone ? <Text className="m-0 text-sm text-ink"><strong>Phone:</strong> {phone}</Text> : null}
        {message ? <Text className="m-0 mt-3 text-sm text-ink"><strong>Message:</strong><br />{message}</Text> : null}
      </Section>
    </EmailLayout>
  );
}
