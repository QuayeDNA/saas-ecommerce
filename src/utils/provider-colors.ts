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
    primary: '#ffc403', // MTN Yellow (official brand color)
    secondary: '#1A2526', // MTN Dark Gray
    background: '#FFF8E1', // Subtle yellow-tinted background
    text: '#FFFFFF' // White for high contrast on primary color
  },
  TELECEL: {
    primary: '#f8020f', // Telecel Red (official brand color)
    secondary: '#37474F', // Telecel Slate Gray
    background: '#FFEBEE', // Subtle red-tinted background
    text: '#FFFFFF'
  },
  AT: {
    primary: '#223d76', // AirtelTigo Blue (official brand color)
    secondary: '#e8262c', // AirtelTigo Red
    background: '#E3F2FD', // Subtle blue-tinted background
    text: '#FFFFFF'
  },
  AFA: {
    primary: '#2E7D32', // AFA Green (brand green)
    secondary: '#1B5E20', // AFA Dark Green
    background: '#E8F5E9', // Subtle green-tinted background
    text: '#FFFFFF'
  },
  default: {
    primary: '#9CA3AF', // Neutral gray
    secondary: '#4B5563', // Darker gray
    background: '#F9FAFB', // Light gray background
    text: '#FFFFFF'
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