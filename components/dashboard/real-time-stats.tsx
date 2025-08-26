"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveUpdates } from "@/hooks/use-live-updates";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ShoppingCart,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, ScaleIn } from "@/components/ui/animations";

interface RealTimeStatsProps {
  initialStats?: {
    totalSales: number;
    ordersToday: number;
    onlineUsers: number;
    recentActivity?: string;
  };
}

export function RealTimeStats({ initialStats }: RealTimeStatsProps) {
  const [stats, setStats] = useState(
    initialStats || {
      totalSales: 0,
      ordersToday: 0,
      onlineUsers: 0,
      recentActivity: "No recent activity",
    }
  );

  const [previousStats, setPreviousStats] = useState(stats);
  const [isUpdating, setIsUpdating] = useState(false);

  useLiveUpdates({
    enabled: true,
    onUpdate: (update) => {
      if (update.type === "stats_update" && update.data) {
        setIsUpdating(true);
        setPreviousStats(stats);

        // Delayed update for smooth animation
        setTimeout(() => {
          setStats((prev) => ({ ...prev, ...update.data }));
          setIsUpdating(false);
        }, 300);
      }
    },
  });

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous)
      return { icon: TrendingUp, color: "text-green-500", direction: "up" };
    if (current < previous)
      return { icon: TrendingDown, color: "text-red-500", direction: "down" };
    return { icon: Minus, color: "text-gray-500", direction: "same" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const salesChange = getChangeIndicator(
    stats.totalSales,
    previousStats.totalSales
  );
  const ordersChange = getChangeIndicator(
    stats.ordersToday,
    previousStats.ordersToday
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sales */}
      <FadeIn delay={0}>
        <Card
          className={cn(
            "transition-all duration-300 hover:shadow-lg",
            isUpdating && "ring-2 ring-blue-500 ring-opacity-50"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ScaleIn key={stats.totalSales}>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalSales)}
                </div>
              </ScaleIn>
              <div className="flex items-center gap-1">
                <salesChange.icon
                  className={cn("h-3 w-3", salesChange.color)}
                />
                <Badge
                  variant={
                    salesChange.direction === "up" ? "default" : "secondary"
                  }
                >
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Orders Today */}
      <FadeIn delay={100}>
        <Card
          className={cn(
            "transition-all duration-300 hover:shadow-lg",
            isUpdating && "ring-2 ring-green-500 ring-opacity-50"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ScaleIn key={stats.ordersToday}>
                <div className="text-2xl font-bold">
                  {stats.ordersToday.toLocaleString()}
                </div>
              </ScaleIn>
              <ordersChange.icon
                className={cn("h-4 w-4", ordersChange.color)}
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Online Users */}
      <FadeIn delay={200}>
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ScaleIn key={stats.onlineUsers}>
                <div className="text-2xl font-bold text-green-600">
                  {stats.onlineUsers}
                </div>
              </ScaleIn>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Recent Activity */}
      <FadeIn delay={300}>
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground line-clamp-2">
                {stats.recentActivity}
              </div>
              <Badge variant="outline" className="text-xs">
                Live Updates
              </Badge>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
