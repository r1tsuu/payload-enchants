// import jsdom from 'jsdom';
import { getAttributeValue } from 'domutils'
import { extractCssFromStyle } from '@slate-serializers/dom'
import { Element } from 'domhandler'

const ELEMENT_NAME_TAG_MAP = {
  p: 'p',
  paragraph: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  blockquote: 'blockquote',
}

const MARK_ELEMENT_TAG_MAP = {
  strikethrough: ['s'],
  bold: ['strong'],
  underline: ['u'],
  italic: ['i'],
  code: ['pre', 'code'],
}

export const slateToHtmlConfig = {
  markMap: MARK_ELEMENT_TAG_MAP,
  elementMap: ELEMENT_NAME_TAG_MAP,
  elementTransforms: {
    quote: ({ children = [] }) => {
      const p = [new Element('p', {}, children as any)]
      return new Element('blockquote', {}, p) as any
    },
    relationship: ({ node, children }: any) => {
      return new Element(
        'relation',
        {
          to: node.relationTo,
          id: node.value.id,
        },
        children,
      )
    },
    upload: ({ node, children }: any) => {
      return new Element(
        'upload',
        {
          to: node.relationTo,
          id: node.value.id,
        },
        children,
      )
    },
    link: ({ node, children = [] }: any) => {
      const attrs: any = {}
      if (node.newTab) {
        attrs.target = '_blank'
      }
      if (node.doc) {
        attrs.value = node.doc.value
        attrs.relationTo = node.doc.relationTo
      }
      if (node.url) {
        attrs.href = node.url
      }

      return new Element(
        'a',
        {
          linkType: node.linkType,
          ...attrs,
        },
        children as any,
      ) as any
    },
  },
  encodeEntities: false,
  alwaysEncodeBreakingEntities: true,
  alwaysEncodeCodeEntities: false,
  convertLineBreakToBr: false,
}

export const htmlToSlateConfig = {
  elementAttributeTransform: ({ el }: any) => {
    const attrs: { [key: string]: string } = {}
    const elementStyleMap: { [key: string]: string } = {
      align: 'textAlign',
    }
    Object.keys(elementStyleMap).forEach(slateKey => {
      const cssProperty = elementStyleMap[slateKey]
      const cssValue = extractCssFromStyle(el, cssProperty)
      if (cssValue) {
        attrs[slateKey] = cssValue
      }
    })
    return attrs
  },
  elementTags: {
    a: (el: any) => {
      if (!el) return {}
      const relationTo = getAttributeValue(el, 'relationto')
      const value = getAttributeValue(el, 'value')
      const url = getAttributeValue(el, 'href')
      const target = getAttributeValue(el, 'target')
      const linkType = getAttributeValue(el, 'linktype')

      return {
        type: 'link',
        ...(relationTo && {
          doc: {
            value,
            relationTo,
          },
        }),
        linkType,
        ...(url && { url }),
        ...(target &&
          target === '_blank' && {
            newTab: true,
          }),
      }
    },
    blockquote: () => ({ type: 'blockquote' }),
    h1: () => ({ type: 'h1' }),
    h2: () => ({ type: 'h2' }),
    h3: () => ({ type: 'h3' }),
    h4: () => ({ type: 'h4' }),
    h5: () => ({ type: 'h5' }),
    h6: () => ({ type: 'h6' }),
    li: () => ({ type: 'li' }),
    ol: () => ({ type: 'ol' }),
    p: () => ({ type: 'p' }),
    ul: () => ({ type: 'ul' }),
    relation: (el: any) => ({
      type: 'relationship',
      relationTo: getAttributeValue(el, 'to'),
      value: {
        id: getAttributeValue(el, 'id'),
      },
    }),
    upload: (el: any) => ({
      type: 'upload',
      relationTo: getAttributeValue(el, 'to'),
      value: {
        id: getAttributeValue(el, 'id'),
      },
    }),
  },
  textTags: {
    code: () => ({ code: true }),
    pre: () => ({ code: true }),
    del: () => ({ strikethrough: true }),
    em: () => ({ italic: true }),
    i: () => ({ italic: true }),
    s: () => ({ strikethrough: true }),
    strong: () => ({ bold: true }),
    u: () => ({ underline: true }),
  },
  htmlPreProcessString: (html: string) =>
    html.replace(/<pre[^>]*>/g, '<code>').replace(/<\/pre>/g, '</code>'),
  filterWhitespaceNodes: true,
  convertBrToLineBreak: true,
}
