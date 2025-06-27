import { AppProps } from 'next/app';
import Head from 'next/head';
import '../app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>DyslexoFly | Words take flight, reading feels right!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Making educational content accessible for dyslexic students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;