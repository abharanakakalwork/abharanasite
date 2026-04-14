import Link from 'next/link';

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/abharana_kakal/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  // {
  //   name: 'Facebook',
  //   url: '#',
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  //     </svg>
  //   ),
  // },
  // {
  //   name: 'Twitter', // X
  //   url: '#',
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
  //       <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  //     </svg>
  //   ),
  // }
];

export default function FloatingSocials() {
  return (
    <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-5 pointer-events-auto">
      {socialLinks.map((social) => (
        <Link 
          key={social.name} 
          href={social.url}
          aria-label={social.name}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 bg-[#bc6746] text-[#FFFDF8] rounded-full
                     shadow-[0_4px_14px_rgba(188,103,70,0.35)] 
                     transition-all duration-300 ease-in-out
                     hover:scale-110 hover:-translate-x-1 hover:bg-[#a55a3d] hover:shadow-[0_8px_24px_rgba(188,103,70,0.5)]"
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
}
