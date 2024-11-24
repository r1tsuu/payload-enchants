import { config } from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import type { Payload } from 'payload';
import { fileURLToPath } from 'url';

config({
  path: path.resolve(fileURLToPath(import.meta.url), '../../.env'),
});

let payload: Payload;

describe('Translator operation test', () => {
  beforeAll(async () => {});

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('Should copy the data', async () => {
    const {
      docs: [postDefaultLocale],
    } = await payload.find({ collection: 'posts', depth: 0, limit: 1 });

    const translateResult = await translateOperation({
      collectionSlug: 'posts',
      emptyOnly: false,
      id: postDefaultLocale.id,
      locale: 'de',
      localeFrom: 'en',
      payload,
      resolver: 'copy',
      update: true,
    });

    expect(translateResult.success).toBe(true);
    expect((translateResult as any).translatedData).toEqual({
      ...postDefaultLocale,
      updatedAt: expect.any(String),
    });

    const {
      docs: [postGermanLocale],
    } = await payload.find({ collection: 'posts', depth: 0, limit: 1, locale: 'de' });

    expect(postGermanLocale).toEqual({
      ...postDefaultLocale,
      updatedAt: expect.any(String),
    });
  });
});
