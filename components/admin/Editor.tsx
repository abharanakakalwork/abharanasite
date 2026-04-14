'use client';

import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  holder?: string;
}

const Editor = ({ data, onChange, holder = 'editorjs' }: EditorProps) => {
  const ejInstance = useRef<EditorJS | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      initEditor();
      isInitialized.current = true;
    }

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, []);

  const initEditor = async () => {
    // Dynamically import plugins for client-side only
    const Header = (await import('@editorjs/header')).default;
    const List = (await import('@editorjs/list')).default;
    const Quote = (await import('@editorjs/quote')).default;
    const Delimiter = (await import('@editorjs/delimiter')).default;
    const Checklist = (await import('@editorjs/checklist')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;
    const { mediaService } = await import('@/lib/api/client');

    const editor = new EditorJS({
      holder: holder,
      data: data,
      onReady: () => {
        ejInstance.current = editor;
      },
      onChange: async () => {
        const content = await editor.save();
        onChange(content);
      },
      autofocus: true,
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: ['link'],
          config: {
            placeholder: 'Enter a heading',
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List as any,
          inlineToolbar: true,
        },
        checklist: {
          class: Checklist as any,
          inlineToolbar: true,
        },
        quote: {
          class: Quote as any,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Author',
          },
        },
        delimiter: Delimiter as any,
        linkTool: {
          class: LinkTool as any,
          config: {
            endpoint: '/api/media/fetch-url', 
          }
        },
        inlineCode: InlineCode as any,
        image: {
          class: ImageTool as any,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                try {
                  const res = await mediaService.upload(file, 'within');
                  if (res.data.success) {
                    return {
                      success: 1,
                      file: {
                        url: res.data.url,
                      },
                    };
                  }
                } catch (err) {
                  console.error('Editor.js image upload failed:', err);
                }
                return { success: 0 };
              },
            },
          },
        },
      },
    });
  };

  return (
    <div id={holder} className="prose prose-stone max-w-none min-h-[300px] bg-white rounded-2xl border border-[#f1e4da] p-6 focus-within:border-[#bc6746] transition-all overflow-hidden" />
  );
};

export default Editor;
