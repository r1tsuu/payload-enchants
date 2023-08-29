import type { Server } from 'http';
import mongoose from 'mongoose';
import payload from 'payload';
import { start } from './src/server';

describe('Plugin tests', () => {
  let server: Server;

  beforeAll(async () => {
    server = await start({ local: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  // Add tests to ensure that the plugin works as expected

  // Example test to check for seeded data

  expect(true).toBe(true);
});
