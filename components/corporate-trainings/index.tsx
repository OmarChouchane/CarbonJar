"use client";

import React from "react";
import BigCard2 from "../big-card2";
import { motion } from "framer-motion";
import { SmallerH1, H2 } from "../Heading";
import CourseCard from "../course-card";
import Button from "@/components/button";
import { IoIosArrowForward } from "react-icons/io";

const CorporateTrainings: React.FC = () => {
  interface CourseCardType {
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

  const Courses: CourseCardType[] = [
    {
      index: 1,
      peopleEnrolled: 22,
      duration: 5,
      certified: true,
      trainingTitle: "Measuring & Reporting Carbon Footprint",
      trainingDescription:
        "Learn to measure, report, and reduce carbon footprints, focusing on environmental and business impacts.",
      goals: [
        "Understand carbon footprints.",
        "Identify emission sources.",
        "Calculate emissions.",
        "Implement reduction practices.",
        "Report per international standards.",
        "Analyze data for decisions.",
      ],
      targetAudience: [
        "Environmental/Sustainability Management",
        "CSR",
        "Energy/Utilities",
        "Climate/Carbon Management",
        "Business Strategy",
      ],
      content: {
        "Day 1": "Introduction to Carbon Footprint",
        "Day 2": "Carbon Footprint Calculation Methods",
        "Day 3": "Carbon Footprint Reduction Strategies",
        "Day 4": "Carbon Footprint Reporting",
        "Day 5": "Carbon Footprint Analysis and Decision Making",
      },
      link: "#",
    },
    {
      index: 2,
      peopleEnrolled: 22,
      duration: 5,
      certified: true,
      trainingTitle:
        "Carbon Capture and Storage (CCS) for Non-Technical Professionals",
      trainingDescription:
        "This course covers CCS technology, its applications, challenges, and opportunities in sustainability and climate action.",
      goals: [
        "Understand CCS principles and processes.",
        "Learn about carbon capture technologies.",
        "Explore storage and transportation methods.",
        "Analyze economic and financial aspects.",
        "Examine social and ethical dimensions.",
        "Identify emerging trends in CCS.",
      ],
      targetAudience: [
        "Sustainability Managers",
        "Environmental Consultants",
        "Policy Analysts",
        "Business Development Managers",
        "Energy Industry Professionals (Non-Technical)",
        "CSR Practitioners",
        "Government Officials",
        "NGO Leaders",
      ],
      content: {
        "Day 1": "Introduction to CCS",
        "Day 2": "Capture Technologies",
        "Day 3": "Storage and Transportation",
        "Day 4": "Economic and Financial Aspects",
        "Day 5": "Social and Ethical Considerations",
      },
      link: "#",
    },
    {
      index: 3,
      peopleEnrolled: 22,
      duration: 5,
      certified: true,
      trainingTitle: "Green & Sustainable Logistics",
      trainingDescription:
        "This course addresses the challenges and opportunities in making supply chains sustainable and climate-neutral.",
      goals: [
        "Understand risk management in logistics.",
        "Learn circular supply chain best practices.",
        "Develop sourcing strategies.",
        "Improve visibility with IT.",
        "Create performance management programs.",
      ],
      targetAudience: [
        "Warehouse and Distribution Professionals.",
        "Procurement, Buyers, and Purchasing Professionals",
        "Production and Manufacturing Professionals",
        "Logistics Professionals",
      ],
      content: {
        "Day 1": "The Green Imperative",
        "Day 2": "Current Supply Chain Problems",
        "Day 3": "Digital Supply Chains",
        "Day 4": "Risk Management",
        "Day 5": "Transitioning to Sustainability",
      },
      link: "#",
    },
    {
      index: 4,
      peopleEnrolled: 22,
      duration: 3,
      certified: true,
      trainingTitle: "Life Cycle Assessment 101",
      trainingDescription:
        "This course introduces methods for analyzing the environmental and resource impacts of energy systems and products, focusing on life cycle assessments (LCA) and external costs.",
      goals: [
        "Assess environmental and resource profiles using LCA methodologies.",
        "Understand environmental burdens of waste and energy systems.",
        "Gain knowledge on managing energy resources and waste.",
      ],
      targetAudience: [
        "Environmental Management",
        "Sustainability Management",
        "Corporate Social Responsibility",
        "Energy and Utilities",
        "Climate Change Management",
        "Carbon Management",
        "Business Operations and Strategy",
      ],
      content: {
        "Day 1": "Introduction to Environmental and Resource Impact Analysis",
        "Day 2": "Life Cycle Assessment (LCA) Methods and Emissions",
        "Day 3": "Applications and Future Trends of LCA",
      },
      link: "#",
    },
  ];

  const card2 = {
    title: "Empower Your Business with Efficient Training Courses",
    description1:
      "At Carbon Jar, we provide professional training to enhance your team’s knowledge and skills. Our courses help teams gain an in-depth understanding of various standards that empower businesses. Through efficient training in effective implementation practices, auditing, and structured frameworks, we enable businesses to achieve their goals and improve staff efficiency. We offer In-House Training, Public Training, and Live Online Training to achieve process and operational excellence.",
    Maindescription: "Why Choose Our Corporate Training Programs?",
    description: (
      <div className="">
        <div className="flex items-start">
          <span className="text-lg mr-2">•</span>
          <span className="underline">Onsite Training:</span>
          <span className="ml-1">80% more cost-effective for companies.</span>
        </div>
        <div className="flex items-start">
          <span className="text-lg mr-2">•</span>
          <span className="underline">Employee Development:</span>
          <span className="ml-1">
            68% of workers say that training and development is the most
            important workplace policy.
          </span>
        </div>
      </div>
    ),
    icon: "/images/icons/University.svg",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px", amount: 0.1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <section className="lg:px-8 px-2 lg:mt-8 mb-8 rounded-lg">
          <div className="container lg:px-8 px-2 mx-auto">
            <BigCard2
              title={card2.title}
              description={card2.description}
              Maindescription={card2.Maindescription}
              icon={card2.icon}
              description1={card2.description1}
            />
          </div>
        </section>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px", amount: 0.1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        <section className="flex flex-col bg-green lg:p-12 p-6 lg:mt-8 mt-6">
          <SmallerH1 className="text-white-light">
            Featured Corporate Training Courses
          </SmallerH1>
          <br />
          <H2 className="text-white-light">
            Enhance your team’s expertise, drive operational efficiency, and
            achieve your sustainability goals with our specialized training
            programs.
          </H2>

          {Courses.map((course) => (
            <CourseCard key={course.index} {...course} />
          ))}

          <br />
          <SmallerH1 className="text-white-light">
            Ready to make a difference?
          </SmallerH1>
          <br />
          <H2 className="text-white-light">
            Join us now and start your journey towards sustainability!
          </H2>

          <div className="mt-8 mb-8 flex justify-center items-center w-full mx-auto">
            <Button>
              Get started now
              <IoIosArrowForward />
            </Button>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default CorporateTrainings;
