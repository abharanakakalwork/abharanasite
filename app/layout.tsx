import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "./components/NavbarWrapper";
import Footer from "./components/Footer";
import Script from "next/script";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LenisProvider from "./components/LenisProvider";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abharana-kakal.com"),
  title: "Abharana Kakal | Yoga, Sacred Retreats & From Within",
  description: "Experience immersive yoga retreats and 'From Within' reflections in Bangalore & Mysore with Abharana Kakal. Sacred spaces for deep restoration.",
  openGraph: {
    images: ['/bg-images.webp'],
  },
};

import { AudioProvider } from "@/context/AudioContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoSlab.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
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

            <Script id="chatbase-script" strategy="afterInteractive">
              {`
                (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="df9Ij5N_aJDFR-rXbuldG";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
              `}
            </Script>
          </LenisProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
 
