export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textLight: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      body: string;
      h1: string;
      small: string;
    };
    fontWeight: {
      regular: number;
      bold: number;
    };
  };
  space: number[];
  radii: {
    sm: string;
    md: string;
    lg: string;
  };
  animations: {
    pulse: string;
    fade: string;
  };
  layout: {
    maxWidth: string;
    navHeight: string;
  };
}

// Extend the DefaultTheme interface from styled-components
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
} 