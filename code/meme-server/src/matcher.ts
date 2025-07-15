import { commandOptions, SearchOptions } from 'redis'
import fs from 'fs/promises'

import { embed } from './embedder.js'
import { aliasIndexName, redis, prefix, DistanceMetric, indexName } from './redis-client.js'

type Match = {
  id: string
  title: string
}

async function findMatch(imageData: Buffer): Promise<Match> {
  /* Build the Redis search query */
  const searchQuery = '*'
  const vectorQuery = `KNN 1 @embedding $BLOB`
  const redisQuery = `(${searchQuery})=>[${vectorQuery}]`

  /* Save the image to a temporary file on disk */
  const filename = `${prefix}-${Date.now()}.png`
  await fs.writeFile(filename, imageData)

  /* Embed the user query*/
  const embedding = await embed(filename)

  /* Remove the temporary file */
  await fs.rm(filename)

  /* Execute the Redis search */
  const options: SearchOptions = {
    DIALECT: 2,
    PARAMS: { BLOB: embedding },
    SORTBY: '__embedding_score',
    LIMIT: { from: 0, size: 1 },
    RETURN: ['title', '__embedding_score']
  }

  const results = await redis.ft.search(aliasIndexName, redisQuery, options)
  const document = results.documents[0] as any

  /* Extract the data from the document */
  const id = document.id.slice(prefix.length + 1)
  const title = document.value.title

  return { id, title }
}

async function fetchImage(id: string): Promise<Buffer | null> {
  const key = `${prefix}:${id}`
  const image = await redis.hGet(commandOptions({ returnBuffers: true }), key, 'image')
  return image ?? null
}

async function aliasIndex(distanceMetric: DistanceMetric) {
  const thisIndexName = indexName(distanceMetric)
  await redis.ft.aliasUpdate(aliasIndexName, thisIndexName)
}

export { aliasIndex, findMatch, fetchImage }
