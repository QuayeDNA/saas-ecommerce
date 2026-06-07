import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsService, type AnalyticsData, type AgentAnalyticsData } from "../services/analytics.service";

const AGENT_KEY = "agent-analytics";
const ADMIN_KEY = "admin-analytics";

export const useAgentAnalytics = (timeframe = "30d", enabled = true) => {
  return useQuery<AgentAnalyticsData>({
    queryKey: [AGENT_KEY, timeframe],
    queryFn: () => analyticsService.getAgentAnalytics(timeframe),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};

export const useSuperAdminAnalytics = (timeframe = "30d", enabled = true) => {
  return useQuery<AnalyticsData>({
    queryKey: [ADMIN_KEY, timeframe],
    queryFn: () => analyticsService.getSuperAdminAnalytics(timeframe),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};

export const useInvalidateAnalytics = () => {
  const queryClient = useQueryClient();
  return {
    invalidateAgent: (timeframe?: string) => {
      if (timeframe) {
        queryClient.invalidateQueries({ queryKey: [AGENT_KEY, timeframe] });
      } else {
        queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      }
    },
    invalidateAdmin: (timeframe?: string) => {
      if (timeframe) {
        queryClient.invalidateQueries({ queryKey: [ADMIN_KEY, timeframe] });
      } else {
        queryClient.invalidateQueries({ queryKey: [ADMIN_KEY] });
      }
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: [AGENT_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_KEY] });
    },
  };
};
