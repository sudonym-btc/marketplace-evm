import type { EvmAaConfig, EvmAddress, EvmCall, EvmExecutionOptions, EvmExecutionResult, NamedEvmCall } from '../types.js'

export type AaGasEstimate = {
  gasCostWei: bigint
  gasSponsored: boolean
}

export type AaExecutorOptions = {
  chainId: number
  ownerAddress: EvmAddress
  config: EvmAaConfig
}

export type AaExecutor = {
  getSmartAccountAddress(): Promise<EvmAddress>
  estimateGas(calls: EvmCall[]): Promise<AaGasEstimate>
  execute(calls: NamedEvmCall[], options: EvmExecutionOptions): Promise<EvmExecutionResult>
}
