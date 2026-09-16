import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      leadId: body.leadId,
    },
  });

  return NextResponse.json({ success: true, taskId: task.id });
}