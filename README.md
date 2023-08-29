# Payload Plugin Translator

## Video

[translator.webm](https://github.com/r1tsuu/payload-plugin-translator/assets/64744993/593a1dce-4a6e-4fe2-9707-a074587b4984)

## Usage

Copy `src` folder to `your_project_dir/src/plugins/translator` and install required for plugin deps:
`yarn add @slate-serializers/dom @slate-serializers/html domhandler domutils flatley lodash`

```ts
import { buildConfig } from 'payload/config';
import { translatorPlugin } from './plugins/translator';
/// ...

export default buildConfig({
  /// ...
plugins: [
  translatorPlugin({
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    collections: ['examples']
  }),
],
```
### Config params

`GOOGLE_API_KEY` - Google API Key

`collections` - Collections with enabled translator

`globals` - Globals with enabled translator

`translateService` - If you would like to use for example DeepL instead of Google, you can write you own implementation for service
```ts
type TranslateService = (text: string, target: string, source: string) => Promise<string>;
```

`afterTranslate` - Called after texts are translated, for example you can count how many characters of translator API user has used, you can also transform translated texts
```ts
type AfterTranslateData = {
  translatedTexts: string[];
  user: AuthCollection;
  req: PayloadRequest;
};

{ afterTranslate?: (data: AfterTranslateData) => Promise<string[]>; }
```

`beforeTranslate` - Called before translate service is called, you can transform data by returning texts
```ts
type BeforeTransalateData = {
  texts: string[];
  from: string;
  to: string;
  user: AuthCollection;
  req: PayloadRequest;
};

{ beforeTranslate?: (data: BeforeTransalateData) => Promise<string[]>; }
```

`access` - Access for the translator endpoint, if you want to disallow return `false`, `user` is accesiable inn `req`.
```ts
{ access?: (req: PayloadRequest) => Promise<boolean> | boolean; }
```

`slateToHtmlConfig` - Custom Slate To HTML Config from `slate-serializers`, this plugin transforms Slate's JSON to HTML as input to translation services. For more info https://github.com/thompsonsj/slate-serializers/tree/main/packages/html

`htmlToSlateConfig` - Custom HTML to Slate Config from `slate-serializers`, this plugin transforms Slate's JSON to HTML as input to translation services. For more info https://github.com/thompsonsj/slate-serializers/tree/main/packages/html

