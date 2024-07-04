import OpenAI from 'openai';
import type { PayloadRequest } from 'payload';

let openai: OpenAI;

const isInited = false;

export const openaiMessage = async ({
  apiKey,
  content,
  req,
}: {
  apiKey: string;
  content: string;
  req: PayloadRequest;
}) => {
  try {
    if (!isInited) {
      const configuration = {
        apiKey,
      };

      openai = new OpenAI(configuration);
    }

    const {
      choices: [{ message }],
    } = await openai.chat.completions.create({
      messages: [
        {
          content,
          role: 'user',
        },
      ],
      model: 'gpt-3.5-turbo',
    });

    return message.content;
  } catch (error) {
    if (error instanceof Error) req.payload.logger.error(error.message);

    return '';
  }
};
