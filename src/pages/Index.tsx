
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Copy, Check } from 'lucide-react';
import EmotionalBodyMapper from '@/components/EmotionalBodyMapper';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  
  const roomId = searchParams.get('room');

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createRoom = () => {
    const newRoomId = generateRoomId();
    navigate(`/?room=${newRoomId}`);
  };

  const joinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/?room=${joinRoomId.trim()}`);
    }
  };

  const copyRoomLink = async () => {
    if (roomId) {
      const url = `${window.location.origin}/?room=${roomId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If we have a room ID, show the game
  if (roomId) {
    return (
      <div className="relative">
        {/* Room info bar */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Room: {roomId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomLink}
                className="bg-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share Room'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="bg-white"
              >
                Leave Room
              </Button>
            </div>
          </div>
        </div>
        
        <EmotionalBodyMapper roomId={roomId} />
      </div>
    );
  }

  // Show room selection interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Body Mapping Game</h1>
          <p className="text-lg text-gray-600">
            Play solo or collaborate with others in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Room</span>
              </CardTitle>
              <CardDescription>
                Start a new collaborative session and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createRoom} className="w-full bg-green-500 hover:bg-green-600">
                Create Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Join Existing Room</span>
              </CardTitle>
              <CardDescription>
                Enter a room ID to join an existing session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
              <Button 
                onClick={joinRoom} 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={!joinRoomId.trim()}
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Solo Play */}
        <Card>
          <CardHeader>
            <CardTitle>Play Solo</CardTitle>
            <CardDescription>
              Practice on your own without multiplayer features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionalBodyMapper roomId={null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
