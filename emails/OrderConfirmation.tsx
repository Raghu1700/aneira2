import { Heading, Hr, Row, Column, Section, Text, Img } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './_layout';

interface Item {
  title: string;
  quantity: number;
  price: string;
  lineTotal: string;
  imageUrl: string | null;
}

interface Address {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Props {
  orderNumber: string;
  customerName: string;
  items: Item[];
  subtotal: string;
  shipping: string;
  gst: string;
  total: string;
  shippingAddress: Address;
}

function inr(v: string) {
  return `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  gst,
  total,
  shippingAddress,
}: Props) {
  return (
    <EmailLayout preview={`Order ${orderNumber} confirmed`}>
      <Heading className="m-0 font-serif text-2xl text-navy">Thank you, {customerName.split(' ')[0]}.</Heading>
      <Text className="mt-2 text-base text-ink">
        Your order <strong>{orderNumber}</strong> is confirmed. We'll write again the moment it ships.
      </Text>

      <Section className="my-6 rounded-sm border border-line p-4">
        {items.map((it, i) => (
          <Row key={i} className={i > 0 ? 'mt-4 border-t border-line pt-4' : ''}>
            {it.imageUrl ? (
              <Column className="w-16 pr-4 align-top">
                <Img src={it.imageUrl} width={64} height={80} alt={it.title} />
              </Column>
            ) : null}
            <Column className="align-top">
              <Text className="m-0 font-serif text-base text-ink">{it.title}</Text>
              <Text className="m-0 text-xs text-muted">Qty {it.quantity}</Text>
            </Column>
            <Column className="text-right align-top">
              <Text className="m-0 text-sm text-ink">{inr(it.lineTotal)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Section>
        <Row>
          <Column><Text className="m-0 text-sm text-muted">Subtotal</Text></Column>
          <Column className="text-right"><Text className="m-0 text-sm">{inr(subtotal)}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="m-0 text-sm text-muted">Shipping</Text></Column>
          <Column className="text-right"><Text className="m-0 text-sm">{inr(shipping)}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="m-0 text-sm text-muted">GST</Text></Column>
          <Column className="text-right"><Text className="m-0 text-sm">{inr(gst)}</Text></Column>
        </Row>
        <Hr className="my-2 border-line" />
        <Row>
          <Column><Text className="m-0 text-base font-medium text-ink">Total</Text></Column>
          <Column className="text-right"><Text className="m-0 text-base font-medium text-navy">{inr(total)}</Text></Column>
        </Row>
      </Section>

      <Section className="mt-6">
        <Text className="m-0 text-xs uppercase tracking-[0.18em] text-muted">Shipping to</Text>
        <Text className="m-0 mt-2 text-sm text-ink">
          {shippingAddress.fullName}
          <br />
          {shippingAddress.line1}
          {shippingAddress.line2 ? <><br />{shippingAddress.line2}</> : null}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>
    </EmailLayout>
  );
}
