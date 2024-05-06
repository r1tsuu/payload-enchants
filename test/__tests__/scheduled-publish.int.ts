import { config } from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import type { Payload } from 'payload';
import { getPayload } from 'payload';
import { importConfig } from 'payload/node';
import { fieldAffectsData } from 'payload/types';
import { fileURLToPath } from 'url';

config({
  path: path.resolve(fileURLToPath(import.meta.url), '../../.env'),
});

let payload: Payload;

describe('Scheduled Publish plugin test', () => {
  beforeAll(async () => {
    payload = await getPayload({
      config: await importConfig(
        path.resolve(fileURLToPath(import.meta.url), '../../payload.config.ts'),
      ),
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Basic', () => {
    it('Should create publishedAt date field', () => {
      const { config } = payload.collections['scheduled-docs'];

      const field = config.fields.find(
        (each) => fieldAffectsData(each) && each.name === 'publishedAt',
      );

      expect(field?.type).toBe('date');
    });
  });
});
