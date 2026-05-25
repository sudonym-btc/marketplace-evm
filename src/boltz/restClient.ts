import type {
  BoltzClient,
  BoltzReverseSwapRequest,
  BoltzReverseSwapResponse,
  BoltzStatusUpdate,
  BoltzSubmarineSwapRequest,
  BoltzSubmarineSwapResponse,
} from './types.js'

export type BoltzRestClientOptions = {
  apiUrl: string
  fetch?: typeof fetch
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Boltz API ${response.status}: ${await response.text()}`)
  return (await response.json()) as T
}

export function createBoltzRestClient(options: BoltzRestClientOptions): BoltzClient {
  const fetchImpl = options.fetch ?? globalThis.fetch
  const apiUrl = options.apiUrl.replace(/\/$/, '')

  return {
    async createReverseSwap(request: BoltzReverseSwapRequest): Promise<BoltzReverseSwapResponse> {
      return readJson(
        await fetchImpl(`${apiUrl}/v2/swap/reverse`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request),
        }),
      )
    },

    async createSubmarineSwap(request: BoltzSubmarineSwapRequest): Promise<BoltzSubmarineSwapResponse> {
      return readJson(
        await fetchImpl(`${apiUrl}/v2/swap/submarine`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request),
        }),
      )
    },

    async getSwap(id: string): Promise<BoltzStatusUpdate> {
      return readJson(await fetchImpl(`${apiUrl}/v2/swap/${encodeURIComponent(id)}`))
    },

    async *subscribeSwap(id: string): AsyncIterable<BoltzStatusUpdate> {
      yield await this.getSwap(id)
    },

    async getSubmarinePreimage(id: string) {
      const response = await readJson<{ preimage: string }>(
        await fetchImpl(`${apiUrl}/v2/swap/submarine/${encodeURIComponent(id)}/preimage`),
      )
      return response.preimage as `0x${string}`
    },

    async getCooperativeRefundSignature(id: string) {
      const response = await readJson<{ signature?: string | null }>(
        await fetchImpl(`${apiUrl}/v2/swap/submarine/${encodeURIComponent(id)}/refund`),
      )
      return (response.signature ?? null) as `0x${string}` | null
    },
  }
}
