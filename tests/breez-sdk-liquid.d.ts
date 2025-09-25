declare module '@breeztech/react-native-breez-sdk-liquid' {
  export type LiquidNetwork = 'mainnet' | 'testnet' | 'regtest';
  export type PaymentType = 'receive' | 'send';
  export type PaymentState =
    | 'created'
    | 'pending'
    | 'complete'
    | 'failed'
    | 'timedOut'
    | 'refundable'
    | 'refundPending'
    | 'waitingFeeAcceptance';
  export type PaymentDetails =
    | {
        type: 'lightning';
        swapId: string;
        description: string;
        invoice?: string;
        bolt12Offer?: string;
        paymentHash?: string;
        destinationPubkey?: string;
      }
    | {
        type: 'liquid';
        assetId: string;
        destination: string;
        description: string;
      }
    | {
        type: 'bitcoin';
        swapId: string;
        bitcoinAddress: string;
        description: string;
      };
  export interface Payment {
    timestamp: number;
    amountSat: number;
    feesSat?: number;
    paymentType: PaymentType;
    status: PaymentState;
    details: PaymentDetails;
    swapperFeesSat?: number;
    destination?: string;
    txId?: string;
  }
  export type SdkEvent =
    | { type: 'paymentFailed'; details: Payment }
    | { type: 'paymentPending'; details: Payment }
    | { type: 'paymentRefundable'; details: Payment }
    | { type: 'paymentRefunded'; details: Payment }
    | { type: 'paymentRefundPending'; details: Payment }
    | { type: 'paymentSucceeded'; details: Payment }
    | { type: 'paymentWaitingConfirmation'; details: Payment }
    | { type: 'paymentWaitingFeeAcceptance'; details: Payment }
    | { type: 'synced' }
    | { type: 'dataSynced'; didPullNewRecords: boolean };
  export type ReceiveAmount =
    | { type: 'bitcoin'; payerAmountSat: number }
    | { type: 'asset'; assetId: string; payerAmount?: number };
  export interface PrepareReceiveResponse {
    paymentMethod: 'bolt11Invoice' | 'bolt12Offer' | 'bitcoinAddress' | 'liquidAddress';
    feesSat: number;
    amount?: ReceiveAmount;
    minPayerAmountSat?: number;
    maxPayerAmountSat?: number;
    swapperFeerate?: number;
  }
  export interface ReceivePaymentResponse {
    destination: string;
  }
  export type PayAmount =
    | { type: 'bitcoin'; receiverAmountSat: number }
    | { type: 'asset'; toAsset: string; receiverAmount: number; estimateAssetFees?: boolean; fromAsset?: string }
    | { type: 'drain' };
  export interface PrepareSendResponse {
    destination:
      | { type: 'liquidAddress'; addressData: { address: string; assetId?: string } }
      | { type: 'bolt11'; invoice: { bolt11: string; paymentHash?: string; description?: string; amountMsat?: number; payeePubkey?: string } }
      | { type: 'bolt12'; offer: { offer: string; receiverAmountSat?: number } };
    amount?: PayAmount;
    feesSat?: number;
    estimatedAssetFees?: number;
    exchangeAmountSat?: number;
  }
  export interface SendPaymentResponse {
    payment: Payment;
  }
  export interface PreparePayOnchainResponse {
    receiverAmountSat: number;
    claimFeesSat: number;
    totalFeesSat: number;
  }
  export interface RecommendedFees {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  }
  export interface Config {
    workingDir: string;
    network: LiquidNetwork;
    breezApiKey?: string;
    [key: string]: unknown;
  }
  export interface ConnectRequest {
    config: Config;
    mnemonic?: string;
    passphrase?: string;
    seed?: number[];
  }
  export interface WalletInfo {
    balanceSat: number;
    pendingSendSat: number;
    pendingReceiveSat: number;
    pubkey: string;
    assetBalances: Array<{ assetId: string; balanceSat: number; name?: string; ticker?: string }>;
  }
  export interface GetInfoResponse {
    walletInfo: WalletInfo;
  }
  export type EventListener = (event: SdkEvent) => void;
  export const defaultConfig: (network: LiquidNetwork, breezApiKey?: string) => Promise<Config>;
  export const connect: (req: ConnectRequest) => Promise<void>;
  export const disconnect: () => Promise<void>;
  export const setLogger: (
    logger: (entry: { level: string; line: string }) => void
  ) => Promise<{ remove: () => void }>;
  export const addEventListener: (listener: EventListener) => Promise<string>;
  export const removeEventListener: (id: string) => Promise<void>;
  export const getInfo: () => Promise<GetInfoResponse>;
  export const prepareReceivePayment: (
    req: { paymentMethod: 'bolt11Invoice' | 'bolt12Offer' | 'bitcoinAddress' | 'liquidAddress'; amount?: ReceiveAmount }
  ) => Promise<PrepareReceiveResponse>;
  export const receivePayment: (
    req: { prepareResponse: PrepareReceiveResponse; description?: string; useDescriptionHash?: boolean; payerNote?: string }
  ) => Promise<ReceivePaymentResponse>;
  export const parseInvoice: (
    input: string
  ) => Promise<{
    bolt11: string;
    description?: string;
    amountMsat?: number;
    expiry: number;
    timestamp: number;
    payeePubkey: string;
    paymentHash: string;
  }>;
  export const parse: (
    input: string
  ) => Promise<{
    type: string;
    invoice?: { bolt11: string; description?: string; amountMsat?: number; paymentHash?: string };
    offer?: { offer: string };
    addressData?: { address: string };
  }>;
  export const prepareSendPayment: (
    req: { destination: string; amount?: PayAmount }
  ) => Promise<PrepareSendResponse>;
  export const sendPayment: (
    req: { prepareResponse: PrepareSendResponse; useAssetFees?: boolean; payerNote?: string }
  ) => Promise<SendPaymentResponse>;
  export const preparePayOnchain: (
    req: { amount: PayAmount; feeRateSatPerVbyte?: number }
  ) => Promise<PreparePayOnchainResponse>;
  export const payOnchain: (
    req: { address: string; prepareResponse: PreparePayOnchainResponse }
  ) => Promise<SendPaymentResponse>;
  export const recommendedFees: () => Promise<RecommendedFees>;
  export const listPayments: (
    req: {
      filters?: Array<'receive' | 'send'>;
      states?: Array<PaymentState>;
      fromTimestamp?: number;
      toTimestamp?: number;
      offset?: number;
      limit?: number;
      details?: unknown;
      sortAscending?: boolean;
    }
  ) => Promise<Payment[]>;
}
