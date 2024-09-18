import { ReactElement, ReactNode } from "react";

declare module '*.tiff' {
  const value: string;
  export default value;
}

// declare module '*.svg' {
//   const value: ReactElement;
//   export default value;
// }
