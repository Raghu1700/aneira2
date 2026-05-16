import { Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Props {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
}

export default function ShippingUpdateEmail({ orderNumber, customerName, trackingNumber, carrier }: Props) {
  return (
    <EmailLayout preview={`Your Aneira order ${orderNumber} has shipped`}>
      <Heading className="m-0 font-serif text-2xl text-navy">On its way, {customerName.split(' ')[0]}.</Heading>
      <Text className="mt-2 text-base text-ink">
        Order <strong>{orderNumber}</strong> has been dispatched.
      </Text>
      <Section className="my-6 rounded-sm border border-line bg-ivory p-4">
        <Text className="m-0 text-xs uppercase tracking-[0.18em] text-muted">Tracking number</Text>
        <Text className="m-0 mt-1 font-mono text-lg text-navy">{trackingNumber}</Text>
        {carrier ? (
          <Text className="m-0 mt-2 text-sm text-muted">via {carrier}</Text>
        ) : null}
      </Section>
      <Text className="text-sm text-muted">
        You'll receive a delivery notification once the courier confirms it. If you have any questions, reply
        to this email — someone from our atelier will respond.
      </Text>
    </EmailLayout>
  );
}
