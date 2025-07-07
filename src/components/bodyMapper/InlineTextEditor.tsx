import React, { useState, useRef, useEffect } from 'react';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface InlineTextEditorProps {
  textMark: TextMark;
  onSave: (text: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const InlineTextEditor = ({
  textMark,
  onSave,
  onCancel,
  onDelete
}: InlineTextEditorProps) => {
  const [text, setText] = useState(textMark.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (text.trim()) {
        onSave(text.trim());
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Delete' && e.ctrlKey && onDelete) {
      e.preventDefault();
      onDelete();
    }
  };

  const handleBlur = () => {
    if (text.trim()) {
      onSave(text.trim());
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="absolute z-50 bg-background border border-border rounded px-2 py-1 text-sm min-w-[100px] shadow-lg"
      style={{
        fontFamily: textMark.fontFamily,
        fontSize: `${textMark.fontSize}px`,
        fontWeight: textMark.fontWeight,
        fontStyle: textMark.fontStyle,
        color: textMark.color
      }}
    />
  );
};