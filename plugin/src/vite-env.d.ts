/// <reference types="vite/client" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;

  export default content;
}

declare module 'react-toastify' {
  export const toast: any;
}
