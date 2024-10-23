import { extendTheme, ThemeConfig } from "@chakra-ui/react";
export const chakraThemeConfig = {
  initialColorMode: "dark", 
  useSystemColorMode: false, 
} as const;

export const chakraTheme = extendTheme({
  config: chakraThemeConfig,
  fonts: {
    heading: `'Bebas Neue', sans-serif`, 
  },
  breakpoints: {
    xxxxl: '3000px',
    xxxl: '2600px',
    xxl: '2260px', 
    xl: '1700px',
  },
  
  styles: {
    global: {
      body: {
        bg: "#212121",
         
      },
      
    },
    
  },
  
});
