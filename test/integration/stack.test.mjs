import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, createWalletClient, http } from 'viem'

import {
  MemoryOperationStore,
  createMarketplaceEvmClient,
  sha256Hex,
} from '../../dist/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function readStackConfig() {
  if (process.env.MARKETPLACE_EVM_STACK_CONFIG) {
    return JSON.parse(readFileSync(process.env.MARKETPLACE_EVM_STACK_CONFIG, 'utf8'))
  }

  const candidates = [
    resolve(__dirname, '../stack/data/config/marketplace-evm-stack.json'),
    resolve(__dirname, '../../../marketplace-evm-stack/data/config/marketplace-evm-stack.json'),
    resolve(process.cwd(), '../marketplace-evm-stack/data/config/marketplace-evm-stack.json'),
  ]
  const configPath = candidates.find(candidate => existsSync(candidate))

  if (configPath) {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  }

  return createDefaultStackConfig()
}

function createDefaultStackConfig() {
  const host = process.env.MARKETPLACE_EVM_STACK_HOST ?? '127.0.0.1'
  const arbitrumPort = process.env.MARKETPLACE_EVM_ARBITRUM_RPC_PORT ?? '18546'
  const rootstockPort = process.env.MARKETPLACE_EVM_ROOTSTOCK_RPC_PORT ?? '18545'
  const boltzApiPort = process.env.MARKETPLACE_EVM_BOLTZ_API_PORT ?? '19001'

  return {
    version: 1,
    chains: {
      arbitrumRegtest: {
        name: 'Arbitrum Regtest',
        chainId: 412346,
        rpcUrl: `http://${host}:${arbitrumPort}`,
        nativeToken: {
          denomination: 'ETH',
          decimals: 18,
        },
        boltzCurrency: 'ARB',
        multiEscrow: {
          address: '0x663f3ad617193148711d28f5334ee4ed07016602',
          runtimeBytecodeHash: undefined,
        },
        tokens: {
          TBTC: {
            address: '0x948B3c65b89DF0B4894ABE91E6D02FE579834F8F',
            denomination: 'tBTC',
            decimals: 18,
            boltzCurrency: 'tBTC',
          },
          USDT: {
            address: '0x712516e61C8B383dF4A63CFe83d7701Bce54B03e',
            denomination: 'USDT',
            decimals: 6,
            boltzCurrency: 'USDT',
          },
        },
      },
      rootstockRegtest: {
        name: 'Rootstock Regtest',
        chainId: 33,
        rpcUrl: `http://${host}:${rootstockPort}`,
        nativeToken: {
          denomination: 'RBTC',
          decimals: 18,
        },
        boltzCurrency: 'RBTC',
      },
    },
    boltz: {
      apiUrl: `http://${host}:${boltzApiPort}/v2`,
    },
    accounts: {
      buyer: {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      },
      seller: {
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      },
      arbiter: {
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
      },
    },
  }
}

const config = readStackConfig()
const arbitrum = config.chains.arbitrumRegtest
const buyer = config.accounts.buyer
const seller = config.accounts.seller
const arbiter = config.accounts.arbiter

const chain = {
  id: arbitrum.chainId,
  name: arbitrum.name,
  nativeCurrency: {
    name: arbitrum.nativeToken.denomination,
    symbol: arbitrum.nativeToken.denomination,
    decimals: arbitrum.nativeToken.decimals,
  },
  rpcUrls: {
    default: { http: [arbitrum.rpcUrl] },
  },
}

const publicClient = createPublicClient({
  chain,
  transport: http(arbitrum.rpcUrl),
})

const buyerAccount = privateKeyToAccount(buyer.privateKey)
const walletClient = createWalletClient({
  account: buyerAccount,
  chain,
  transport: http(arbitrum.rpcUrl),
})

const evm = createMarketplaceEvmClient({
  chains: [
    {
      id: 'arbitrum-regtest',
      chainId: arbitrum.chainId,
      publicClient,
      nativeToken: {
        chainId: arbitrum.chainId,
        address: '0x0000000000000000000000000000000000000000',
        denomination: arbitrum.nativeToken.denomination,
        decimals: arbitrum.nativeToken.decimals,
      },
      tokens: Object.values(arbitrum.tokens).map(token => ({
        chainId: arbitrum.chainId,
        address: token.address,
        denomination: token.denomination,
        decimals: token.decimals,
      })),
    },
  ],
  operationStore: new MemoryOperationStore(),
  executor: {
    async getAddress() {
      return buyer.address
    },
    async execute(calls) {
      let txHash
      for (const call of calls) {
        txHash = await sendCall(call)
      }
      return { txHash, accountAddress: buyer.address }
    },
  },
})

function amount(value, token) {
  return {
    value,
    denomination: token.denomination,
    decimals: token.decimals,
  }
}

function randomTradeId() {
  return `0x${randomBytes(32).toString('hex')}`
}

async function sendCall(call) {
  const hash = await walletClient.sendTransaction({
    account: buyerAccount,
    to: call.to,
    data: call.data,
    value: call.value,
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  assert.equal(receipt.status, 'success', `${call.name} reverted`)
  return hash
}

async function createAndValidateEscrowTrade(symbol, paymentValue) {
  const token = arbitrum.tokens[symbol]
  const tradeId = randomTradeId()
  const paymentAmount = amount(paymentValue, token)

  const calls = evm.escrow.createTrade({
    tradeId,
    buyerAddress: buyer.address,
    sellerAddress: seller.address,
    arbiterAddress: arbiter.address,
    tokenAddress: token.address,
    paymentAmount,
    contractAddress: arbitrum.multiEscrow.address,
    unlockAt: BigInt(Math.floor(Date.now() / 1000) + 3600),
  })

  let createTradeTxHash
  for (const call of calls) {
    const txHash = await sendCall(call)
    if (call.name === 'MultiEscrow.createTrade') createTradeTxHash = txHash
  }

  assert.ok(createTradeTxHash)

  return evm.escrow.validate({
    chainId: arbitrum.chainId,
    txHash: createTradeTxHash,
    tradeId,
    contractAddress: arbitrum.multiEscrow.address,
    contractBytecodeHash: await getMultiEscrowRuntimeHash(),
    sellerAddress: seller.address,
    arbiterAddress: arbiter.address,
    tokenAddress: token.address,
    paymentAmount,
  })
}

async function getMultiEscrowRuntimeHash() {
  const code = await publicClient.getBytecode({ address: arbitrum.multiEscrow.address })
  assert.ok(code && code !== '0x')
  return sha256Hex(code)
}

test('stack exposes the expected EVM contracts and Boltz API', async () => {
  const code = await publicClient.getBytecode({ address: arbitrum.multiEscrow.address })
  assert.ok(code && code !== '0x')
  if (arbitrum.multiEscrow.runtimeBytecodeHash) {
    assert.equal(arbitrum.multiEscrow.runtimeBytecodeHash, await getMultiEscrowRuntimeHash())
  }

  const nodes = await fetch(`${config.boltz.apiUrl}/nodes`).then(response => response.json())
  assert.ok(nodes.BTC)
})

test('validates a USDT escrow deposit against MultiEscrow', async () => {
  const result = await createAndValidateEscrowTrade('USDT', 1_000_000n)
  assert.equal(result.status, 'valid')
  assert.equal(result.assetMatched, true)
  assert.equal(result.recipientMatched, true)
  assert.equal(result.escrowMatched, true)
})

test('validates a tBTC escrow deposit against MultiEscrow', async () => {
  const result = await createAndValidateEscrowTrade('TBTC', 100_000_000_000_000n)
  assert.equal(result.status, 'valid')
  assert.equal(result.assetMatched, true)
  assert.equal(result.recipientMatched, true)
  assert.equal(result.escrowMatched, true)
})
