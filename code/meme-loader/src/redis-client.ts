import 'dotenv/config'

import { createClient, ErrorReply, SchemaFieldTypes, VectorAlgorithms } from 'redis'

export type DistanceMetric = 'COSINE' | 'IP' | 'L2'

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = process.env.REDIS_PORT || 6379

const prefix = 'meme:twin'
const aliasIndexName = `${prefix}:index`
const redisURL = `redis://${redisHost}:${redisPort}`

/* Create and connect the Redis client */
const redis = await createClient({ url: redisURL })
  .on('error', error => console.error('Redis Client Error:', error))
  .connect()

/* Create the Meme Twin indices */
await createIndex('COSINE')
await createIndex('IP')
await createIndex('L2')

/* Set the default index in L2 */
await redis.ft.aliasUpdate(aliasIndexName, indexName('L2'))

/* Create a Meme Twin index for a given distance metric */
async function createIndex(distanceMetric: DistanceMetric) {
  /* Get the index name for the distance metric */
  const thisIndexName = indexName(distanceMetric)

  /* Drop the index if it exists */
  try {
    await redis.ft.dropIndex(thisIndexName)
  } catch (error) {
    if (error instanceof ErrorReply && error.message !== 'Unknown Index name') throw error
  }

  /* Create the index */
  await redis.ft.create(
    thisIndexName,
    {
      title: { type: SchemaFieldTypes.TEXT },
      embedding: {
        type: SchemaFieldTypes.VECTOR,
        ALGORITHM: VectorAlgorithms.FLAT,
        TYPE: 'FLOAT32',
        DIM: 512,
        DISTANCE_METRIC: distanceMetric
      }
    },
    {
      ON: 'HASH',
      PREFIX: `${prefix}:`
    }
  )
}

/* Build the index name for a distance metric */
function indexName(distanceMetric: DistanceMetric) {
  return `${prefix}:${distanceMetric}:index`
}

/* Export the client and index name */
export { redis, prefix }
