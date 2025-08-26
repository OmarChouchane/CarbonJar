'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { H2, SmallerH1 } from '../Heading';
import StatisticBlock from '../static-bloc';

const ClimateActionSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <section className="bg-green flex flex-col items-center justify-center gap-16 py-16 lg:mt-16 lg:mb-12">
        <div className="flex flex-col items-center justify-start gap-4">
          <div className="self-stretch text-center">
            <SmallerH1 className="text-white-light">
              The <span className="text-light-green">Urgency</span>{' '}
              <span className="text-white-light">of Climate Action</span>
            </SmallerH1>
          </div>
          <H2 className="text-white-light">Sustainability can no longer wait!</H2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatisticBlock
            percentage="66%"
            description={
              <span>
                of global consumers are willing to pay more for a product if a business is{' '}
                <span className="text-light-green">green</span> and{' '}
                <span className="text-light-green">ethical</span>.
              </span>
            }
          />
          <StatisticBlock
            percentage="40%"
            description={
              <span>
                of staff will look for a new job if their employer does not engage in{' '}
                <span className="text-light-green">sustainable</span> business practices.
              </span>
            }
          />
          <StatisticBlock
            percentage="50%"
            description={
              <span>
                of institutional investors now assess{' '}
                <span className="text-light-green">environmental</span> impact when making
                investment decisions.
              </span>
            }
          />
          <StatisticBlock
            percentage="40%"
            description={
              <span>
                of global banking assets are committed to aligning their lending and investment
                portfolios with <span className="text-light-green">net-zero</span> emissions by
                2050.
              </span>
            }
          />
        </div>
      </section>
    </motion.div>
  );
};

export default ClimateActionSection;
