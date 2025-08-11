import React from 'react';

interface BryteLinksSvgLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const BryteLinksSvgLogo: React.FC<BryteLinksSvgLogoProps> = ({
  width = 200,
  height = 180,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="50%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f1b2e" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#142850" floodOpacity="0.15"/>
        </filter>
      </defs>
      
      {/* Main logo container */}
      <g>
        {/* Geometric background shape - rounded square with subtle angle */}
        <rect
          x="50"
          y="20"
          width="100"
          height="100"
          rx="24"
          fill="url(#bgGradient)"
          filter="url(#shadow)"
          transform="rotate(-2 100 70)"
        />
        
        {/* Inner geometric accent */}
        <rect
          x="55"
          y="25"
          width="90"
          height="90"
          rx="20"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="1"
          opacity="0.3"
          transform="rotate(-2 100 70)"
        />
        
        {/* Modern B - geometric and clean */}
        <g transform="translate(72, 45)">
          <path
            d="M0 0 L0 40 L20 40 C26 40 30 36 30 30 C30 26.5 28 23.8 25 22.5 C28 21.2 30 18.5 30 15 C30 9 26 5 20 5 L0 5 Z M8 12 L18 12 C20.5 12 22.5 14 22.5 16.5 C22.5 19 20.5 21 18 21 L8 21 Z M8 28 L20 28 C22.5 28 24.5 30 24.5 32.5 C24.5 35 22.5 37 20 37 L8 37 Z"
            fill="#ffffff"
            strokeWidth="0"
          />
        </g>
        
        {/* Modern L - clean and geometric */}
        <g transform="translate(108, 45)">
          <path
            d="M0 0 L0 35 L22 35 L22 40 L-8 40 L-8 0 Z"
            fill="#ffffff"
          />
        </g>
        
        {/* Subtle tech accent dots */}
        <circle cx="65" cy="35" r="2" fill="url(#accentGradient)" opacity="0.6" />
        <circle cx="135" cy="105" r="1.5" fill="url(#accentGradient)" opacity="0.4" />
        <circle cx="58" cy="100" r="1" fill="url(#accentGradient)" opacity="0.5" />
      </g>
      
      {/* Company name with modern typography */}
      <text
        x="100"
        y="148"
        textAnchor="middle"
        fill="url(#textGradient)"
        fontSize="24"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="600"
        letterSpacing="-0.02em"
        style={{ fontVariantNumeric: 'lining-nums' }}
      >
        BryteLinks
      </text>
      
      {/* Refined accent line */}
      <rect
        x="60"
        y="158"
        width="80"
        height="1"
        fill="url(#accentGradient)"
        opacity="0.4"
        rx="0.5"
      />
      
      {/* Tagline with improved spacing */}
      <text
        x="100"
        y="174"
        textAnchor="middle"
        fill="#64748b"
        fontSize="11"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="500"
        letterSpacing="0.15em"
        style={{ textTransform: 'uppercase' }}
      >
        Telecom Solutions
      </text>
    </svg>
  );
};

// Horizontal compact version for headers/navbars
export const BryteLinksSvgLogoCompact: React.FC<BryteLinksSvgLogoProps> = ({
  width = 220,
  height = 60,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="compactBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="50%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f1b2e" />
        </linearGradient>
        <linearGradient id="compactAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="compactTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="compactShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#142850" floodOpacity="0.12"/>
        </filter>
      </defs>
      
      {/* Compact geometric logo shape */}
      <rect
        x="8"
        y="10"
        width="40"
        height="40"
        rx="12"
        fill="url(#compactBgGradient)"
        filter="url(#compactShadow)"
      />
      
      {/* Compact B */}
      <path
        d="M16 20 L16 40 L26 40 C28.5 40 30.5 38 30.5 35.5 C30.5 34 29.8 32.7 28.5 32.2 C29.8 31.7 30.5 30.4 30.5 28.9 C30.5 26.4 28.5 24.4 26 24.4 L16 24.4 Z M20 27.5 L25 27.5 C26 27.5 26.8 28.3 26.8 29.3 C26.8 30.3 26 31.1 25 31.1 L20 31.1 Z M20 33.5 L26 33.5 C27 33.5 27.8 34.3 27.8 35.3 C27.8 36.3 27 37.1 26 37.1 L20 37.1 Z"
        fill="#ffffff"
      />
      
      {/* Compact L */}
      <path
        d="M33 20 L33 36.5 L42 36.5 L42 40 L29 40 L29 20 Z"
        fill="#ffffff"
      />
      
      {/* Company name - optimized for horizontal layout */}
      <text
        x="65"
        y="38"
        fill="url(#compactTextGradient)"
        fontSize="28"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        BryteLinks
      </text>
      
      {/* Subtle accent */}
      <circle cx="42" cy="18" r="1.5" fill="url(#compactAccentGradient)" opacity="0.6" />
    </svg>
  );
};

// Modern icon-only version
export const BryteLinksSvgIcon: React.FC<BryteLinksSvgLogoProps> = ({
  width = 48,
  height = 48,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="50%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f1b2e" />
        </linearGradient>
        <linearGradient id="iconAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      
      {/* Modern icon shape - rounded square */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="12"
        fill="url(#iconGradient)"
      />
      
      {/* Subtle inner accent */}
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="10"
        fill="none"
        stroke="url(#iconAccentGradient)"
        strokeWidth="0.5"
        opacity="0.4"
      />
      
      {/* Icon B - simplified and bold */}
      <path
        d="M14 16 L14 32 L21 32 C23 32 24.5 30.5 24.5 28.5 C24.5 27.3 23.9 26.3 23 25.8 C23.9 25.3 24.5 24.3 24.5 23.1 C24.5 21.1 23 19.6 21 19.6 L14 19.6 Z M16.8 21.8 L20.2 21.8 C21 21.8 21.6 22.4 21.6 23.2 C21.6 24 21 24.6 20.2 24.6 L16.8 24.6 Z M16.8 26.8 L21 26.8 C21.8 26.8 22.4 27.4 22.4 28.2 C22.4 29 21.8 29.6 21 29.6 L16.8 29.6 Z"
        fill="#ffffff"
      />
      
      {/* Icon L - clean and geometric */}
      <path
        d="M26 16 L26 29 L32.5 29 L32.5 32 L23.2 32 L23.2 16 Z"
        fill="#ffffff"
      />
      
      {/* Minimal accent dot */}
      <circle cx="34" cy="14" r="1" fill="url(#iconAccentGradient)" opacity="0.7" />
    </svg>
  );
};

// Minimal badge version for very small spaces
export const BryteLinksBadge: React.FC<BryteLinksSvgLogoProps> = ({
  width = 32,
  height = 32,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#142850" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      
      <rect
        width="32"
        height="32"
        rx="8"
        fill="url(#badgeGradient)"
      />
      
      {/* Ultra-simplified BL monogram */}
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="14"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
      >
        BL
      </text>
    </svg>
  );
};