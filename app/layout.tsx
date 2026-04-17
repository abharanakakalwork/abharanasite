import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "./components/NavbarWrapper";
import Footer from "./components/Footer";
import Script from "next/script";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LenisProvider from "./components/LenisProvider";
import ImageProtection from "./components/ImageProtection";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abharana-kakal.com"),
  title: "Online Yoga Classes | Abharana Kakal - 20 Years of experience",
  description: "Join personalised online yoga classes with Abharana Kakal, an experienced online yoga teacher offering holistic wellness and feminine awakening programs worldwide.",
  openGraph: {
    images: ['https://abharanakakal.b-cdn.net/assets/bg-images.webp'],
    type: 'website',
    siteName: 'Abharana Kakal',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://abharanakakal.b-cdn.net/assets/bg-images.webp'],
  },
  icons: {
    icon: 'https://abharanakakal.b-cdn.net/assets/Asset%202Abharana%20Kakal%20-%20monogram%20only.png',
  },
};

import { AudioProvider } from "@/context/AudioContext";
import { StudentAuthProvider } from "@/hooks/useStudentAuth";
import StudentAuthModal from "@/components/auth/StudentAuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoSlab.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${process.env.NODE_ENV === 'production' ? 'production-mode' : ''}`} cz-shortcut-listen="true">
        <StudentAuthProvider>
          <StudentAuthModal />
          <AudioProvider>
            <LenisProvider>
              <NavbarWrapper>{children}</NavbarWrapper>
              <Footer />
              <ToastContainer
                position="bottom-right"
                theme="light"
                toastStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)', 
                  border: '1px solid #f1e4da', 
                  borderRadius: '20px',
                  color: '#4a3b32',
                  fontFamily: 'inherit'
                }}
              />
              <ImageProtection />
              <Script id="chatbase-script" strategy="afterInteractive">
                {`
                  (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="df9Ij5N_aJDFR-rXbuldG";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
                `}
              </Script>
            </LenisProvider>
          </AudioProvider>
        </StudentAuthProvider>
      </body>
    </html>
  );
}
 
