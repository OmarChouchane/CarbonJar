import React from "react";
import { H3 } from "../Heading";

interface ContentCardProps {
  dayTitle: string;
  othertext?: string[];
  topicTitle: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  dayTitle,
  topicTitle,
  othertext,
}) => {
  return (
    <div className="bg-green-dark border border-white border-opacity-30 p-4 m-2 rounded-lg shadow-sm h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col">
        <H3 className="text-white-light text-left font-normal mb-1">
          {dayTitle}
        </H3>
        <H3 className="text-white-light text-left font-bold lg:text-lg">
          {topicTitle}
        </H3>
        {othertext && (
          <ul className="list-disc pl-5 mt-2 text-white-light text-left font-sans">
            {othertext.map((item, index) => (
              <li key={index} className="mb-2">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
