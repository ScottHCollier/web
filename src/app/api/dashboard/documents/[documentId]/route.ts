import { NextResponse } from "next/server";
import { deleteDocument } from "@/lib/document-api";
export async function DELETE(_: Request, { params }: { params: Promise<{ documentId: string }> }) { try { await deleteDocument((await params).documentId); return new NextResponse(null, { status: 204 }); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not delete document" }, { status: 400 }); } }
