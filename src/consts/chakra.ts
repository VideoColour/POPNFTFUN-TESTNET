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
    xxl: '2060px', 
    xl: '1566px',
    lg: '1175px',
  },
  
  styles: {
    global: {
      body: {
        bg: "#212121",
         
      },
      
    },
    
  },
});
