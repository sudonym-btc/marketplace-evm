import type { EvmEscrowFeePolicy } from './types.js'

export function calculateEscrowFee(amount: bigint, policy: EvmEscrowFeePolicy): bigint {
  const proportional = (amount * BigInt(policy.ppm)) / 1_000_000n
  const unclamped = proportional + policy.base
  const minApplied = unclamped < policy.min ? policy.min : unclamped
  if (policy.max > 0n && minApplied > policy.max) return policy.max
  return minApplied
}
