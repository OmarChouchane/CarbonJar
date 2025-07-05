"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { H1Inter, H2, H3 } from "../Heading";
import SmallerBox from "../smallbox";
import ContentCard from "../content-card";
import Image from "next/image";


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
  const expectedDays = Array.from(
    { length: duration },
    (_, i) => `Day ${i + 1}`
  );
  const validContent = expectedDays.reduce((acc, day) => {
    acc[day] = content[day] || "";
    return acc;
  }, {} as Record<string, string>);

  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      <div className="relative m-8 gap-4 rounded-lg lg:pl-8 border border-green-dark bg-green-dark shadow-md p-6">
        <motion.a
          href={link}
          className="absolute right-6 top-6 text-white-light text-sm underline flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <H3 className="text-white-light">Start Course Now</H3>
          <MdArrowForwardIos className="text-white-light" />
        </motion.a>

        <div className="flex flex-wrap gap-4 mb-4">
          <SmallerBox text={`+ ${peopleEnrolled} people enrolled`} />
          <SmallerBox text={`${duration}-day intensive course`} />
          {certified && (
            <SmallerBox
              text={
                <>
                  <FaCheck className="inline mr-1 text-green-light" /> Certified
                </>
              }
            />
          )}
        </div>

        <div className="flex flex-col items-start gap-4">
          <H1Inter className="text-white-light">
            Training {index} : {trainingTitle}
          </H1Inter>
          <H3 className="text-white-light">{trainingDescription}</H3>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icons/octicon_goal-16.svg" alt="goals-icon" width={20} height={20} />
              <H2 className="text-white-light font-bold">Goals:</H2>
            </div>
            <ul className="list-disc pl-5 mt-2 text-white-light font-Inter text-left">
              {goals.map((goal, index) => (
                <li key={index} className="mb-2">
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icons/User.svg" alt="target-icon" width={20} height={20} />
              <H2 className="text-white-light font-bold">Target Audience:</H2>
            </div>
            <ul className="list-disc pl-5 mt-2 text-white-light font-Inter text-left">
              {targetAudience.map((audience, index) => (
                <li key={index} className="mb-2">
                  {audience}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icons/Stack.svg" alt="content-icon" width={20} height={20} />
            <H2 className="text-white-light font-bold">Course Content:</H2>
          </div>
          <div className="grid grid-cols-2">
            {Object.entries(validContent).map(([day, topic], index) => (
              <div key={index} className="m-2">
                <ContentCard dayTitle={day} topicTitle={topic} />
              </div>
            ))}
          </div>
        </div>

        {certified && (
          <div className="mt-2">
            <H2 className="text-white-light text-left">
              <span className="font-bold">Certification:</span> Participants who
              attend and complete the training course will receive a Carbon Jar
              Certificate of Completion.
            </H2>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseCard;
