// app/about/page.tsx

"use client";

import { motion } from "framer-motion";

import BigCard1 from "@/components/big-card1";
import BigCard3 from "@/components/big-card3";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import { SmallerH1, H2 } from "@/components/Heading";
import Page from "@/components/page";
import ScrollProgress from "@/components/scroll";
import TextCard from "@/components/TextCard";


export default function AboutPage() {
  const texts = [
    {
      title: "Compliance",
      text: "Poor carbon reporting can expose your company to lawsuits, loss of revenue, and reputational damage. Detailed, comprehensive, and Green House Gas Protocol-aligned reporting ensures compliance with today’s regulations and prepares you for future ones.",
    },
    {
      title: "Finance",
      text: "Without a reliable emissions baseline, it’s impossible to verify reduction initiatives. Rigorous and transparent calculations protect your business from accusations of greenwashing and ensure sound reporting.",
    },
    {
      title: "Brand Equity",
      text: "Sustainability can boost brand equity both internally and externally. Recruit and retain engaged employees with an evidence-based sustainability strategy. Attract consumers by positioning your brand as an industry leader in environmental action.",
    },
  ];

  return (
    <>
      <div className="bg-white-light">
        <Page>
          <ScrollProgress />
          <main className=" min-h-screen px-2 lg:px-8 lg:mx-32">
            <div className="pt-16 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <SmallerH1>Take the Lead on Climate</SmallerH1>
                <H2>
                  It’s never too early or too late to start carbon accounting.
                  The time to act is now.
                </H2>

                <BigCard3
                  title={
                    <>
                      Climate <span className="text-light-green">Risk</span>,
                      Climate{" "}
                      <span className="text-light-green">Opportunity</span>
                    </>
                  }
                  description={
                    <>
                      Scientists and policymakers have agreed to limit the{" "}
                      <span className="text-light-green">harmful effects</span>{" "}
                      of climate change — the world must limit global warming to
                      less than <span className="text-light-green">1.5°C</span>.
                      Since the industrial revolution, businesses have been
                      responsible for the vast majority of emissions. Now,
                      businesses can lead the way to a sustainable future. In
                      line with the Paris Agreement, we must take{" "}
                      <span className="text-light-green">responsibility</span>{" "}
                      for our carbon footprint.
                    </>
                  }
                  icon="/images/icons/sun.svg"
                />

                <BigCard1
                  image="/images/images/card2.png"
                  title="Why Now? The World is Changing."
                  description={
                    <>
                      The world is transitioning to a{" "}
                      <strong>net-zero economy</strong>. Banks, investors, and
                      consumers demand transparent carbon disclosures. Proactive
                      emissions management reduces the risk of{" "}
                      <strong>compliance failures</strong>, saves{" "}
                      <strong>operational costs</strong>, and increases{" "}
                      <strong>brand equity</strong>. However, this work must be
                      founded on accurate emissions data, which is often{" "}
                      <strong>hard</strong> to find.
                    </>
                  }
                  button1="Learn more"
                  button2="Get started now"
                />

                <TextCard texts={texts} />

                <BigCard1
                  image="/images/images/card3.jpg"
                  title="The Path to Net Zero: A Clear Roadmap"
                  description={
                    <>
                      Measurement is the first step on the journey to net zero.
                      A reliable emissions baseline can be shared with
                      stakeholders and used for compliance. Set targets and
                      measure progress. Use insights to reduce emissions. <br />
                      <strong>
                        Reach net zero. Together, we can make a difference.
                      </strong>
                    </>
                  }
                  button1="Learn more"
                  button2="Get started now"
                />
              </motion.div>
            </div>

            <div className="mt-20">
              <FAQSection />
            </div>
          </main>

          <Footer />
        </Page>
      </div>
    </>
  );
}
