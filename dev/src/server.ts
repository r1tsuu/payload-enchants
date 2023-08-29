import express from 'express'
import type { Server } from 'http'
import payload from 'payload'
import path from 'path'
import { seed } from './seed'

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

export const start = async (args: { local: boolean } = { local: false }): Promise<Server> => {
  const { local } = args
  await payload.init({
    local,
    secret: process.env.PAYLOAD_SECRET || 'here-is-a-secret',
    mongoURL: process.env.MONGODB_URI || 'mongodb://127.0.0.1/plugin-development',
    express: app,
  })


  if (process.env.PAYLOAD_SEED === 'true') {
    await seed(payload)
  }

  return app.listen(3000)
}

// when build.js is launched directly
if (module.id === require.main?.id) {
  start()
}
