import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TextMark } from '@/types/textTypes';

interface TextEditorProps {
  isOpen: boolean;
  textMark?: TextMark;
  onSave: (text: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const TextEditor = ({
  isOpen,
  textMark,
  onSave,
  onCancel,
  onDelete
}: TextEditorProps) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (textMark) {
      setText(textMark.text);
    } else {
      setText('');
    }
  }, [textMark]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {textMark ? 'Edit Text' : 'Add Text'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text here..."
            className="min-h-[100px] resize-none"
            autoFocus
          />
          
          <div className="flex justify-between">
            <div>
              {textMark && onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!text.trim()}>
                {textMark ? 'Save' : 'Add'}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save, Esc to cancel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};