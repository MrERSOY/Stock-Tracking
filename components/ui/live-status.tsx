"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveUpdates } from "@/hooks/use-live-updates";
import { Wifi, WifiOff, RefreshCw, Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusIndicatorProps {
  onLiveUpdate?: (update: any) => void;
  className?: string;
}

export function LiveStatusIndicator({
  onLiveUpdate,
  className,
}: LiveStatusIndicatorProps) {
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  const { isConnected, lastUpdate, connectionError, reconnect } =
    useLiveUpdates({
      enabled: true,
      onUpdate: (update) => {
        setHasNewUpdates(true);
        onLiveUpdate?.(update);

        // Auto-clear notification after 3 seconds
        setTimeout(() => setHasNewUpdates(false), 3000);
      },
      onError: (error) => {
        console.error("Live updates error:", error);
      },
    });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Connection Status */}
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className={cn(
          "flex items-center gap-1 transition-all duration-300",
          isConnected && "animate-pulse"
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="text-xs">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Offline</span>
          </>
        )}
      </Badge>

      {/* Update Notification */}
      {hasNewUpdates && (
        <Badge variant="secondary" className="animate-bounce">
          <BellRing className="h-3 w-3 mr-1" />
          <span className="text-xs">New</span>
        </Badge>
      )}

      {/* Manual Refresh Button */}
      {connectionError && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reconnect}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}

      {/* Last Update Time */}
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Updated: {new Date(lastUpdate.timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
