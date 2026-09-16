import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const inactiveLeads = await prisma.lead.findMany({
    where: {
      updatedAt: { lt: fiveDaysAgo },
      stage: { notIn: ["WON", "LOST"] },
    },
    include: { agent: true },
  });

  return NextResponse.json(inactiveLeads);
}