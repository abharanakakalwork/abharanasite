import { supabaseAdmin } from "@/lib/supabase-admin";
import DownloadsClient from "@/app/components/DownloadsClient";

export async function generateMetadata() {
  return { title: 'Downloads | Abharana Kakal' };
}

// Ensure the page fetches dynamic content correctly
export const revalidate = 60; // optionally revalidate every minute, or 0 if completely dynamic

export default async function DownloadsPage() {
  const { data } = await supabaseAdmin
    .from('downloads')
    .select('*')
    .order('created_at', { ascending: false });

  return <DownloadsClient downloads={data || []} />;
}
