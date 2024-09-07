import React, { useState, ReactNode } from 'react';
import { Button } from './ui/button';

interface TabProps {
  tabs: { label: string; content: ReactNode }[];
  className?: string; // Adiciona a prop className
}

const Tab: React.FC<TabProps> = ({ tabs, className }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={className}>
      <div className="inline-flex rounded-md border border-gray-200 p-1 mb-2">
        {tabs.map((tab, index) => (
          <Button
            variant='ghost'
            key={index}
            onClick={() => setActiveTab(index)}
            className={`text-gray-700 font-medium text-sm ${activeTab === index ? 'bg-gray-100' : ''}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="tab-content mt-2">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tab;
