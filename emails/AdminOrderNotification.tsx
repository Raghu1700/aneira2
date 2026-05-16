import { Heading, Hr, Row, Column, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Item {
  title: string;
  quantity: number;
  lineTotal: string;
}

interface Props {
  orderNumber: string;
  total: string;
  customerEmail: string;
  customerName: string;
  items: Item[];
}

export default function AdminOrderNotificationEmail({ orderNumber, total, customerEmail, customerName, items }: Props) {
  return (
    <EmailLayout preview={`New order ${orderNumber}`}>
      <Heading className="m-0 font-serif text-2xl text-navy">New order: {orderNumber}</Heading>
      <Text className="mt-2 text-sm text-ink">
        <strong>Customer:</strong> {customerName} &lt;{customerEmail}&gt;
      </Text>
      <Text className="m-0 text-sm text-ink">
        <strong>Total:</strong> ₹{total}
      </Text>

      <Hr className="my-4 border-line" />
      <Section>
        {items.map((it, i) => (
          <Row key={i} className={i > 0 ? 'mt-2' : ''}>
            <Column>
              <Text className="m-0 text-sm text-ink">
                {it.quantity} × {it.title}
              </Text>
            </Column>
            <Column className="text-right">
              <Text className="m-0 text-sm text-muted">₹{it.lineTotal}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Text className="mt-6 text-xs text-muted">
        Open the admin panel to ship: /admin/orders
      </Text>
    </EmailLayout>
  );
}
