import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'

const port = Number(process.env.PORT || 8787)
const host = process.env.NODE_ENV === 'production'
  ? '0.0.0.0'
  : '127.0.0.1'

const app = createApp()
const distPath = fileURLToPath(new URL('../dist/', import.meta.url))

app.use(express.static(distPath))

app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
  response.sendFile('index.html', { root: distPath })
})

const server = createServer(app)

server.on('error', (error) => {
  console.error('Server startup failed:', error.code, error.message)
  process.exitCode = 1
})

server.listen(port, host, () => {
  console.log(`ApplyReady listening on ${host}:${port}`)
})