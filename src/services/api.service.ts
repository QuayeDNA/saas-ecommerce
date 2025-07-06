// This file is deprecated - use the apiClient from api-client.ts instead
// Import and re-export the apiClient to maintain backward compatibility

import { apiClient } from '../utils/api-client';

// Export the apiClient as api for backward compatibility
export const api = apiClient;