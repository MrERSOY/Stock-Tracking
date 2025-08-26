// app/api/dashboard/live/route.ts
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const responseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
    "X-Accel-Buffering": "no", // Disable proxy buffering
  };

  try {
    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = JSON.stringify({
          type: "connected",
          message: "Dashboard live updates connected",
          timestamp: new Date().toISOString(),
        });

        controller.enqueue(`data: ${initialMessage}\n\n`);

        // Simulate real-time updates every 10 seconds (for testing)
        const interval = setInterval(async () => {
          try {
            // Mock real-time stats update
            const liveStats = {
              type: "stats_update",
              data: {
                totalSales: Math.floor(Math.random() * 1000000),
                ordersToday: Math.floor(Math.random() * 50),
                onlineUsers: Math.floor(Math.random() * 20) + 1,
                recentActivity: `New order received - ${Math.floor(
                  Math.random() * 10000
                )}`,
              },
              timestamp: new Date().toISOString(),
            };

            const message = `data: ${JSON.stringify(liveStats)}\n\n`;
            controller.enqueue(message);
          } catch (error) {
            console.error("❌ SSE interval error:", error);
            controller.error(error);
          }
        }, 10000); // 10 seconds for testing

        // Cleanup on connection close
        const cleanup = () => {
          clearInterval(interval);
          try {
            controller.close();
          } catch (e) {
            // Ignore close errors
          }
        };

        // Handle client disconnect
        request.signal.addEventListener("abort", cleanup);

        // Handle stream close
        return cleanup;
      },
    });

    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("❌ SSE endpoint error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
