import { ThirdwebProvider } from "thirdweb/react";
import type { AppProps } from 'next/app';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;