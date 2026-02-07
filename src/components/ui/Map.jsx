"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapPicker({ defCoords, onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [coords, setCoords] = useState(
    defCoords || { lat: 22.67, lng: 88.37 }
  );

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (cancelled || typeof window === "undefined") return;

      const L = (await import("leaflet")).default;

      const container = L.DomUtil.get("map");
      if (container != null) {
        container._leaflet_id = null;
      }

      if (mapRef.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map("map").setView([coords.lat, coords.lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        setCoords({ lat, lng });
        onLocationSelectRef.current?.({ lat, lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
    };

    init();

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.off();
      if (mapRef.current) mapRef.current.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!defCoords || !markerRef.current || !mapRef.current) return;

    const { lat, lng } = defCoords;

    if (
      Math.abs(coords.lat - lat) < 0.00001 &&
      Math.abs(coords.lng - lng) < 0.00001
    )
      return;

    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    setCoords({ lat, lng });
  }, [defCoords]);

  return (
    <div>
      <div id="map" className="h-80 w-full rounded-lg" />
    </div>
  );
}
