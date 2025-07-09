import React from 'react';

interface BottomBrandProps {
  isConnected?: boolean;
  isConnecting?: boolean;
}

export const BottomBrand = ({ isConnected, isConnecting }: BottomBrandProps) => {
  return (
    <div className="fixed bottom-4 left-4 z-10 flex flex-col items-start gap-1">
      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
        Body Mapping by{' '}
        <span className="text-foreground font-semibold">Playspace</span>
        <img src="/lovable-uploads/d0039284-c575-4bac-9ce4-36954115fe2c.png" alt="Playspace" className="w-5 h-5" />
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