// pages/_app.jsx
import Head from 'next/head';
import { globalStyles } from '../lib/theme';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`${globalStyles}`}</style>
      <Component {...pageProps} />
    </>
  );
}
