import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&limit=5`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "lineless-app/1.0 (contact@lineless.app)",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Geolocating failed" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
