import React from 'react';

interface BryteLinksSvgLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const LOGO_FULL_SRC = "/logo-512.png";
const LOGO_COMPACT_SRC = "/logo-192.png";

export const BryteLinksSvgLogo: React.FC<BryteLinksSvgLogoProps> = ({
  width = 200,
  height = 180,
  className = '',
}) => {
  return (
    <img
      src={LOGO_FULL_SRC}
      alt="BryteLinks Logo"
      width={width}
      height={height}
      className={className}
      loading="eager"
    />
  );
};

// Horizontal compact version for headers/navbars
export const BryteLinksSvgLogoCompact: React.FC<BryteLinksSvgLogoProps> = ({
  width = 220,
  height = 60,
  className = '',
}) => {
  return (
    <img
      src={LOGO_COMPACT_SRC}
      alt="BryteLinks Logo"
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
};

// Modern icon-only version
export const BryteLinksSvgIcon: React.FC<BryteLinksSvgLogoProps> = ({
  width = 48,
  height = 48,
  className = '',
}) => {
  return (
    <img
      src={LOGO_COMPACT_SRC}
      alt="BryteLinks Icon"
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
};

// Minimal badge version for very small spaces
export const BryteLinksBadge: React.FC<BryteLinksSvgLogoProps> = ({
  width = 32,
  height = 32,
  className = '',
}) => {
  return (
    <img
      src={LOGO_COMPACT_SRC}
      alt="BryteLinks Badge"
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
};