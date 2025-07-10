
import React from 'react';
import { Heart } from 'lucide-react';

interface TabContainerProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
  children: React.ReactNode;
}

export const TabContainer = ({ activeTab, onTabChange, children }: TabContainerProps) => {
  return (
    <div className="tab-container h-full flex flex-col">
      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'feelings' ? 'active' : ''}`}
          onClick={() => onTabChange('feelings')}
        >
          Color by Feelings
        </button>
        <button 
          className={`tab-button ${activeTab === 'sensations' ? 'active' : ''}`}
          onClick={() => onTabChange('sensations')}
        >
          Body Sensations and Signals
        </button>
      </div>
      {children}
      
      {/* Stylish Footer */}
      <div className="sidebar-footer">
        <Heart className="footer-icon" />
        <span>Made with care</span>
      </div>
    </div>
  );
};
