export interface Offering {
  id: string;
  title: string;
  description: string;
  duration: string;
  single_price: number;
  package_5_price: number;
  package_10_price: number;
  package_15_price: number;
  image_url?: string;
  upi_id?: string;
  payee_name?: string;
  qr_image_url?: string;
  instructions?: string;
  type?: string;
}

export interface Session {
  id: string;
  offering_id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  cooldown_minutes: number;
  capacity: number;
  booked_count: number;
  meeting_link: string;
  is_active: boolean;
  is_blocked: boolean;
  status: string;
  blocked_reason?: string;
  yoga_offerings?: { title: string };
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
