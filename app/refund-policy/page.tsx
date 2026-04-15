import { supabaseAdmin } from "@/lib/supabase-admin";
import DynamicPageClient from "@/app/components/DynamicPageClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {

  return { title: 'Refund Policy | Abharana Kakal' };
}

export default async function RefundPolicyPage() {
  const { data } = await supabaseAdmin
    .from('pages')
    .select('title, content')
    .eq('slug', 'refund-policy')
    .single();

  if (!data) {
    return (
      <DynamicPageClient 
        title="Refund & Cancellation Policy" 
        content={`
          <h2>Retreats & Immersions</h2>
          <p>Due to the intimate nature and logistical commitments of our retreats, the following cancellation policy applies:</p>
          <ul>
            <li><strong>Cancellations 60+ days before:</strong> 90% refund of the total fee.</li>
            <li><strong>Cancellations 30-60 days before:</strong> 50% refund of the total fee.</li>
            <li><strong>Cancellations less than 30 days before:</strong> No refund possible, though you may transfer your spot to another individual (subject to approval).</li>
          </ul>

          <h2>Online Classes & Sessions</h2>
          <ul>
            <li>Cancellations made 24 hours before the session are eligible for a full credit or reschedule.</li>
            <li>No-shows or cancellations within 24 hours are non-refundable.</li>
          </ul>

          <h2>General Terms</h2>
          <p>All refunds will be processed via the original payment method (Razorpay or Bank Transfer) within 7-10 business days. Transaction fees or GST already remitted to the government may be non-refundable.</p>
          <p>For any refund requests, please contact us at <strong>yoga@abharanakakal.com</strong>.</p>
        `} 
      />
    );
  }

  return <DynamicPageClient title={data.title} content={data.content} />;
}
