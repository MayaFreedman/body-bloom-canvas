import React, { useState, useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { HexColorPicker } from 'react-colorful';
import * as THREE from 'three';
import { state } from '@/lib/state';
import { useThree } from '@react-three/fiber';
import * as lucideIcons from 'lucide-react';
import { Circle } from 'lucide-react';
import { Zap } from 'lucide-react';
import { Thermometer } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface SensationMark {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
}

const EmotionalBodyMapper: React.FC = () => {
  const snap = useSnapshot(state);
  const [selectedSensation, setSelectedSensation] = useState<string | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isAddingSensation, setIsAddingSensation] = useState(false);
  const { scene } = useThree();

  const handleSensationClick = (sensationId: string) => {
    if (selectedSensation === sensationId) {
      setSelectedSensation(null);
      setColorPickerVisible(false);
    } else {
      setSelectedSensation(sensationId);
      setColorPickerVisible(true);
      setSelectedColor(snap.sensationMarks.find(mark => mark.id === sensationId)?.color || '#ffffff');
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedSensation) {
      state.sensationMarks = state.sensationMarks.map(mark =>
        mark.id === selectedSensation ? { ...mark, color: color } : mark
      );
    }
  };

  const handleBodyPartClick = useCallback((event: THREE.IntersectionEvent<MouseEvent>) => {
    if (!isAddingSensation) return;

    const point = event.point;
    if (selectedSensation) {
      const newSensationMark: SensationMark = {
        id: selectedSensation,
        position: new THREE.Vector3(point.x, point.y, point.z),
        icon: sensationTypes.find(sensation => sensation.id === selectedSensation)?.icon || 'Circle',
        color: selectedColor,
        size: 1,
      };

      state.sensationMarks = [...snap.sensationMarks, newSensationMark];
      setIsAddingSensation(false);
      setSelectedSensation(null);
    }
  }, [isAddingSensation, selectedSensation, selectedColor, snap.sensationMarks]);

  const toggleAddingSensation = (sensationId: string) => {
    if (isAddingSensation && selectedSensation === sensationId) {
      setIsAddingSensation(false);
      setSelectedSensation(null);
    } else {
      setIsAddingSensation(true);
      setSelectedSensation(sensationId);
    }
  };

  const sensationTypes = [
    { id: 'nerves', icon: 'butterfly', label: 'Nerves' },
    { id: 'vibration', icon: 'Zap', label: 'Vibration' },
    { id: 'pressure', icon: 'Circle', label: 'Pressure' },
    { id: 'temperature', icon: 'Thermometer', label: 'Temperature' },
    { id: 'pain', icon: 'AlertTriangle', label: 'Pain' },
    { id: 'tingling', icon: 'Sparkles', label: 'Tingling' },
  ];

  const renderSensationIcon = (iconType: string) => {
    if (iconType === 'butterfly') {
      return (
        <img 
          src="/lovable-uploads/701bd2f6-2495-45e8-85c8-636f1442c7eb.png" 
          alt="Butterfly" 
          className="w-4 h-4"
        />
      );
    }
    
    const IconComponent = lucideIcons[iconType as keyof typeof lucideIcons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-4 left-4 bg-white p-4 rounded-md shadow-md z-50">
        <h2 className="text-lg font-semibold mb-2">Sensation Types</h2>
        <div className="flex flex-col gap-2">
          {sensationTypes.map((sensation) => (
            <button
              key={sensation.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${selectedSensation === sensation.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
                }`}
              onClick={() => toggleAddingSensation(sensation.id)}
            >
              {renderSensationIcon(sensation.icon)}
              {sensation.label}
            </button>
          ))}
        </div>
        {colorPickerVisible && (
          <div className="mt-4">
            <HexColorPicker color={selectedColor} onChange={handleColorChange} />
          </div>
        )}
      </div>
      <mesh
        onClick={handleBodyPartClick}
      >
        <meshStandardMaterial attach="material" visible={false} />
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
    </div>
  );
};

export default EmotionalBodyMapper;
