"use client";

import Footer from "@/components/footer";
import CarbonCards from "@/components/cards-section2";
import FAQSection from "@/components/faq-section2";
import ScrollProgress from "@/components/scroll";
import Page from "@/components/page";

export default function ExpertisePage() {
  return (
    <>
      <div className="bg-green">
        <Page>
          <ScrollProgress />
          <main className="min-h-screen">
            <CarbonCards />
            <FAQSection />
          </main>
          <Footer />
        </Page>
      </div>
    </>
  );
}
