# marketplace-evm

`@sudonym-btc/marketplace-evm` is a Nostr-agnostic EVM payment engine for
marketplaces. It owns EVM escrow validation, escrow lifecycle calls,
Boltz-backed swap orchestration, account abstraction, and operation recovery.

It deliberately does **not** depend on `nostr-tools`, NDK, or any Nostr event
types. Nostr marketplace adapters should translate listing/order proofs into
the plain request types exported by this package.

## Responsibilities

- Validate EVM escrow funding proofs from transaction receipts and contract logs.
- Build escrow fund, release, claim, arbitrate, and withdraw calls.
- Execute calls through EOA or ERC-4337 account abstraction executors.
- Coordinate Boltz swap-in and swap-out lifecycles.
- Persist and resume swap/escrow operations through caller-provided storage.

## Non-Responsibilities

- Nostr relay access.
- Nostr event parsing or signing.
- Marketplace listing/order schemas.
- Participant identity proof resolution.

## Package Boundary

Core marketplace users should import only their marketplace protocol package.
They do not need this package and should not download EVM, AA, or Boltz
dependencies.

EVM-enabled marketplace apps can add this package and a small adapter:

```ts
import { createMarketplaceEvmClient } from '@sudonym-btc/marketplace-evm'

const evm = createMarketplaceEvmClient({
  chains,
  operationStore,
  executor,
  boltz,
})

const validation = await evm.escrow.validate({
  chainId,
  txHash,
  tradeId,
  contractAddress,
  sellerAddress,
  arbiterAddress,
  tokenAddress,
  paymentAmount,
})

const calls = evm.escrow.createTrade({
  tradeId,
  buyerAddress,
  sellerAddress,
  arbiterAddress,
  tokenAddress,
  paymentAmount,
  contractAddress,
  unlockAt,
})
```

## Current Status

This package is an initial implementation scaffold. Validation and call
builders are shaped for the MultiEscrow contract described by the marketplace
escrow NIP. Swap and AA modules expose stable interfaces and operation records
so real Boltz/Pimlico implementations can be filled in without changing the
Nostr-facing adapter API.
