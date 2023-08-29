import { TranslatorConfig } from '../types';
import { PayloadHandler } from 'payload/config';
import { createGoogleTranslateService } from './services/google';

export const createTranslatorHandler = (translatorConfig: TranslatorConfig): PayloadHandler => {
  const translateService = translatorConfig.translateService
    ? translatorConfig.translateService
    : createGoogleTranslateService(translatorConfig.GOOGLE_API_KEY as string);

  return async (req, res) => {
    if (translatorConfig.access) {
      const hasAccesses = await translatorConfig.access(req);
      if (!hasAccesses) res.status(403).send();
    } else {
      if (!req.user) return res.status(403).send();
    }

    let { texts, from, to } = req.body as {
      texts: string[];
      from: string;
      to: string;
    };

    if (translatorConfig.beforeTranslate) {
      texts = await translatorConfig.beforeTranslate({ texts, from, to, req, user: req.user });
    }

    const promises = texts.map((text: string) => translateService(text, to, from));
    let translated = await Promise.all(promises);

    if (translatorConfig.afterTranslate) {
      translated = await translatorConfig.afterTranslate({
        translatedTexts: translated,
        req,
        user: req.user,
      });
    }

    res.json(translated);
  };
};
