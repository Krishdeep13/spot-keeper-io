import { useState, useEffect, useCallback } from "react";

/**
 * Hook to poll an ESP32 sensor endpoint for parking slot status.
 * 
 * ESP32 Setup:
 * - The ESP32 should host a simple HTTP server (e.g., on port 80)
 * - It should respond to GET requests at the root or /status with JSON:
 *   { "occupied": true }  → sensor detects object (hand/car)
 *   { "occupied": false } → sensor detects nothing (slot is free)
 * 
 * Arduino IDE example sketch endpoint:
 *   server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
 *     bool occupied = digitalRead(SENSOR_PIN) == HIGH;
 *     String json = "{\"occupied\":" + String(occupied ? "true" : "false") + "}";
 *     request->send(200, "application/json", json);
 *   });
 */

const DEFAULT_ESP32_URL = "http://192.168.1.100"; // Change to your ESP32's IP
const POLL_INTERVAL_MS = 1000; // Poll every second

export type SensorStatus = "occupied" | "vacant";

interface UseESP32SensorOptions {
  url?: string;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseESP32SensorResult {
  sensorStatus: SensorStatus;
  isConnected: boolean;
  error: string | null;
  lastUpdated: number | null;
  esp32Url: string;
  setEsp32Url: (url: string) => void;
}

export function useESP32Sensor(options?: UseESP32SensorOptions): UseESP32SensorResult {
  const [esp32Url, setEsp32Url] = useState(options?.url || DEFAULT_ESP32_URL);
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>("vacant");
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
      const occupied = data.occupied === true;
      
      setSensorStatus(occupied ? "occupied" : "vacant");
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

    // Initial fetch
    fetchStatus();

    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval, enabled]);

  return {
    sensorStatus,
    isConnected,
    error,
    lastUpdated,
    esp32Url,
    setEsp32Url,
  };
}
