import 'react';
import type React from 'react';

declare module 'react' {
  interface CSSProperties {
    focusRingColor?: string;
  }
}

declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any>;
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {};
