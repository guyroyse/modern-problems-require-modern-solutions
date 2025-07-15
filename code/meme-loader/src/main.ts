import chalk from 'chalk'
import fs from 'fs/promises'

import { embed } from './embedder.js'
import { redis, prefix } from './redis-client.js'

/* Get all the files in the memes directory */
const directory = './memes'
const files = await fs.readdir(directory)

/* Remove anything that isn't a PNG or JPG */
const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'))

/* List the count */
console.log('Found', imageFiles.length, 'images in', chalk.blueBright(directory))

for (const file of files) {
  /* Get the title from the image name */
  const title = file.substring(0, file.lastIndexOf('.'))

  /* Get the bytes of the image into a Buffer */
  const imagePath = `${directory}/${file}`
  const image = await fs.readFile(imagePath)

  /* Get the embedding of the image */
  const embedding = await embed(imagePath)

  /* Store the title, image, and embedding in Redis */
  const kebabTitle = title
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
  const key = `${prefix}:${kebabTitle}`
  await redis.hSet(key, { title, image, embedding })

  /* Log that the image was added */
  console.log('Added', chalk.greenBright(file))
}

console.log('All images embedded and added to Redis.')

await redis.quit()
