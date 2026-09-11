import { NextResponse } from "next/server";
import { updatePayment } from "@/lib/payment-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  try {
    return NextResponse.json(
      await updatePayment((await params).paymentId, await request.json()),
    );
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not update payment" },
      { status: 400 },
    );
  }
}
