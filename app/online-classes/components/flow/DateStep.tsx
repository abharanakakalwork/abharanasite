"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/Calendar";

interface DateStepProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  availabilityData: { sessions: any[]; exceptions: any[] };
}

const DateStep: React.FC<DateStepProps> = ({ selectedDate, onSelect, availabilityData }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto px-4"
    >
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif text-[#4a3b32] mb-3">Select a Date</h3>
        <p className="text-[#a55a3d]/60 text-sm">Choose a day that aligns with your practice schedule.</p>
      </div>
      
      <Calendar 
        selectedDate={selectedDate}
        onDateSelect={onSelect}
        availabilityData={availabilityData}
      />
    </motion.div>
  );
};

export default DateStep;
