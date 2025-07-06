"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { H1Inter, H2, H3 } from "../Heading";
import SmallerBox from "../smallbox";
import ContentCard from "../content-card";
import Image from "next/image";

type NestedList = (string | NestedList)[];

interface CourseCardStudentProps {
  index: number;
  peopleEnrolled: number;
  duration: number;
  certified: boolean;
  trainingTitle: string;
  trainingDescription?: string;
  trainingDescription2?: string;
  overview?: string;
  whyCourse: string[];
  content1?: NestedList;
  content2?: Map<string, string[]>;
  link: string;
}

const CourseCardStudent: React.FC<CourseCardStudentProps> = ({
  index,
  peopleEnrolled,
  duration,
  certified,
  trainingTitle,
  trainingDescription,
  overview,
  trainingDescription2,
  whyCourse,
  content1,
  content2,
  link,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px", amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="relative items-start m-8 lg:px-8 gap-4 rounded-lg border border-green-dark bg-green-dark shadow-md p-6">
        <motion.a
          href={link}
          className="lg:absolute lg:right-6 lg:top-6 text-white-light text-sm underline flex items-center gap-1"
          whileHover={{ scale: 1.05, color: "#e0e0e0" }}
          whileTap={{ scale: 0.95, color: "#b0b0b0" }}
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
          {trainingDescription && (
            <H3 className="text-white-light text-left">
              {trainingDescription}
            </H3>
          )}
          {overview && (
            <H3 className="text-white-light text-left">
              <span className="underline text-lg">Training Overview:</span>{" "}
              {overview}
            </H3>
          )}
          {trainingDescription2 && (
            <H3 className="text-white-light text-left">
              {trainingDescription2}
            </H3>
          )}

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Image
                src="/images/icons/Stack.svg"
                alt="stack-icon"
                width={24}
                height={24}
              />
              <H2 className="text-white-light font-bold">Course Content</H2>
            </div>

            {content1 && (
              <ul className="list-disc pl-5 mt-2 text-white-light text-left font-Inter">
                {content1.map((item, index) => (
                  <li key={index} className="mb-2">
                    {Array.isArray(item) ? (
                      <ul className="list-disc pl-5 mt-2">
                        {item.map((subItem, subIndex) => (
                          <li key={subIndex}>{subItem}</li>
                        ))}
                      </ul>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            )}

            {content2 && (
              <div className="grid grid-cols-2">
                {[...content2.entries()].map(([title, textList], index) => (
                  <div key={index}>
                    <ContentCard
                      dayTitle={`Day ${index + 1}`}
                      topicTitle={title}
                      othertext={textList}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-0">
              <Image
                src="/images/icons/fi-sr-info.svg"
                alt="info-icon"
                width={24}
                height={24}
              />
              <H2 className="text-white-light font-bold">
                Why take this course?
              </H2>
            </div>
            <ul className="list-disc pl-5 mt-2 text-white-light text-left font-Inter">
              {whyCourse.map((reason, index) => (
                <li key={index} className="mb-2">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {certified && (
            <div className="mt-2">
              <H2 className="text-white-light text-left">
                <span className="font-bold">Certification: </span>
                Participants who attend and complete the training course will
                receive a Carbon Jar Certificate of Completion.
              </H2>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCardStudent;
