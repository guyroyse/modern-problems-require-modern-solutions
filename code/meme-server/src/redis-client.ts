import 'dotenv/config'

import { createClient } from 'redis'

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

/* Build the index name for a distance metric */
function indexName(distanceMetric: DistanceMetric) {
  return `${prefix}:${distanceMetric}:index`
}

/* Export the client and index name */
export { redis, aliasIndexName, prefix, indexName }
