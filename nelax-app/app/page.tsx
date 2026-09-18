import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BentoGrid from "./components/BentoGrid";
import AiChatFeature from "./components/AiChatFeature";
import AiTranscriptionFeature from "./components/AiTranscriptionFeature";
import CtaSection from "./components/CtaSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/20 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <AiChatFeature />
        <AiTranscriptionFeature />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
