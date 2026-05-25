import type { Address, Hex } from 'viem'
import { getAddress, isAddress, isHex } from 'viem'

export const zeroAddress = '0x0000000000000000000000000000000000000000' as Address

export function normalizeAddress(address: string, field = 'address'): Address {
  if (!isAddress(address)) throw new Error(`Invalid ${field}: ${address}`)
  return getAddress(address)
}

export function normalizeBytes32(value: string, field = 'bytes32'): Hex {
  const stripped = value.startsWith('0x') ? value.slice(2) : value
  if (!/^[0-9a-fA-F]{64}$/.test(stripped)) throw new Error(`Invalid ${field}: ${value}`)
  return `0x${stripped.toLowerCase()}` as Hex
}

export function normalizeTxHash(value: string): Hex {
  return normalizeBytes32(value, 'transaction hash')
}

export function isZeroAddress(address: string): boolean {
  return normalizeAddress(address).toLowerCase() === zeroAddress
}

export function assertHex(value: string, field: string): Hex {
  if (!isHex(value)) throw new Error(`Invalid ${field}: ${value}`)
  return value as Hex
}

export function bigintMax(left: bigint, right: bigint): bigint {
  return left > right ? left : right
}

export function bigintMin(left: bigint, right: bigint): bigint {
  return left < right ? left : right
}
