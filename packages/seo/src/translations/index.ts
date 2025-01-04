import type {
  GenericTranslationsObject,
  NestedKeysStripped,
} from "@payloadcms/translations"

import { cs } from "./cs"
import { de } from "./de"
import { en } from "./en"
import { es } from "./es"
import { fa } from "./fa"
import { fr } from "./fr"
import { it } from "./it"
import { nb } from "./nb"
import { pl } from "./pl"
import { ru } from "./ru"
import { sv } from "./sv"
import { tr } from "./tr"
import { uk } from "./uk"

export const translations = {
  cs,
  de,
  en,
  es,
  fa,
  fr,
  it,
  nb,
  pl,
  ru,
  sv,
  tr,
  uk,
}

export type PluginSEOTranslations = GenericTranslationsObject

export type PluginSEOTranslationKeys = NestedKeysStripped<PluginSEOTranslations>
