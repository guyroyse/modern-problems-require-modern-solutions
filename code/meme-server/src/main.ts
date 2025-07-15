import cors from 'cors'
import express, { Express } from 'express'

import { aliasIndex, findMatch, fetchImage } from './matcher.js'

/* Create the Express app */
const app: Express = express()

/* Set up JSON */
app.use(express.json())

/* Set up raw image data */
app.use(express.raw({ type: 'image/png', limit: '10mb' }))

/* Enable CORS */
app.use(cors())
app.use(function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

/* Home route with a status message */
app.get('/', (_req, res) => {
  res.json({ status: 'OK' })
})

/* Search for matching memes */
app.post('/match', async (req, res) => {
  const imageBuffer = req.body as Buffer
  const match = await findMatch(imageBuffer)
  res.json(match)
})

/* Fetch image by key */
app.get('/image/:key', async (req, res) => {
  const key = req.params.key
  const image = await fetchImage(key)
  if (image === null) {
    res.status(404).send()
  } else {
    res.type('image/png').send(image)
  }
})

/* Change the distance metric to cosine for vector search */
app.get('/metric/cosine', async (_req, res) => {
  await aliasIndex('COSINE')
  res.json({ status: 'OK', message: 'Distance metric set to cosine' })
})

/* Change the distance metric to inner product for vector search */
app.get('/metric/ip', async (_req, res) => {
  await aliasIndex('IP')
  res.json({ status: 'OK', message: 'Distance metric set to inner product' })
})

/* Change the distance metric to Euclidean for vector search */
app.get('/metric/l2', async (_req, res) => {
  await aliasIndex('L2')
  res.json({ status: 'OK', message: 'Distance metric set to Euclidean' })
})

/* Start the server */
const server = app.listen(8080, () => {
  console.log('Server is running on port 8080')
})
