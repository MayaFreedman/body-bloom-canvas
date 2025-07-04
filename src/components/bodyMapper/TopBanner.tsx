
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';

interface TopBannerProps {
  isConnected: boolean;
  isConnecting: boolean;
  playerCount: number;
  currentPlayerId: string;
  playerColor: string;
}

export const TopBanner = ({ isConnected, isConnecting, playerCount, currentPlayerId, playerColor }: TopBannerProps) => {
  return (
    <div id="topBanner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>Body Mapping Game</h2>
        <ConnectionStatus 
          isConnected={isConnected} 
          isConnecting={isConnecting} 
        />
      </div>
      <p>
        Collaborate with others to identify, express, and understand emotions and how they show up in your bodies.
      </p>
    </div>
  );
};
