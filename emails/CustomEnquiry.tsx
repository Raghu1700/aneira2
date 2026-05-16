import { Heading, Section, Text, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  name: string;
  email: string;
  phone?: string;
  occasion?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  referenceImages?: string[];
}

export default function CustomEnquiryEmail({
  name,
  email,
  phone,
  occasion,
  budget,
  timeline,
  message,
  referenceImages,
}: Props) {
  return (
    <EmailLayout preview={`Custom design enquiry from ${name}`}>
      <Heading className="m-0 font-serif text-2xl text-navy">Custom design enquiry</Heading>
      <Section className="mt-4">
        <Text className="m-0 text-sm text-ink"><strong>Name:</strong> {name}</Text>
        <Text className="m-0 text-sm text-ink"><strong>Email:</strong> {email}</Text>
        {phone ? <Text className="m-0 text-sm text-ink"><strong>Phone:</strong> {phone}</Text> : null}
        {occasion ? <Text className="m-0 text-sm text-ink"><strong>Occasion:</strong> {occasion}</Text> : null}
        {budget ? <Text className="m-0 text-sm text-ink"><strong>Budget:</strong> {budget}</Text> : null}
        {timeline ? <Text className="m-0 text-sm text-ink"><strong>Timeline:</strong> {timeline}</Text> : null}
        {message ? <Text className="m-0 mt-3 text-sm text-ink"><strong>Notes:</strong><br />{message}</Text> : null}
        {referenceImages && referenceImages.length > 0 ? (
          <Section className="mt-3">
            <Text className="m-0 text-sm text-ink"><strong>Reference images:</strong></Text>
            {referenceImages.map((url, i) => (
              <Text key={i} className="m-0 text-sm">
                <Link href={url} className="text-navy underline">Image {i + 1}</Link>
              </Text>
            ))}
          </Section>
        ) : null}
      </Section>
    </EmailLayout>
  );
}
