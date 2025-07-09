import React from 'react';

interface BottomBrandProps {
  isConnected?: boolean;
  isConnecting?: boolean;
}

export const BottomBrand = ({ isConnected, isConnecting }: BottomBrandProps) => {
  return (
    <div className="fixed bottom-4 left-4 z-10 flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
        Body Mapping by{' '}
        <img src="/lovable-uploads/924b5d58-1cee-4f88-95a3-4534f584bbaf.png" alt="PlaySpace" className="h-5 object-contain" />
      </div>
      
      {/* Connection status indicator if needed */}
      {(isConnected || isConnecting) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-0">
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected 
                ? 'bg-green-500' 
                : 'bg-yellow-500 animate-pulse'
            }`}
          />
          <span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      )}
    </div>
  );
};