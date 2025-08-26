import React from "react";

import { motion } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";

import Button from "../button";
import CourseCard from "../course-card-student";
import { SmallerH1, H2 } from "../Heading";


type NestedList = (string | NestedList)[];

interface CourseCardType {
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

const StudentsTrainings: React.FC = () => {
  const Courses: CourseCardType[] = [
    {
      index: 1,
      peopleEnrolled: 22,
      duration: 5,
      certified: true,
      overview:
        "Life Cycle Assessment (LCA) quantifies the environmental impacts of a product, process, or service over its entire life cycle. From resource extraction to production, usage, and disposal, every stage can significantly influence the environment. LCA helps you assess these impacts comprehensively.",
      trainingTitle: "Life Cycle Assessment 101",
      trainingDescription:
        "Welcome to Carbon Jar’s LCA 101! Looking to learn about Life Cycle Assessment (LCA), understand its relevance to your studies and career, or improve communication with LCA experts? Our online course offers all this and more, tailored especially for university students and young professionals.",
      whyCourse: [
        "Essential for those in environmental science, product design, or sustainable development.",
        "Learn to conduct thorough Life Cycle Assessments.",
        "Make informed sustainability choices.",
        "Integrate LCA into your professional toolkit.",
        "Contribute to environmentally conscious decision-making.",
      ],
      content1: [
        "No prior knowledge of LCA is required. The course includes:",
        "Introduction to life cycle perspective and LCA",
        "The four phases according to ISO 14040/-44:",
        [
          "Goal and scope",
          "Inventory analysis",
          "Impact assessment",
          "Interpretation of results",
        ],
        "Application and communication of LCAs",
        "Environmental Product Declaration (EPD)",
        "Current topics",
      ],
      link: "#",
    },
    {
      index: 2,
      peopleEnrolled: 22,
      duration: 2,
      certified: true,
      link: "#",
      trainingTitle: "Carbon 101: From Zero to Eco Hero",
      overview:
        "Understanding and managing your carbon footprint is essential for identifying inefficiencies in energy and resource use. Knowing the total greenhouse gas (GHG) emissions and their sources is crucial for making informed decisions and contributing to sustainability efforts.",
      trainingDescription2:
        "This training is designed for university students and young professionals who want to learn how to assess and manage carbon footprints. You’ll gain practical knowledge and techniques through real-life case studies, helping you make a positive impact in your field.",
      content2: new Map([
        [
          "Introduction to GHG Scope 1 and 2 emissions (6 hours)",
          [
            "Climate Change and Global Warming",
            "National (2050 strategy and NDCs) and International Strategies – UNFCCC/Kyoto Protocol",
            "Climate Change: Business threats & opportunities",
            "GHG Inventory Standards – GHG Protocol – IPCC – ISO 146046-1:2018",
            "Principles for GHG Inventory Reporting",
            "Setting GHG Inventory Boundaries",
            "Steps in Identifying and Calculating Emissions",
            "Reporting GHG Emissions",
            "Performing Assurance and Verification",
          ],
        ],
        [
          "Scope 3 emissions and carbon management (6 hours)",
          [
            "Scope 3: Upstream Activities",
            "Scope 3: Downstream Activities",
            "Data Screening and Data Quality",
            "Calculation Guidance for Scope 3",
            "Scope 3 Management Best Practices",
            "Carbon Footprint Management Plan",
            "Designing Mitigation Goals",
            "Tracking Emissions and Performance through Key Performance Indicators",
            "Review",
          ],
        ],
      ]),
      whyCourse: [
        "Essential for students and young professionals in various fields, including environmental science, business, and sustainability.",
        "Learn to assess and manage carbon footprints effectively.",
        "Gain practical skills through real-life case studies.",
        "Align your efforts with global and national climate strategies.",
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <section className="flex flex-col bg-green lg:p-12 lg:pb-20 lg:pt-20 p-6 mt-6 lg:mt-40">
        <SmallerH1 className="text-white-light">
          Featured Students Training Courses
        </SmallerH1>
        <br />
        <H2 className="text-white-light">
          Enhance your team’s expertise, drive operational efficiency, and
          achieve your sustainability goals with our specialized training
          programs.
        </H2>

        {Courses.map((course, index) => (
          <CourseCard
            key={index}
            index={course.index}
            peopleEnrolled={course.peopleEnrolled}
            duration={course.duration}
            certified={course.certified}
            trainingTitle={course.trainingTitle}
            trainingDescription={course.trainingDescription ?? ''}
            overview={course.overview ?? ''}
            trainingDescription2={course.trainingDescription2 ?? ''}
            whyCourse={course.whyCourse}
            {...(course.content1 ? { content1: course.content1 } : {})}
            {...(course.content2 ? { content2: course.content2 } : {})}
            link={course.link}
          />
        ))}

        <br />
        <SmallerH1 className="text-white-light">
          Ready to make a difference ?
        </SmallerH1>
        <br />
        <H2 className="text-white-light">
          Join us now and start your journey towards sustainability!
        </H2>

        <div className="mt-8 mb-8 flex justify-center items-center w-full mx-auto">
          <Button modifier="px-8">
            Get started now <IoIosArrowForward />
          </Button>
        </div>
      </section>
    </motion.div>
  );
};

export default StudentsTrainings;
