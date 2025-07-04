
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import EmotionalBodyMapper from '@/components/EmotionalBodyMapper';

const Index = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');

  return <EmotionalBodyMapper roomId={roomId} />;
};

export default Index;
