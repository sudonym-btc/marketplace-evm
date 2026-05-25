import type { EvmAddress, EvmHash, EvmHex } from '../types.js'

export type BoltzSwapStatus =
  | 'swap.created'
  | 'invoice.set'
  | 'invoice.pending'
  | 'invoice.paid'
  | 'transaction.mempool'
  | 'transaction.confirmed'
  | 'transaction.claimed'
  | 'transaction.refunded'
  | 'swap.expired'
  | 'swap.failed'

export type BoltzStatusUpdate = {
  id: string
  status: BoltzSwapStatus | string
  transactionHash?: EvmHash
  error?: string
}

export type BoltzReverseSwapRequest = {
  to: string
  preimageHash: EvmHex
  claimAddress: EvmAddress
  invoiceAmount?: number
  onchainAmount?: number
  description?: string
}

export type BoltzReverseSwapResponse = {
  id: string
  invoice: string
  lockupAddress?: EvmAddress
  timeoutBlockHeight: number
  onchainAmount?: number
}

export type BoltzSubmarineSwapRequest = {
  from: string
  invoice: string
}

export type BoltzSubmarineSwapResponse = {
  id: string
  address?: EvmAddress
  claimAddress?: EvmAddress
  expectedAmount?: number
  timeoutBlockHeight: number
  bip21?: string
}

export type BoltzClient = {
  createReverseSwap(request: BoltzReverseSwapRequest): Promise<BoltzReverseSwapResponse>
  createSubmarineSwap(request: BoltzSubmarineSwapRequest): Promise<BoltzSubmarineSwapResponse>
  getSwap(id: string): Promise<BoltzStatusUpdate>
  subscribeSwap(id: string): AsyncIterable<BoltzStatusUpdate>
  getSubmarinePreimage(id: string): Promise<EvmHex>
  getCooperativeRefundSignature(id: string): Promise<EvmHex | null>
}

export type BoltzCurrencyResolver = {
  currencyForToken(chainId: number, tokenAddress?: EvmAddress): string
}
