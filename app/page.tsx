import CarbonManagement from '@/components/carbon-management';
import CardsSection from '@/components/cards-section';
import ClimateActionSection from '@/components/climate-action';
import FAQSection from '@/components/faq-section';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Page from '@/components/page';
import ScrollProgress from '@/components/scroll';
import CardSection from '@/components/testamonials';

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
