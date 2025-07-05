import Header from "@/components/header";
import Footer from "@/components/footer";
import CarbonManagement from "@/components/carbon-management";
import ClimateActionSection from "@/components/climate-action";
import CardsSection from "@/components/cards-section";
import CardSection from "@/components/testamonials";
import FAQSection from "@/components/faq-section";
import ScrollProgress from "@/components/scroll";
import Page from "@/components/page";


export default function HomePage() {
  return (
    <>
      <Page>
        <ScrollProgress />
        <Header />
        <main className="bg-white-light min-h-screen">
          <CarbonManagement />
          <ClimateActionSection />
          <CardsSection />
          <CardSection />
          <FAQSection />
        </main>
        <Footer />
      </Page>
    </>
  );
}
