import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Hero from '../components/landing/Hero';
import TrustBar from '../components/landing/TrustBar';
import Services from '../components/landing/Services';
import HowItWorks from '../components/landing/HowItWorks';
import Calculator from '../components/landing/Calculator';
import Pricing from '../components/landing/Pricing';
import WhyUs from '../components/landing/WhyUs';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import Chat from '../components/chat/Chat';

export default function Home() {
  return (
    <>
      <Head>
        <title>ReclamaVuelo — Reclama hasta 600€ por tu vuelo retrasado</title>
        <meta name="description" content="Abogados y tecnología al servicio del pasajero desde 2017. Solo cobramos si ganamos. Analizamos tu caso con IA en 2 minutos." />
      </Head>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <Calculator />
        <Chat />
        <Pricing />
        <WhyUs />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
