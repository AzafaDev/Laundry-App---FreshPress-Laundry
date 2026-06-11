declare module "midtrans-client" {
  interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface SnapTransactionResult {
    token: string;
    redirect_url: string;
  }

  interface TransactionApi {
    notification(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    status(orderId: string): Promise<Record<string, unknown>>;
  }

  class Snap {
    constructor(options: MidtransClientOptions);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResult>;
    transaction: TransactionApi;
  }

  class CoreApi {
    constructor(options: MidtransClientOptions);
    transaction: TransactionApi;
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export = midtransClient;
}
