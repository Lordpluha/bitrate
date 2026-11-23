import type { Embedder } from '../ports.js'

export class FakeEmbedder implements Embedder {
  readonly provider = 'fake'
  readonly modelId = 'fake-embedding'
  readonly inputs: string[] = []

  async embed(texts: readonly string[]): Promise<number[][]> {
    this.inputs.push(...texts)
    return texts.map((text) => [text.length, 1])
  }
}
