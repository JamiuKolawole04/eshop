import { NextResponse } from "next/server";

const SOURCE_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export async function GET() {
  const res = await fetch(SOURCE_URL, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch geo data" },
      { status: res.status },
    );
  }

  const data = await res.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
