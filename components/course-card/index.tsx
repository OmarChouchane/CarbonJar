'use client';

import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';
import { MdArrowForwardIos } from 'react-icons/md';

import ContentCard from '../content-card';
import { H1Inter, H2, H3 } from '../Heading';
import SmallerBox from '../smallbox';

interface CourseCardProps {
  index: number;
  peopleEnrolled: number;
  duration: number;
  certified: boolean;
  trainingTitle: string;
  trainingDescription: string;
  goals: string[];
  targetAudience: string[];
  content: Record<string, string>;
  link: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  index,
  peopleEnrolled,
  duration,
  certified,
  trainingTitle,
  trainingDescription,
  goals,
  targetAudience,
  content,
  link,
}) => {
  const expectedDays = Array.from({ length: duration }, (_, i) => `Day ${i + 1}`);
  const validContent = expectedDays.reduce(
    (acc, day) => {
      acc[day] = content[day] || '';
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px', amount: 0.1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="border-green-dark bg-green-dark relative m-2 gap-4 rounded-lg border p-4 shadow-md sm:m-4 sm:p-6 lg:m-8 lg:pl-8">
        <motion.a
          href={link}
          className="text-white-light absolute top-3 right-3 flex items-center gap-1 text-xs underline sm:top-6 sm:right-6 sm:text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <H3 className="text-white-light text-xs sm:text-sm">Start Course Now</H3>
          <MdArrowForwardIos className="text-white-light text-xs sm:text-sm" />
        </motion.a>

        <div className="mb-4 flex flex-wrap gap-2 pt-8 sm:gap-4 sm:pt-0">
          <SmallerBox text={`+ ${peopleEnrolled} people enrolled`} />
          <SmallerBox text={`${duration}-day intensive course`} />
          {certified && (
            <SmallerBox
              text={
                <>
                  <FaCheck className="text-green-light mr-1 inline" /> Certified
                </>
              }
            />
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <H1Inter className="text-white-light text-lg sm:text-xl lg:text-2xl">
            Training {index} : {trainingTitle}
          </H1Inter>
          <H3 className="text-white-light text-sm sm:text-base">{trainingDescription}</H3>

          <div className="mt-2 w-full">
            <div className="flex items-center gap-2">
              <Image
                src="/images/icons/octicon_goal-16.svg"
                alt="goals-icon"
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
              <H2 className="text-white-light text-sm font-bold sm:text-base">Goals:</H2>
            </div>
            <ul className="text-white-light font-Inter mt-2 list-disc pl-4 text-left text-sm sm:pl-5 sm:text-base">
              {goals.map((goal, index) => (
                <li key={index} className="mb-1 sm:mb-2">
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2 w-full">
            <div className="flex items-center gap-2">
              <Image
                src="/images/icons/User.svg"
                alt="target-icon"
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
              <H2 className="text-white-light text-sm font-bold sm:text-base">Target Audience:</H2>
            </div>
            <ul className="text-white-light font-Inter mt-2 list-disc pl-4 text-left text-sm sm:pl-5 sm:text-base">
              {targetAudience.map((audience, index) => (
                <li key={index} className="mb-1 sm:mb-2">
                  {audience}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/Stack.svg"
              alt="content-icon"
              width={20}
              height={20}
              className="h-4 w-4 sm:h-5 sm:w-5"
            />
            <H2 className="text-white-light text-sm font-bold sm:text-base">Course Content:</H2>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            {Object.entries(validContent).map(([day, topic], index) => (
              <div key={index}>
                <ContentCard dayTitle={day} topicTitle={topic} />
              </div>
            ))}
          </div>
        </div>

        {certified && (
          <div className="mt-4">
            <H2 className="text-white-light text-left text-sm sm:text-base">
              <span className="font-bold">Certification:</span> Participants who attend and complete
              the training course will receive a Carbon Jar Certificate of Completion.
            </H2>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseCard;
