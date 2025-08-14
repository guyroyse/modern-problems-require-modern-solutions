# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a meme matching application called "Finding Your Meme Twin" that uses AI image embeddings and vector similarity search to match user photos with memes. The system consists of three TypeScript services:

1. **meme-client** - Frontend Vite/TypeScript app with camera integration
2. **meme-server** - Express.js REST API server for image matching  
3. **meme-loader** - Data loading service that embeds memes and stores them in Redis

The architecture uses Redis with vector search capabilities, Hugging Face Transformers for image embeddings (CLIP model), and Docker Compose for orchestration.

## Development Commands

### Quick Start
```bash
docker compose up
```
Navigate to http://localhost:8000

### Individual Services

**meme-client** (Frontend - Port 8000):
```bash
cd meme-client
npm run dev          # Development server with Vite
npm run build        # Production build
npm run preview      # Preview production build
```

**meme-server** (API - Port 8080):
```bash
cd meme-server
npm run dev          # Development with vite-node
npm run build        # TypeScript compilation to dist/
npm run start        # Run compiled version
```

**meme-loader** (Data Loader):
```bash
cd meme-loader
npm run dev          # Run loader in development
npm run build        # TypeScript compilation to dist/
npm run start        # Run compiled version
```

## Architecture Details

### Image Processing Pipeline
1. meme-loader processes PNG/JPG files from `./memes/` directory
2. Uses Xenova/clip-vit-base-patch32 model via @huggingface/transformers
3. Stores embeddings as binary data in Redis with hash structure: `{title, image, embedding}`

### Vector Search System
- Redis vector search with configurable distance metrics (Cosine, Inner Product, Euclidean)
- Dynamic index aliasing allows runtime metric switching via API endpoints
- KNN search with k=1 for finding closest meme match

### Client-Server Flow
- Frontend captures camera input, crops to square aspect ratio
- Posts image blob to `/match` endpoint
- Server embeds user image and performs vector search against stored memes
- Returns matched meme metadata and serves images via `/image/:key`

### Key Files
- `meme-client/src/app.ts` - Main frontend logic with camera handling
- `meme-server/src/matcher.ts` - Vector search and matching logic  
- `meme-loader/src/embedder.ts` - Image embedding functionality
- `**/src/redis-client.ts` - Redis connection and index management

### Docker Services
- **redis**: Standard Redis with vector search capabilities
- **meme-loader**: Runs once to populate Redis with meme embeddings
- **meme-server**: REST API server with CORS enabled
- **meme-client**: Vite dev server serving frontend

All services share Redis connection via environment variables `REDIS_HOST` and `REDIS_PORT`.