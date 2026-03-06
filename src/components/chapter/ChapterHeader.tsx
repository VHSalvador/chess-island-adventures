import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { STEPS, STEP_LABELS } from './constants';

interface ChapterHeaderProps {
  title: string;
  currentStep: number;
  onBack: () => void;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({ title, currentStep, onBack }) => (
  <div className="max-w-2xl mx-auto mb-4">
    <div className="flex items-center justify-between mb-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="font-display text-white hover:text-white hover:bg-white/20"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
      </Button>
      <span className="font-display text-white">{title}</span>
    </div>
    <div className="flex gap-1">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`flex-1 h-2 rounded-full transition-all ${
            i < currentStep ? 'bg-yellow-400' : i === currentStep ? 'bg-white' : 'bg-white/20'
          }`}
        />
      ))}
    </div>
    <div className="flex justify-between mt-1">
      {STEPS.map((s, i) => (
        <span
          key={s}
          className={`text-xs ${
            i < currentStep ? 'text-white' : i === currentStep ? 'text-white font-bold' : 'text-white/50'
          }`}
        >
          {STEP_LABELS[s]}
        </span>
      ))}
    </div>
  </div>
);
