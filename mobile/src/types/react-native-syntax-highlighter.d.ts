declare module 'react-native-syntax-highlighter' {
  import React from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: any;
    highlighter?: string;
    PreTag?: React.ComponentType | string;
    CodeTag?: React.ComponentType | string;
    fontFamily?: string;
    fontSize?: number;
    textStyle?: any;
    children?: React.ReactNode;
  }
  
  const SyntaxHighlighter: React.FC<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}
