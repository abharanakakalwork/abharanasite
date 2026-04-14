import React from 'react';
import Image from 'next/image';

interface BlockData {
  type: string;
  data: any;
}

interface BlockRendererProps {
  content: string | any;
  theme?: 'light' | 'dark';
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ content, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const primaryText = isLight ? 'text-[#4a3b32]' : 'text-[#f1e4da]';
  const mutedText = isLight ? 'text-[#4a3b32]/80' : 'text-[#f1e4da]/80';
  const captionText = isLight ? 'text-[#4a3b32]/50' : 'text-[#f1e4da]/50';
  const quoteBg = isLight ? 'bg-[#bc6746]/5 border-[#bc6746]/10' : 'bg-[#fffdf8]/8 border-[#fffdf8]/10';

  if (!content) return null;

  let blocks: BlockData[] = [];

  try {
    // If it's already an object (parsed), use it
    if (typeof content === 'object' && content.blocks) {
      blocks = content.blocks;
    } else if (typeof content === 'string') {
      const parsed = JSON.parse(content);
      blocks = parsed.blocks || [];
    }
  } catch (e) {
    // Fallback for legacy plain text or structured data
    if (typeof content === 'string') {
      return <p className={`${mutedText} text-base md:text-lg leading-loose mb-6`}>{content}</p>;
    }
    return null;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const level = block.data.level || 2;
            const headerClasses = {
              1: `text-3xl md:text-5xl font-serif ${primaryText} mb-6 tracking-wide`,
              2: `text-2xl md:text-3xl font-serif ${primaryText} mb-5 tracking-wide`,
              3: `text-xl md:text-2xl font-serif ${primaryText} mb-4 tracking-wide`,
              4: `text-lg md:text-xl font-serif ${primaryText} mb-3 tracking-wide`,
            };
            const className = (headerClasses as any)[level] || headerClasses[2];
            
            if (level === 1) return <h1 key={index} className={className} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            if (level === 3) return <h3 key={index} className={className} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            if (level === 4) return <h4 key={index} className={className} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            return <h2 key={index} className={className} dangerouslySetInnerHTML={{ __html: block.data.text }} />;

          case 'paragraph':
            return (
              <p 
                key={index} 
                className={`${mutedText} text-base md:text-lg leading-loose transition-all duration-300`}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );

          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index} className={`space-y-3 ${ListTag === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 ${mutedText} text-base md:text-lg transition-all duration-300`}>
                {block.data.items.map((item: any, i: number) => {
                  const content = typeof item === 'string' ? item : (item.content || '');
                  return <li key={i} dangerouslySetInnerHTML={{ __html: content }} />;
                })}
              </ListTag>
            );

          case 'checklist':
            return (
              <div key={index} className="space-y-3">
                {block.data.items.map((item: any, i: number) => (
                  <div key={i} className={`flex items-start gap-3 ${mutedText} text-base md:text-lg`}>
                    <div className={`mt-1.5 w-4 h-4 rounded border ${item.checked ? 'bg-[#bc6746] border-[#bc6746]' : 'border-[#bc6746]/40'} flex-shrink-0 flex items-center justify-center`}>
                      {item.checked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: item.text }} />
                  </div>
                ))}
              </div>
            );

          case 'quote':
            return (
              <blockquote key={index} className="relative my-12 px-10 py-10 rounded-2xl overflow-hidden">
                <div className={`absolute inset-0 ${quoteBg} backdrop-blur-md rounded-2xl`} />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-bottom from-[#bc6746] to-transparent" />
                <span className="absolute top-4 left-6 font-serif text-7xl leading-none opacity-15 text-[#bc6746] select-none">&ldquo;</span>
                <div className="relative z-10">
                  <p className={`font-serif text-xl md:text-2xl ${isLight ? 'text-[#4a3b32]' : 'text-[#FFFDF8]/95'} italic leading-relaxed text-center`} dangerouslySetInnerHTML={{ __html: block.data.text }} />
                  {block.data.caption && (
                    <cite className={`block mt-4 text-center ${captionText} text-sm uppercase tracking-widest not-italic`} dangerouslySetInnerHTML={{ __html: block.data.caption }} />
                  )}
                </div>
              </blockquote>
            );

          case 'image':
            return (
              <figure key={index} className="my-10 space-y-3">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <Image 
                    src={block.data.file.url} 
                    alt={block.data.caption || 'Within Image'} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                    className="object-cover"
                  />
                  {block.data.stretched && <div className={`absolute inset-0 ring-1 ring-inset ${isLight ? 'ring-black/5' : 'ring-white/20'}`} />}
                </div>
                {block.data.caption && (
                  <figcaption className={`text-center ${captionText} text-xs italic tracking-wide`} dangerouslySetInnerHTML={{ __html: block.data.caption }} />
                )}
              </figure>
            );

          case 'delimiter':
            return (
              <div key={index} className="flex items-center justify-center py-10 opacity-30 gap-3">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#bc6746]" />)}
              </div>
            );

          default:
            console.warn(`Unknown block type: ${block.type}`);
            return null;
        }
      })}
    </div>
  );
};

export default BlockRenderer;
