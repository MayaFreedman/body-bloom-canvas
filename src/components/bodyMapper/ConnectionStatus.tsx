
import React from 'react';
import { Users } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
}

export const ConnectionStatus = ({ isConnected, isConnecting }: ConnectionStatusProps) => {
  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnected) return '#4ade80';
    if (isConnecting) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
      padding: '4px 12px', 
      borderRadius: '20px', 
      marginTop: '4px' 
    }}>
      <Users style={{ width: '16px', height: '16px' }} />
      <span style={{ fontSize: '14px' }}>
        {getStatusText()}
      </span>
      <div style={{
        width: '8px', 
        height: '8px', 
        borderRadius: '50%',
        backgroundColor: getStatusColor()
      }} />
    </div>
  );
};
