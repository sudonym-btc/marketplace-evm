import type { Address, Hash, Hex, PublicClient } from 'viem'

export type EvmHex = Hex
export type EvmAddress = Address
export type EvmHash = Hash

export type EvmToken = {
  chainId: number
  address: EvmAddress
  denomination: string
  decimals: number
}

export type EvmAmount = {
  value: bigint
  denomination: string
  decimals: number
}

export type EvmChainConfig = {
  id: string
  chainId: number
  publicClient: PublicClient
  blockExplorerUrl?: string
  nativeToken: EvmToken
  tokens?: EvmToken[]
  accountAbstraction?: EvmAaConfig
}

export type EvmAaConfig = {
  entryPointAddress: EvmAddress
  factoryAddress: EvmAddress
  bundlerUrl: string
  paymasterUrl?: string
  paymasterAddress?: EvmAddress
}

export type EvmCall = {
  to: EvmAddress
  data: EvmHex
  value?: bigint
}

export type NamedEvmCall = EvmCall & {
  name: string
}

export type EvmExecutionOptions = {
  chainId: number
  operationId?: string
  waitForReceipt?: boolean
}

export type EvmExecutionResult = {
  txHash: EvmHash
  accountAddress: EvmAddress
  gasSponsored?: boolean
  userOperationHash?: EvmHash
}

export type EvmExecutor = {
  getAddress(chainId: number): Promise<EvmAddress>
  execute(calls: NamedEvmCall[], options: EvmExecutionOptions): Promise<EvmExecutionResult>
}

export type EvmOperationStatus =
  | 'initialised'
  | 'external_payment_required'
  | 'external_invoice_required'
  | 'awaiting_onchain'
  | 'claiming'
  | 'locking'
  | 'settling'
  | 'completed'
  | 'refunding'
  | 'refunded'
  | 'failed'

export type EvmOperationRecord = {
  id: string
  kind: 'swap_in' | 'swap_out' | 'escrow'
  status: EvmOperationStatus
  chainId: number
  tradeId?: string
  swapId?: string
  txHash?: EvmHash
  error?: string
  data: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export type EvmOperationQuery = {
  kind?: EvmOperationRecord['kind']
  status?: EvmOperationStatus | EvmOperationStatus[]
  chainId?: number
  tradeId?: string
  swapId?: string
}

export type EvmOperationStore = {
  get(id: string): Promise<EvmOperationRecord | null>
  put(record: EvmOperationRecord): Promise<void>
  list(query?: EvmOperationQuery): Promise<EvmOperationRecord[]>
  delete(id: string): Promise<void>
}

export type MarketplaceEvmClientOptions = {
  chains: EvmChainConfig[]
  operationStore: EvmOperationStore
  executor: EvmExecutor
  boltz?: EvmBoltzConfig
  now?: () => number
}

export type EvmBoltzConfig = {
  apiUrl: string
  wsUrl?: string
  nativeCurrencyByChainId?: Record<number, string>
}
