declare module "iyzipay" {
  type Callback<T = unknown> = (err: unknown, result: T) => void;

  interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface ThreedsInitializeAPI {
    create<T = unknown>(request: Record<string, unknown>, cb: Callback<T>): void;
  }

  interface ThreedsPaymentAPI {
    create<T = unknown>(request: Record<string, unknown>, cb: Callback<T>): void;
    retrieve<T = unknown>(request: Record<string, unknown>, cb: Callback<T>): void;
  }

  class Iyzipay {
    constructor(options: IyzipayOptions);
    threedsInitialize: ThreedsInitializeAPI;
    threedsPayment: ThreedsPaymentAPI;
  }

  export default Iyzipay;
}
