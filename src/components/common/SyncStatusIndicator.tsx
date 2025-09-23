import {
  Cloud,
  CloudOff,
  CloudSync,
  CloudDone,
  Error as ErrorIcon,
  Refresh,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { FunctionComponent } from "react";
import { useSyncStatus } from "../../hooks/useSync.ts";
import { useSync } from "../../hooks/useSync.ts";

interface SyncStatusIndicatorProps {
  variant?: "chip" | "icon" | "full";
  showRefreshButton?: boolean;
  size?: "small" | "medium";
}

export const SyncStatusIndicator: FunctionComponent<
  SyncStatusIndicatorProps
> = ({ variant = "chip", showRefreshButton = false, size = "small" }) => {
  const { statusText, statusColor, isSyncing, lastSyncTime, isAvailable } =
    useSyncStatus();
  const { forceSync } = useSync();

  // Don't render anything if sync is not configured
  if (!isAvailable) {
    return null;
  }

  const getStatusIcon = () => {
    if (isSyncing) {
      return <CircularProgress size={size === "small" ? 16 : 20} />;
    }

    switch (statusColor) {
      case "success":
        return lastSyncTime ? (
          <CloudDone fontSize={size} />
        ) : (
          <Cloud fontSize={size} />
        );
      case "info":
        return <CloudSync fontSize={size} />;
      case "warning":
        return <CloudOff fontSize={size} />;
      case "error":
        return <ErrorIcon fontSize={size} />;
      default:
        return <Cloud fontSize={size} />;
    }
  };

  const getTooltipText = () => {
    if (lastSyncTime) {
      const timeAgo = Date.now() - lastSyncTime;
      const minutes = Math.floor(timeAgo / (1000 * 60));
      const hours = Math.floor(minutes / 60);

      let timeText = "";
      if (hours > 0) {
        timeText = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        timeText = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        timeText = "just now";
      }

      return `${statusText}. Last synced ${timeText}.`;
    }

    return statusText;
  };

  const handleRefresh = async () => {
    if (!isSyncing && isAvailable) {
      try {
        await forceSync();
      } catch (error) {
        console.error("Manual sync failed:", error);
      }
    }
  };

  if (variant === "icon") {
    return (
      <Tooltip title={getTooltipText()}>
        <Box display="inline-flex" alignItems="center">
          {getStatusIcon()}
        </Box>
      </Tooltip>
    );
  }

  if (variant === "full") {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title={getTooltipText()}>
          <Chip
            icon={getStatusIcon()}
            label={statusText}
            color={statusColor}
            variant="outlined"
            size={size}
          />
        </Tooltip>
        {showRefreshButton && isAvailable && (
          <Tooltip title="Force sync">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isSyncing}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  // Default: chip variant
  return (
    <Tooltip title={getTooltipText()}>
      <Chip
        icon={getStatusIcon()}
        label={statusText}
        color={statusColor}
        variant="outlined"
        size={size}
        onClick={showRefreshButton && isAvailable ? handleRefresh : undefined}
        clickable={showRefreshButton && isAvailable && !isSyncing}
      />
    </Tooltip>
  );
};
