// components/AdminPanel/TabsNav.tsx
import React from 'react';
import { TabsNavProps } from './types';

export const TabsNav: React.FC<TabsNavProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap border-b-2 border-gray-200 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 font-medium transition-colors text-sm whitespace-nowrap
            ${activeTab === tab.id ? `border-b-2 ${tab.accent} ${tab.active}` : 'text-gray-500 hover:text-gray-700'}`}
        >
          {tab.label}
          <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white ${activeTab === tab.id ? 'bg-gray-700' : 'bg-gray-400'}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};