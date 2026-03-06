import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ChapterNavigationProps {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ currentStep, onPrev, onNext }) => (
  <div className="flex gap-3 mt-4">
    {currentStep > 0 && (
      <Button
        onClick={onPrev}
        variant="outline"
        className="flex-1 child-button bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Előző
      </Button>
    )}
    <Button
      onClick={onNext}
      className="flex-1 child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
    >
      Következő <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  </div>
);
