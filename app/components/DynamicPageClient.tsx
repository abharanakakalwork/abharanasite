'use client';

import { motion } from 'framer-motion';
import BlockRenderer from '@/app/within/components/BlockRenderer';

interface DynamicPageClientProps {
  title: string;
  content: string | any;
}

export default function DynamicPageClient({ title, content }: DynamicPageClientProps) {
  return (
    <main className="min-h-screen bg-[#fffdf8] pt-32 pb-20 px-6 paper-grain">
      <div className="max-w-3xl mx-auto prose prose-neutral prose-[#a55a3d]">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4a3b32] tracking-tight">
            {title}
          </h1>
        </motion.div>

        {/* CONTENT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#4a3b32] font-light leading-relaxed"
        >
           {/* If content is an Editor.js object stored as string */}
           {typeof content === 'string' && content.startsWith('{') ? (
              <BlockRenderer content={content} theme="light" />
           ) : typeof content === 'object' && content ? (
              <BlockRenderer content={JSON.stringify(content)} theme="light" />
           ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} className="space-y-6" />
           )}
        </motion.div>
      </div>
    </main>
  );
}
