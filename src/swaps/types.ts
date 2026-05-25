import type { BoltzClient, BoltzStatusUpdate } from '../boltz/types.js'
import type { NamedEvmCall } from '../types.js'
import type { EvmAddress, EvmAmount, EvmOperationRecord, EvmOperationStore } from '../types.js'

export type SwapInRequest = {
  id: string
  chainId: number
  accountAddress: EvmAddress
  boltzCurrency: string
  tokenAddress?: EvmAddress
  amount: EvmAmount
  preimageHash: `0x${string}`
  claimAddress: EvmAddress
  description?: string
  postClaimCalls?: NamedEvmCall[]
}

export type SwapOutRequest = {
  id: string
  chainId: number
  boltzCurrency: string
  tokenAddress?: EvmAddress
  amount?: EvmAmount
  invoice?: string
  invoiceDescription?: string
  preLockCalls?: NamedEvmCall[]
}

export type SwapInResult =
  | {
      type: 'external_payment_required'
      operation: EvmOperationRecord
      invoice: string
      swapId: string
      amount?: EvmAmount
    }
  | {
      type: 'completed'
      operation: EvmOperationRecord
      txHash: string
    }

export type SwapOutResult =
  | {
      type: 'external_invoice_required'
      operation: EvmOperationRecord
      amount?: EvmAmount
      description?: string
    }
  | {
      type: 'awaiting_resolution'
      operation: EvmOperationRecord
      swapId: string
    }
  | {
      type: 'completed'
      operation: EvmOperationRecord
      preimage?: string
    }

export type SwapResumeResult = {
  operation: EvmOperationRecord
  latestStatus?: BoltzStatusUpdate
}

export type SwapServiceOptions = {
  boltz: BoltzClient
  store: EvmOperationStore
  now?: () => number
}

export type EvmSwapService = {
  swapIn(request: SwapInRequest): Promise<SwapInResult>
  swapOut(request: SwapOutRequest): Promise<SwapOutResult>
  resume(id: string): Promise<SwapResumeResult>
  listActive(): Promise<EvmOperationRecord[]>
}
