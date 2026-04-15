"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { validateEmail, validatePhone } from "@/lib/utils";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Yoga",
    message: ""
  });
  const [errors, setErrors] = useState({
    email: false,
    phone: false
  });
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = !formData.phone || validatePhone(formData.phone); // Phone optional in schema? No, but let's check.

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isEmailValid) {
        setErrors(prev => ({ ...prev, email: true }));
        toast.error("Please enter a valid email address.");
        return;
    }

    if (formData.phone && !isPhoneValid) {
        setErrors(prev => ({ ...prev, phone: true }));
        toast.error("Please enter a valid phone number.");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Enquiry sent successfully! I'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          interest: "Yoga",
          message: ""
        });
      } else {
        throw new Error(data.error || "Failed to send enquiry");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={containerRef}
      style={{ position: "relative" }}
      className="py-24 md:py-20 px-6 overflow-hidden bg-[#fffdf8] paper-grain"
    >
      {/* Large background watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[30rem] font-serif text-[#bc6746]/5 pointer-events-none select-none z-0">
        INVITATION
      </div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-8">
        {/* Column 1: The Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[38%] flex flex-col items-start"
        >
          <div className="soft-glass p-8 md:p-12 rounded-[50px] shadow-2xl space-y-10 border border-white/40 w-full bg-white/40 backdrop-blur-md">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif text-[#a55a3d] leading-tight tracking-tight">
                Send a <br />
                <span className="text-[#bc6746] italic font-light">
                  Message
                </span>
              </h2>
              <p className="text-base md:text-lg font-light text-[#4a3b32]/60 italic leading-relaxed">
                Whether you’re exploring yoga, sound healing, or From Within,
                you’re welcome to connect.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#bc6746]/60 pl-4">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your Name"
                  className="w-full px-8 py-4 rounded-full bg-white/50 border border-[#f1e4da] text-[#4a3b32] placeholder-[#4a3b32]/30 focus:outline-none focus:border-[#bc6746] hover:border-[#bc6746]/40 transition-all text-base font-light"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    className={`text-[10px] uppercase tracking-[0.3em] font-bold pl-4 ${errors.email ? "text-red-500" : "text-[#bc6746]/60"}`}
                  >
                    Email {errors.email && "- Invalid Format"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: false });
                    }}
                    onBlur={() =>
                      setErrors((prev) => ({
                        ...prev,
                        email: !validateEmail(formData.email),
                      }))
                    }
                    placeholder="hello@domain.com"
                    className={`w-full px-8 py-4 rounded-full bg-white/50 border ${errors.email ? "border-red-500 focus:border-red-600" : "border-[#f1e4da] focus:border-[#bc6746]"} text-[#4a3b32] placeholder-[#4a3b32]/30 focus:outline-none hover:border-[#bc6746]/40 transition-all text-base font-light`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className={`text-[10px] uppercase tracking-[0.3em] font-bold pl-4 ${errors.phone ? "text-red-500" : "text-[#bc6746]/60"}`}
                  >
                    Phone {errors.phone && "- Invalid"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: false });
                    }}
                    onBlur={() => {
                      if (formData.phone) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: !validatePhone(formData.phone),
                        }));
                      }
                    }}
                    placeholder="+91 00000 00000"
                    className={`w-full px-8 py-4 rounded-full bg-white/50 border ${errors.phone ? "border-red-500 focus:border-red-600" : "border-[#f1e4da] focus:border-[#bc6746]"} text-[#4a3b32] placeholder-[#4a3b32]/30 focus:outline-none hover:border-[#bc6746]/40 transition-all text-base font-light`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#bc6746]/60 pl-4">
                  Interest
                </label>
                <div className="relative">
                  <select
                    value={formData.interest}
                    onChange={(e) =>
                      setFormData({ ...formData, interest: e.target.value })
                    }
                    className="w-full px-8 py-4 rounded-full bg-white/50 border border-[#f1e4da] text-[#4a3b32] focus:outline-none focus:border-[#bc6746] hover:border-[#bc6746]/40 transition-all text-base font-light appearance-none italic cursor-pointer"
                  >
                    <option value={""}>Select Interest</option>
                    <option value={"online-yoga-classes"}>Online Yoga Classes</option>
                    <option value={"group-classes"}>Group Classes</option>
                    <option value={"retreats"}>Retreats</option>
                    <option value={"corporate-enquiry"}>Corporate Enquiry</option>
                    <option value={"collaboration"}>Collaboration</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-[#bc6746]/60">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#bc6746]/60 pl-4">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="How can I support your journey?"
                  className="w-full px-8 py-5 rounded-[30px] bg-white/50 border border-[#f1e4da] text-[#4a3b32] placeholder-[#4a3b32]/30 focus:outline-none focus:border-[#bc6746] hover:border-[#bc6746]/40 transition-all text-base font-light resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-full bg-[#bc6746] text-[#FFFDF8] uppercase tracking-[0.2em] text-xs font-semibold hover:bg-[#a55a3d] transition-all hover:shadow-[0_20px_40px_rgba(188,103,70,0.25)] flex items-center justify-center group ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && (
                  <div className="ml-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Column 2: The Visual Anchor (Breath) */}
        <div className="hidden lg:flex w-[24%] relative">
          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative w-full h-[800px] rounded-[100px] overflow-hidden shadow-2xl border border-white/40"
          >
            <Image
              src="https://abharanakakal.b-cdn.net/assets/sh-retreat-intro.png"
              alt="Sacred Forest"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#bc6746]/30 via-transparent to-transparent mix-blend-soft-light" />
          </motion.div>
        </div>

        {/* Column 3: Info & Presence */}
        <div className="w-full lg:w-[38%] flex flex-col gap-12 pt-8 lg:pt-0">
          {[
            {
              id: "email",
              label: "Email",
              value: "yoga@abharanakakal.com",
              sub: "Responsive within 24 hours",
              icon: <Mail strokeWidth={1} size={30} />,
              link: "mailto:yoga@abharanakakal.com",
            },
            {
              id: "loc",
              label: "Based In",
              value: "Bangalore / Mysore",
              sub: "Available online and offline",
              icon: <MapPin strokeWidth={1} size={30} />,
            },
            {
              id: "social",
              label: "Connect",
              value: "Instagram",
              sub: "Daily Presence & Awareness",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              ),
              link: "https://www.instagram.com/abharana_kakal/",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, delay: 0.3 + idx * 0.1 }}
              onClick={() => item.link && window.open(item.link, "_blank")}
              className={`flex flex-col items-start gap-6 group ${item.link ? "cursor-pointer" : ""} soft-glass p-8 rounded-[40px] border border-white/20 bg-white/20 hover:bg-white/40 transition-all duration-700`}
            >
              <div className="w-14 h-14 rounded-full bg-[#f1e4da]/40 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-700">
                {item.icon}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#bc6746]/60 font-bold mb-2 block">
                  {item.label}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif text-[#a55a3d] group-hover:text-[#bc6746] transition-colors">
                  {item.value}
                </h3>
                <p className="text-sm md:text-base font-light text-[#4a3b32]/60 italic mt-2">
                  {item.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
