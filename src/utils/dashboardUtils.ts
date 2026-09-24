import * as Location from "expo-location";
import { useDataStore } from "../store/dataStore";
import { storage } from "./storage";
import { toast } from "./toast";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function toLocalIsoWithOffset(d = new Date()) {
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? "+" : "-";
  const hh = pad2(Math.floor(Math.abs(tz) / 60));
  const mm = pad2(Math.abs(tz) % 60);

  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
    `T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` +
    `${sign}${hh}:${mm}`
  );
}

const GEO_CACHE_KEY = "dev_geo_cache";
const GEO_CACHE_TTL = 5 * 60 * 1000;

export async function requestGeolocationWithCache(permissionDeniedMessage: string) {
  const cached = storage.getItem(GEO_CACHE_KEY);
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < GEO_CACHE_TTL) {
        useDataStore.getState().setGeoLocation(data);
        return;
      }
    } catch {
      storage.removeItem(GEO_CACHE_KEY);
    }
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      toast.warn(permissionDeniedMessage, { toastId: "geo-permission-denied" });
      useDataStore.getState().clearGeoLocation();
      return;
    }

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const data = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };
    storage.setItem(GEO_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    useDataStore.getState().setGeoLocation(data);
  } catch (err) {
    console.warn(err);
    toast.warn(permissionDeniedMessage, { toastId: "geo-permission-denied" });
    useDataStore.getState().clearGeoLocation();
  }
}
