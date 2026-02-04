import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q
  )}&format=json&limit=5`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "lineless-app/1.0 (contact@lineless.app)",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
