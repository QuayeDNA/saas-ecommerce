import React from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import type { Announcement } from "../../types/announcement";
import { Button } from "../../design-system/components/button";
import { Dialog } from "../../design-system/components/dialog";
import { DialogHeader } from "../../design-system/components/dialog-header";
import { DialogBody } from "../../design-system/components/dialog-body";
import { DialogFooter } from "../../design-system/components/dialog-footer";
import { useAnnouncements } from "../../hooks/useAnnouncements";

interface AnnouncementModalProps {
  announcement: Announcement;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  isOpen,
  onClose,
}) => {
  const { markAsViewed, markAsAcknowledged } = useAnnouncements();

  // Mark as viewed when modal opens
  React.useEffect(() => {
    if (isOpen && !announcement.hasViewed) {
      markAsViewed(announcement._id);
    }
  }, [isOpen, announcement._id, announcement.hasViewed, markAsViewed]);

  const handleAcknowledge = async () => {
    if (!announcement.hasAcknowledged) {
      await markAsAcknowledged(announcement._id);
    }
    onClose();
  };

  const handleAction = () => {
    if (announcement.actionUrl) {
      window.location.href = announcement.actionUrl;
    }
    handleAcknowledge();
  };

  if (!isOpen) return null;

  // Get icon and colors based on type
  const getTypeIcon = () => {
    switch (announcement.type) {
      case "success":
        return <CheckCircle className="w-6 h-6" />;
      case "error":
        return <AlertCircle className="w-6 h-6" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6" />;
      case "maintenance":
        return <Wrench className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getTypeColors = () => {
    switch (announcement.type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "text-green-600",
          badge: "bg-green-100 text-green-800",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-600",
          badge: "bg-red-100 text-red-800",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          badge: "bg-yellow-100 text-yellow-800",
        };
      case "maintenance":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          icon: "text-purple-600",
          badge: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-600",
          badge: "bg-blue-100 text-blue-800",
        };
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded ${
          colors[announcement.priority]
        }`}
      >
        {announcement.priority.toUpperCase()}
      </span>
    );
  };

  const colors = getTypeColors();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <div className="flex items-start gap-4">
          <div className={`${colors.icon} mt-1`}>{getTypeIcon()}</div>
          <div className="flex-1 space-y-2">
            <h3
              id="announcement-title"
              className="text-xl font-semibold text-gray-900"
            >
              {announcement.title}
            </h3>
            <div className="flex items-center gap-2">
              {getPriorityBadge()}
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${colors.badge}`}
              >
                {announcement.type.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close announcement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody>
        <p className="text-gray-700 whitespace-pre-wrap">
          {announcement.message}
        </p>

        {announcement.expiresAt && (
          <p className="text-xs text-gray-500 mt-4">
            Expires: {new Date(announcement.expiresAt).toLocaleString()}
          </p>
        )}
      </DialogBody>

      <DialogFooter>
        {announcement.actionRequired && announcement.actionUrl ? (
          <>
            <Button variant="outline" onClick={handleAcknowledge}>
              Dismiss
            </Button>
            <Button variant="primary" onClick={handleAction}>
              {announcement.actionText || "Take Action"}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleAcknowledge}>
            Got it
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default AnnouncementModal;
