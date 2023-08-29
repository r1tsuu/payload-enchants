import type { Server } from 'http'
import mongoose from 'mongoose'
import payload from 'payload'
import { start } from './src/server'
import { NewCollectionTypes } from '../src/types'

describe('Plugin tests', () => {
  let server: Server
  let newCollection: NewCollectionTypes[]

  beforeAll(async () => {
    server = await start({ local: true })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    server.close()
  })

  // Add tests to ensure that the plugin works as expected

  // Example test to check for seeded data
  it('seeds data accordingly', async () => {
    const newCollectionQuery = await payload.find({
      collection: 'new-collection',
      sort: 'createdAt',
    })

    newCollection = newCollectionQuery.docs

    expect(newCollectionQuery.totalDocs).toEqual(1)
  })
})
