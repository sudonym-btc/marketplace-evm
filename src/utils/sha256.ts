import type { Hex } from 'viem'
import { hexToBytes } from 'viem'

function bytesToHex(bytes: Uint8Array): Hex {
  return `0x${[...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')}` as Hex
}

export async function sha256Hex(input: Hex): Promise<Hex> {
  const bytes = hexToBytes(input)
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer)
  return bytesToHex(new Uint8Array(digest))
}
