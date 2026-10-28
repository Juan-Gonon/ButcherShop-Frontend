import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  showBlob?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  showBlob = true
}) => {
  return (
    <main
      className={`relative z-10 w-full max-w-md mx-auto bg-white rounded-3xl sm:rounded-4xl shadow-[0_20px_40px_-15px_rgba(112,24,36,0.08),0_35px_65px_-10px_rgba(77,42,0,0.06),0_0_1px_1px_rgba(139,30,46,0.04)] border border-[#eedccb]/70 overflow-hidden my-auto transition-all ${className}`}
    >
      {/* Dynamic Top-Right Fluid Blob */}
      {showBlob && (
        <div className="absolute -top-20 -right-20 w-64 h-64 pointer-events-none opacity-80 select-none z-0">
          <svg
            className="w-full h-full filter blur-[1px]"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="blobGradTop" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#8b1e2e" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <path
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.6,81.2,29.1,72.8,41.9C64.4,54.7,53.2,65.8,40.1,72.7C26.9,79.5,13.5,82.2,-0.2,82.6C-13.9,82.9,-27.7,81,-40.5,74.5C-53.2,68,-64.8,57,-73.4,43.7C-82,30.4,-87.6,15.2,-86.6,0.6C-85.5,-14,-77.9,-28,-68.6,-39.9C-59.2,-51.7,-48.1,-61.4,-35.6,-69.4C-23.1,-77.4,-11.6,-83.7,1.8,-86.8C15.2,-89.9,30.5,-83.6,44.7,-76.4Z"
              fill="url(#blobGradTop)"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      )}

      <div className="relative z-10 p-7 sm:p-10 flex flex-col justify-between">
        {children}
      </div>
    </main>
  );
};