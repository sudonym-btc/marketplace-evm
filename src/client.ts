import { createBoltzRestClient } from './boltz/restClient.js'
import { createEvmEscrowCallBuilder } from './escrow/callBuilder.js'
import { createEvmSwapService } from './swaps/service.js'
import type { MarketplaceEvmClientOptions } from './types.js'
import { createEvmEscrowValidator } from './validation/escrowPaymentValidator.js'

export type MarketplaceEvmClient = ReturnType<typeof createMarketplaceEvmClient>

export function createMarketplaceEvmClient(options: MarketplaceEvmClientOptions) {
  const escrowCalls = createEvmEscrowCallBuilder()
  const escrowValidator = createEvmEscrowValidator({ chains: options.chains })
  const boltz = options.boltz
    ? createBoltzRestClient({ apiUrl: options.boltz.apiUrl })
    : undefined
  const swaps = boltz
    ? createEvmSwapService({
        boltz,
        store: options.operationStore,
        ...(options.now ? { now: options.now } : {}),
      })
    : undefined

  return {
    chains: options.chains,
    executor: options.executor,
    operationStore: options.operationStore,
    escrow: {
      ...escrowCalls,
      validate: escrowValidator.validate,
    },
    ...(swaps ? { swaps } : {}),
  }
}
