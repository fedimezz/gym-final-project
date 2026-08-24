/**
 * lib/activity-log.ts
 *
 * Thin wrapper around Prisma's ActivityLog model.
 * Call logAction() from any API route — it never throws so a logging
 * failure never breaks the primary operation.
 *
 * Usage:
 *   await logAction(request, {
 *     actorId: admin.id, actorName: admin.name, actorRole: admin.role,
 *     action: "MEMBER_SUSPENDED",
 *     category: "MEMBER",
 *     targetId: member.id, targetName: member.name,
 *     detail: { reason: "non-payment" },
 *   });
 */

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export type LogCategory =
    | "AUTH"
    | "BOOKING"
    | "MEMBER"
    | "SESSION"
    | "PAYMENT"
    | "SUBSCRIPTION"
    | "SETTINGS"
    | "NOTIFICATION"
    | "SYSTEM"
    | "REPORT"
    | "STAFF"
    | "CONTENT";

export interface LogPayload {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  category: LogCategory;
  targetId?: string;
  targetName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail?: Record<string, any>;
}

function extractIp(req: NextRequest | Request): string | undefined {
  const r = req as NextRequest;
  return (
      r.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
      r.headers?.get?.("x-real-ip") ??
      undefined
  );
}

export async function logAction(
    req: NextRequest | Request | null,
    payload: LogPayload
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: payload.actorId ?? null,
        actorName: payload.actorName ?? null,
        actorRole: payload.actorRole ?? null,
        action: payload.action,
        category: payload.category,
        targetId: payload.targetId ?? null,
        targetName: payload.targetName ?? null,
        detail: payload.detail ?? undefined,
        ip: req ? extractIp(req) : null,
        userAgent: req ? (req.headers?.get?.("user-agent") ?? null) : null,
      },
    });
  } catch {
    // Never propagate — logging must never break the caller.
  }
}

/** Convenience: log a SYSTEM action with no actor. */
export async function logSystem(action: string, detail?: Record<string, unknown>): Promise<void> {
  await logAction(null, {
    actorRole: "SYSTEM",
    action,
    category: "SYSTEM",
    detail,
  });
}