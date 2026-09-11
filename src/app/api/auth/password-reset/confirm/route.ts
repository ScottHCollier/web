import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = await fetch(
    `${process.env.API_URL ?? "http://localhost:8000"}/api/v1/auth/password-reset/confirm`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    },
  );
  return response.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(await response.json(), { status: response.status });
}
