import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { leadId, propertyId, agentId, date } = body;

  const visitDate = new Date(date);
  const windowStart = new Date(visitDate.getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(visitDate.getTime() + 60 * 60 * 1000);

  const conflict = await prisma.visit.findFirst({
    where: {
      date: { gte: windowStart, lte: windowEnd },
      OR: [{ agentId }, { propertyId }],
    },
  });

  if (conflict) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Conflit d'agenda : ce conseiller ou ce bien a déjà une visite prévue à cette heure (±1h).",
      },
      { status: 409 }
    );
  }

  const visit = await prisma.visit.create({
    data: { leadId, propertyId, agentId, date: visitDate },
  });

  return NextResponse.json({ success: true, visitId: visit.id });
}