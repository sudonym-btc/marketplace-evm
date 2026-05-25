import type { Abi } from 'viem'

export const multiEscrowAbi = [
  {
    type: 'event',
    name: 'TradeCreated',
    inputs: [
      { name: 'tradeId', type: 'bytes32', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'arbiter', type: 'address', indexed: true },
      { name: 'buyer', type: 'address', indexed: false },
      { name: 'seller', type: 'address', indexed: false },
      { name: 'paymentAmount', type: 'uint256', indexed: false },
      { name: 'bondAmount', type: 'uint256', indexed: false },
      { name: 'unlockAt', type: 'uint256', indexed: false },
      { name: 'escrowFee', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'createTrade',
    stateMutability: 'payable',
    inputs: [
      { name: 'tradeId', type: 'bytes32' },
      { name: 'buyer', type: 'address' },
      { name: 'seller', type: 'address' },
      { name: 'arbiter', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'paymentAmount', type: 'uint256' },
      { name: 'bondAmount', type: 'uint256' },
      { name: 'unlockAt', type: 'uint256' },
      { name: 'escrowFee', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tradeId', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'releaseToCounterparty',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tradeId', type: 'bytes32' },
      { name: 'actor', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'arbitrate',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tradeId', type: 'bytes32' },
      { name: 'paymentFactor', type: 'uint256' },
      { name: 'bondFactor', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'beneficiary', type: 'address' },
      { name: 'destination', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'activeTrade',
    stateMutability: 'view',
    inputs: [{ name: 'tradeId', type: 'bytes32' }],
    outputs: [
      { name: 'isActive', type: 'bool' },
      {
        name: 'trade',
        type: 'tuple',
        components: [
          { name: 'buyer', type: 'address' },
          { name: 'seller', type: 'address' },
          { name: 'arbiter', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'paymentAmount', type: 'uint256' },
          { name: 'bondAmount', type: 'uint256' },
          { name: 'unlockAt', type: 'uint256' },
          { name: 'escrowFee', type: 'uint256' },
        ],
      },
    ],
  },
] as const satisfies Abi

export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const satisfies Abi
