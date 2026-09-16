import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const criteres = JSON.parse(body.criteresExtraits);

  const agent = await prisma.agent.findFirst({
    orderBy: { leads: { _count: "asc" } },
  });

  const lead = await prisma.lead.create({
    data: {
      name: body.nom,
      email: body.email,
      phone: body.telephone,
      criteria: `${criteres.type ?? ""} - ${criteres.quartier ?? "quartier non précisé"}`,
      budgetMin: criteres.budgetMin,
      budgetMax: criteres.budgetMax,
      agentId: agent?.id ?? null,
    },
  });

  return NextResponse.json({ success: true, leadId: lead.id });
}