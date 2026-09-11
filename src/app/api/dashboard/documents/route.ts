import { NextResponse } from "next/server";
import { uploadDocument } from "@/lib/document-api";
export async function POST(request: Request) { try { return NextResponse.json(await uploadDocument(await request.formData()), { status: 201 }); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not upload document" }, { status: 400 }); } }
