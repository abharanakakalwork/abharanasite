import { supabaseAdmin } from "@/lib/supabase-admin";
import DynamicPageClient from "@/app/components/DynamicPageClient";

export async function generateMetadata() {
  return { title: 'Terms & Conditions | Abharana Kakal' };
}

export default async function TermsConditionsPage() {
  const { data } = await supabaseAdmin
    .from('pages')
    .select('title, content')
    .eq('slug', 'terms-conditions')
    .single();

  if (!data) {
    return (
      <DynamicPageClient 
        title="Terms & Conditions" 
        content={`
          <p>Welcome to Abharana Kakal. By accessing this website and booking our services, you agree to the following terms:</p>
          
          <h2>1. Booking & Payments</h2>
          <p>All bookings for retreats and sessions are confirmed only upon receipt of the full payment or the specified deposit. We use Razorpay as our primary secure payment gateway. By using our payment portal, you agree to their terms of service as well.</p>

          <h2>2. Service Scope</h2>
          <p>Abharana Kakal provides spiritual retreats, yoga immersions, and sound healing sessions. These are intended for holistic well-being and do not replace professional medical or psychiatric advice.</p>

          <h2>3. Taxes & Fees</h2>
          <p>A 18% GST (Goods and Services Tax) is included in the total immersion fee where applicable. Service fees and platform charges are non-refundable.</p>

          <h2>4. Liability</h2>
          <p>Participants are responsible for their own health and well-being during physical practices and journeys. Abharana Kakal is not liable for injuries or loss of personal property during retreats.</p>

          <h2>5. Customary Guidelines</h2>
          <p>We maintain a sacred space environment. Respect for the venue, instructors, and fellow participants is mandatory. Failure to adhere to community guidelines may result in removal without refund.</p>
        `} 
      />
    );
  }

  return <DynamicPageClient title={data.title} content={data.content} />;
}
