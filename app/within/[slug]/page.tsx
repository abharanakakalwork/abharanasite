import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/app/within/data";
import WithinDetailClient from "@/app/within/components/WithinDetailClient";

import { supabaseAdmin } from "@/lib/supabase-admin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  
  try {
    const { data: dynamicPost } = await supabaseAdmin
      .from('journal_posts')
      .select('title, content')
      .eq('id', slug)
      .single();
    
    if (dynamicPost) {
      return {
        title: `${dynamicPost.title} | Within | Abharana Kakal`,
        description: 'Exploring the depths of inner awareness through sacred practice...',
      };
    }
  } catch (err) {
    // Fall through
  }

  return { title: 'Within | Abharana Kakal' };
}

export default async function WithinPostPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch post from database
  const { data: dbPost, error } = await supabaseAdmin
    .from('journal_posts')
    .select('*, journal_categories(name)')
    .eq('id', slug)
    .single();

  if (!dbPost || error) notFound();

  const post = {
    slug: dbPost.id,
    title: dbPost.title,
    excerpt: '',
    date: new Date(dbPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    category: (dbPost.journal_categories as any)?.name || 'Wisdom',
    image: dbPost.image_url || '/within-yoga.png',
    readTime: 'Read',
    content: dbPost.content,
  };

  // Find related posts from DB
  const { data: relatedDb } = await supabaseAdmin
    .from('journal_posts')
    .select('id, title, category_id, image_url, created_at, journal_categories(name)')
    .neq('id', slug)
    .limit(2);

  const relatedPosts: any[] = (relatedDb || []).map(rp => ({
    slug: rp.id,
    title: rp.title,
    excerpt: '',
    date: new Date(rp.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    category: (rp.journal_categories as any)?.name || 'Wisdom',
    image: rp.image_url || '/within-yoga.png',
    readTime: 'Read',
    content: ''
  }));

  return (
    <main className="relative min-h-screen overflow-x-hidden text-[#4a3b32] paper-grain">
      {/* Background Image */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="/wellness-practices-self-care-world-health-day.webp"
          alt="Soft nature background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#f1e4da]/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <WithinDetailClient post={post as any} relatedPosts={relatedPosts} />
    </main>
  );
}
