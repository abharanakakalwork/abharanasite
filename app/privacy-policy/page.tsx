import { supabaseAdmin } from "@/lib/supabase-admin";
import DynamicPageClient from "@/app/components/DynamicPageClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {

  return { title: 'Privacy Policy | Abharana Kakal' };
}

export default async function PrivacyPolicyPage() {
  const { data } = await supabaseAdmin
    .from('pages')
    .select('title, content')
    .eq('slug', 'privacy-policy')
    .single();

  if (!data) {
    return (
      <DynamicPageClient 
        title="Privacy Policy" 
        content={`
          <p>Your privacy is sacred to us. This policy describes how Abharana Kakal collects and handles your information.</p>
          
          <h2>1. Data Collection</h2>
          <p>We collect information you provide directly to us when you book a retreat, enroll in a class, or contact us. This includes name, email, phone number, and health interests (optional).</p>

          <h2>2. Payment Information</h2>
          <p>All payments are processed via Razorpay. We do not store your credit card or sensitive financial data on our servers. Razorpay's privacy policy governs their handling of your payment data.</p>

          <h2>3. Usage of Information</h2>
          <p>We use your data to confirm bookings, send session reminders, and with your consent, share updates about future immersions. We never sell your data to third parties.</p>

          <h2>4. Cookies & Analytics</h2>
          <p>We use minimal cookies to ensure the website functions smoothly and to understand how visitors interact with our offerings to improve the experience.</p>

          <h2>5. Your Rights</h2>
          <p>You can request to view, edit, or delete your personal data at any time by contacting us at hi@abharanakakal.com.</p>
        `} 
      />
    );
  }

  return <DynamicPageClient title={data.title} content={data.content} />;
}
