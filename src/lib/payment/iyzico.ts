// iyzico 3DS ödeme servisi.
// SDK: iyzipay
// Docs: https://dev.iyzipay.com

import Iyzipay from "iyzipay";

export const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY ?? "sandbox-placeholder",
  secretKey: process.env.IYZICO_SECRET_KEY ?? "sandbox-placeholder",
  uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
});

export type InitiateInput = {
  orderNumber: string;
  totalPrice: number;
  currency: "TRY";
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    tcNo: string;
    ip: string;
    registrationAddress: string;
    city: string;
    country: "Turkey";
    zip?: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: "Turkey";
    address: string;
    zip?: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: "Turkey";
    address: string;
    zip?: string;
  };
  items: {
    id: string;
    name: string;
    category: string;
    price: number;
  }[];
  card: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: 0 | 1;
  };
  callbackUrl: string;
};

type ThreedsInitResult = {
  status: string;
  errorMessage?: string;
  threeDSHtmlContent?: string;
  conversationId?: string;
  paymentId?: string;
};

export async function initiateThreeDSPayment(input: InitiateInput) {
  return new Promise<ThreedsInitResult>((resolve, reject) => {
    iyzipay.threedsInitialize.create(
      {
        locale: "tr",
        conversationId: input.orderNumber,
        price: input.totalPrice.toFixed(2),
        paidPrice: input.totalPrice.toFixed(2),
        currency: input.currency,
        installment: "1",
        basketId: input.orderNumber,
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        callbackUrl: input.callbackUrl,
        paymentCard: {
          cardHolderName: input.card.cardHolderName,
          cardNumber: input.card.cardNumber,
          expireMonth: input.card.expireMonth,
          expireYear: input.card.expireYear,
          cvc: input.card.cvc,
          registerCard: input.card.registerCard ?? 0,
        },
        buyer: {
          id: input.buyer.id,
          name: input.buyer.name,
          surname: input.buyer.surname,
          gsmNumber: input.buyer.phone,
          email: input.buyer.email,
          identityNumber: input.buyer.tcNo,
          registrationAddress: input.buyer.registrationAddress,
          ip: input.buyer.ip,
          city: input.buyer.city,
          country: input.buyer.country,
          zipCode: input.buyer.zip ?? "00000",
        },
        shippingAddress: {
          contactName: input.shippingAddress.contactName,
          city: input.shippingAddress.city,
          country: input.shippingAddress.country,
          address: input.shippingAddress.address,
          zipCode: input.shippingAddress.zip ?? "00000",
        },
        billingAddress: {
          contactName: input.billingAddress.contactName,
          city: input.billingAddress.city,
          country: input.billingAddress.country,
          address: input.billingAddress.address,
          zipCode: input.billingAddress.zip ?? "00000",
        },
        basketItems: input.items.map((it) => ({
          id: it.id,
          name: it.name,
          category1: it.category,
          itemType: "PHYSICAL",
          price: it.price.toFixed(2),
        })),
      },
      (err: unknown, result: ThreedsInitResult) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export async function finalizeThreeDSPayment(paymentId: string, conversationId: string) {
  return new Promise<{ status: string; errorMessage?: string; paymentId?: string; price?: string }>(
    (resolve, reject) => {
      iyzipay.threedsPayment.create(
        { locale: "tr", conversationId, paymentId },
        (err: unknown, result: { status: string; errorMessage?: string; paymentId?: string; price?: string }) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    }
  );
}
