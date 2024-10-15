import { ThirdwebProvider } from "thirdweb/react";
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;