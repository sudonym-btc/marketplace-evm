import type { EvmOperationRecord, EvmOperationStatus } from '../types.js'
import type { EvmSwapService, SwapInRequest, SwapOutRequest, SwapServiceOptions } from './types.js'

function nowSeconds(now?: () => number): number {
  return now ? now() : Math.floor(Date.now() / 1000)
}

function operation(
  request: { id: string; chainId: number },
  kind: EvmOperationRecord['kind'],
  status: EvmOperationStatus,
  data: Record<string, unknown>,
  now?: () => number,
): EvmOperationRecord {
  const timestamp = nowSeconds(now)
  return {
    id: request.id,
    kind,
    status,
    chainId: request.chainId,
    data,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createEvmSwapService(options: SwapServiceOptions): EvmSwapService {
  return {
    async swapIn(request: SwapInRequest) {
      const reverse = await options.boltz.createReverseSwap({
        to: request.boltzCurrency,
        preimageHash: request.preimageHash,
        claimAddress: request.claimAddress,
        onchainAmount: Number(request.amount.value),
        ...(request.description ? { description: request.description } : {}),
      })
      const record = operation(
        request,
        'swap_in',
        'external_payment_required',
        {
          request,
          swapId: reverse.id,
          invoice: reverse.invoice,
          postClaimCalls: request.postClaimCalls,
        },
        options.now,
      )
      record.swapId = reverse.id
      await options.store.put(record)
      return {
        type: 'external_payment_required',
        operation: record,
        invoice: reverse.invoice,
        swapId: reverse.id,
        amount: request.amount,
      }
    },

    async swapOut(request: SwapOutRequest) {
      if (!request.invoice) {
        const record = operation(
          request,
          'swap_out',
          'external_invoice_required',
          { request, preLockCalls: request.preLockCalls },
          options.now,
        )
        await options.store.put(record)
        return {
          type: 'external_invoice_required',
          operation: record,
          ...(request.amount ? { amount: request.amount } : {}),
          ...(request.invoiceDescription ? { description: request.invoiceDescription } : {}),
        }
      }

      const submarine = await options.boltz.createSubmarineSwap({
        from: request.boltzCurrency,
        invoice: request.invoice,
      })
      const record = operation(
        request,
        'swap_out',
        'awaiting_onchain',
        { request, swapId: submarine.id, preLockCalls: request.preLockCalls },
        options.now,
      )
      record.swapId = submarine.id
      await options.store.put(record)
      return { type: 'awaiting_resolution', operation: record, swapId: submarine.id }
    },

    async resume(id: string) {
      const record = await options.store.get(id)
      if (!record) throw new Error(`Operation not found: ${id}`)
      const latestStatus = record.swapId ? await options.boltz.getSwap(record.swapId) : undefined
      if (latestStatus) {
        record.data = { ...record.data, latestStatus }
        record.updatedAt = nowSeconds(options.now)
        await options.store.put(record)
      }
      return { operation: record, ...(latestStatus ? { latestStatus } : {}) }
    },

    listActive() {
      return options.store.list({
        status: [
          'external_payment_required',
          'external_invoice_required',
          'awaiting_onchain',
          'claiming',
          'locking',
          'settling',
          'refunding',
        ],
      })
    },
  }
}
