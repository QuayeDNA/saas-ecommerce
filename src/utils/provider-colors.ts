// src/utils/provider-colors.ts

type ProviderColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

type ProviderColorMap = {
  [key: string]: ProviderColors;
};

/**
 * Map of network provider names to their brand colors
 */
export const providerColors: ProviderColorMap = {
  MTN: {
    primary: '#ffcc00', // MTN Yellow
    secondary: '#003f87', // MTN Blue
    background: '#fff7d9', // Light yellow background
    text: '#000000'
  },
  TELECEL: {
    primary: '#e60000', // TELECEL Red
    secondary: '#4a4d4e', // TELECEL Dark Gray
    background: '#ffecec', // Light red background
    text: '#000000'
  },
  AT: {
    primary: '#ff7500', // AT Orange
    secondary: '#990000', // AT Red
    background: '#fff2e6', // Light orange background
    text: '#000000'
  },
  GLO: {
    primary: '#4cb749', // GLO Green
    secondary: '#00953b', // GLO Dark Green
    background: '#edfaee', // Light green background
    text: '#000000'
  },
  default: {
    primary: '#e5e7eb', // Default gray
    secondary: '#6b7280', // Default dark gray
    background: '#f9fafb', // Default light gray background
    text: '#000000'
  }
};

/**
 * Get provider brand colors
 * @param providerName - The name of the network provider
 * @returns The brand colors for the provider or default colors if not found
 */
export const getProviderColors = (providerName: string | undefined): ProviderColors => {
  if (!providerName) return providerColors.default;
  
  // Normalize provider name and check if it exists in the map
  const normalizedName = Object.keys(providerColors).find(
    name => name.toLowerCase() === providerName.toLowerCase()
  );
  
  return normalizedName ? providerColors[normalizedName] : providerColors.default;
};
