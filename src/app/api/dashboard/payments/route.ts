import { NextResponse } from "next/server";
import { createPayment } from "@/lib/payment-api";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createPayment(await request.json()), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not create payment" },
      { status: 400 },
    );
  }
}
