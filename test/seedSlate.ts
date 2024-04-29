export const slateRich = [
  {
    children: [
      {
        children: [
          {
            text: "Hello, it's a rich text (Slate)",
          },
        ],
        type: 'h2',
      },
      {
        children: [
          {
            text: 'Blockquote',
          },
        ],
        type: 'blockquote',
      },
      {
        children: [
          {
            italic: true,
            text: 'center aligned',
          },
        ],
        textAlign: 'center',
        type: 'h2',
      },
      {
        children: [
          {
            strikethrough: true,
            text: 'some text here',
          },
        ],
      },
      {
        children: [
          {
            strikethrough: true,
            text: '',
          },
        ],
      },
      {
        children: [
          {
            strikethrough: true,
            text: '',
          },
        ],
      },
    ],
    type: 'indent',
  },
];
