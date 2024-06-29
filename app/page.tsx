import Head from 'next/head';
import './globals.css';
import GoldenRatio from '@/components/golden-ratio';

const Home = () => {
  return (
    <div>
      <Head>
        <title>Portfolio</title>
        <meta name="Harshit Kumar" content="Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <GoldenRatio />
        {/* <GoldenRatioCurve/> */}
      </main>
    </div>
  );
};

export default Home;
