import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>DyslexoFly | Words take flight, reading feels right!</title>
        <meta name="description" content="Making educational content accessible for dyslexic students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}