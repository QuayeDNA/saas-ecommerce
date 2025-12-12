import { useContext } from "react";
import AnnouncementContext from "../contexts/AnnouncementContext";
import type { AnnouncementContextValue } from "../types/announcement";

export const useAnnouncements = (): AnnouncementContextValue => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error(
      "useAnnouncements must be used within an AnnouncementProvider"
    );
  }
  return context;
};
