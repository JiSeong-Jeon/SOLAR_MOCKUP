import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface HelpButtonProps {
  title: string;
  content: string | React.ReactNode;
}

export function HelpButton({ title, content }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 hover:bg-[#3751FF]/10 text-neutral-500 hover:text-[#3751FF] transition-colors flex-shrink-0"
        aria-label="도움말"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="text-sm text-neutral-600 space-y-3">
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
