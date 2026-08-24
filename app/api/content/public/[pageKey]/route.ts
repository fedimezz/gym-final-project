import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PAGE_CONTENT_SCHEMA } from "@/lib/page-content-schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await params;
  if (!PAGE_CONTENT_SCHEMA.some((p) => p.pageKey === pageKey)) {
    const response = NextResponse.json({ content: {} });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
  try {
    const row = await prisma.pageContent.findUnique({ where: { pageKey } });
    const response = NextResponse.json({ content: row?.content ?? {} });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("Public page-content GET error:", error);
    return NextResponse.json({ content: {} }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
