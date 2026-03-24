import { useState, useEffect, useCallback } from "react";

/**
 * Hook to poll an ESP32 with TWO ultrasonic sensors:
 * - Sensor 1 (entry): counts cars entering the parking row
 * - Sensor 2 (exit): counts cars exiting the parking row
 * 
 * ESP32 should respond to GET /status with JSON:
 *   { "entry": 3, "exit": 1 }
 * 
 * Cars currently parked = entry - exit
 * 
 * Arduino IDE example:
 *   server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
 *     String json = "{\"entry\":" + String(entryCount) + ",\"exit\":" + String(exitCount) + "}";
 *     request->send(200, "application/json", json);
 *   });
 */

const DEFAULT_ESP32_URL = "http://192.168.1.100";
const POLL_INTERVAL_MS = 1000;

interface UseESP32SensorOptions {
  url?: string;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseESP32SensorResult {
  carsParked: number;
  entryCount: number;
  exitCount: number;
  isConnected: boolean;
  error: string | null;
  lastUpdated: number | null;
  esp32Url: string;
  setEsp32Url: (url: string) => void;
}

export function useESP32Sensor(options?: UseESP32SensorOptions): UseESP32SensorResult {
  const [esp32Url, setEsp32Url] = useState(options?.url || DEFAULT_ESP32_URL);
  const [entryCount, setEntryCount] = useState(0);
  const [exitCount, setExitCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const pollInterval = options?.pollInterval || POLL_INTERVAL_MS;
  const enabled = options?.enabled !== false;

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${esp32Url}/status`, {
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const entry = typeof data.entry === "number" ? data.entry : 0;
      const exit = typeof data.exit === "number" ? data.exit : 0;

      setEntryCount(entry);
      setExitCount(exit);
      setIsConnected(true);
      setError(null);
      setLastUpdated(Date.now());
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [esp32Url]);

  useEffect(() => {
    if (!enabled) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval, enabled]);

  const carsParked = Math.max(0, entryCount - exitCount);

  return {
    carsParked,
    entryCount,
    exitCount,
    isConnected,
    error,
    lastUpdated,
    esp32Url,
    setEsp32Url,
  };
}
