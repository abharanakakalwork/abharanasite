"use client";

import React, { memo } from "react";
import { Check } from "lucide-react";

interface BookingProgressProps {
  steps: string[];
  currentStep: number;
}

const BookingProgress = memo(function BookingProgress({ steps, currentStep }: BookingProgressProps) {
  return (
    <div className="mb-12 flex justify-between items-center max-w-xl mx-auto px-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 shadow-sm
              ${currentStep >= idx ? 'bg-[#bc6746] text-white ring-4 ring-[#bc6746]/10' : 'bg-[#f1e4da] text-[#bc6746]/40'}`}>
            {currentStep > idx ? <Check className="w-4 h-4" /> : idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-[1px] mx-2 transition-colors duration-500 ${currentStep > idx ? 'bg-[#bc6746]' : 'bg-[#bc6746]/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
});

export default BookingProgress;
