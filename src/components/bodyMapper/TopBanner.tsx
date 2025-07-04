
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';

interface TopBannerProps {
  roomId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const TopBanner = ({ roomId, isConnected, isConnecting }: TopBannerProps) => {
  return (
    <div id="topBanner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>Body Mapping Game</h2>
        {roomId && (
          <ConnectionStatus 
            isConnected={isConnected} 
            isConnecting={isConnecting} 
          />
        )}
      </div>
      <p>
        {roomId 
          ? 'Collaborate with others to identify, express, and understand emotions and how they show up in your bodies.'
          : 'This game helps us identify, express, and understand our emotions and how those emotions show up in our bodies.'
        }
      </p>
    </div>
  );
};
