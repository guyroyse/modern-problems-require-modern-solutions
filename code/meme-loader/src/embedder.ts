import { pipeline } from '@huggingface/transformers'

/* Load the model for feature extraction */
const extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', { dtype: 'fp32' })

/* Embed the input image */
async function embed(imagePath: string): Promise<Buffer> {
  const tensor = await extractor(imagePath)
  const rawData = tensor.data as Float32Array
  const embedding = Buffer.from(rawData.buffer)
  return embedding
}

/* Export the embed function */
export { embed }
