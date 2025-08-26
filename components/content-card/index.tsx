import React from 'react';

import { H3 } from '../Heading';

interface ContentCardProps {
  dayTitle: string;
  othertext?: string[];
  topicTitle: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ dayTitle, topicTitle, othertext }) => {
  return (
    <div
      className="bg-green-dark border-opacity-100 m-2 h-full rounded-lg border border-gray-600 p-4 shadow-sm hover:border-green-500 hover:bg-green-900 hover:shadow-xl"
      style={{ transition: 'all 0.3s ease-in-out' }}
    >
      <div className="flex flex-col">
        <H3 className="text-white-light mb-1 text-left font-normal">{dayTitle}</H3>
        <H3 className="text-white-light text-left font-bold lg:text-lg">{topicTitle}</H3>
        {othertext && (
          <ul className="text-white-light mt-2 list-disc pl-5 text-left font-sans">
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
