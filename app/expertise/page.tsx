"use client";

import Footer from "@/components/footer";
import CarbonCards from "@/components/cards-section2";
import FAQSection from "@/components/faq-section2";
import ScrollProgress from "@/components/scroll";

export default function ExpertisePage() {
  return (
    <>
      <ScrollProgress />
      <main className="bg-green min-h-screen">
        <CarbonCards />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
