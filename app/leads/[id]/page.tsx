import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getTopMatches } from "@/lib/matching";

async function sendRelance(taskId: string, leadId: string) {
  "use server";

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!task || !lead || !lead.email) return;

  const messageText = task.title.replace("Relance a valider : ", "");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: lead.email,
      subject: "Nouvelles concernant votre recherche",
      text: messageText,
    }),
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { done: true },
  });
}

async function scheduleVisit(formData: FormData) {
  "use server";

  const leadId = formData.get("leadId") as string;
  const propertyId = formData.get("propertyId") as string;
  const agentId = formData.get("agentId") as string;
  const date = formData.get("date") as string;

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
    redirect(
      "/leads/" + leadId + "?error=" + encodeURIComponent(
        "Conflit d'agenda : ce conseiller ou ce bien a deja une visite prevue a cette heure."
      )
    );
  }

  await prisma.visit.create({
    data: { leadId, propertyId, agentId, date: visitDate },
  });

  redirect("/leads/" + leadId);
}

async function deleteLead(formData: FormData) {
  "use server";
  const leadId = formData.get("leadId") as string;

  await prisma.task.deleteMany({ where: { leadId } });
  await prisma.visit.deleteMany({ where: { leadId } });
  await prisma.lead.delete({ where: { id: leadId } });

  redirect("/leads");
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      agent: true,
      visits: { include: { property: true }, orderBy: { date: "asc" } },
      tasks: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) return notFound();

  const properties = await prisma.property.findMany();
  const agents = await prisma.agent.findMany();
  const matches = getTopMatches(lead, properties);

  const exportUrl = "/api/leads/" + lead.id + "/export";

  return (
    <div className="p-8 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-1">{lead.name}</h1>
      <p className="text-gray-500 mb-6">
        {lead.email ?? "Pas d'email"} - {lead.phone ?? "Pas de telephone"}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="font-semibold">
            {lead.budgetMin ?? "?"} - {lead.budgetMax ?? "?"} {lead.currency}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Etape</p>
          <p className="font-semibold">{lead.stage}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Conseiller</p>
          <p className="font-semibold">{lead.agent?.name ?? "Non assigne"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Consentement RGPD</p>
          <p className="font-semibold">
            {lead.gdprConsent ? "Oui" : "Non"}
          </p>
        </div>
      </div>

      {lead.criteria && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Criteres de recherche</h2>
          <p className="text-gray-700">{lead.criteria}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Visites ({lead.visits.length})</h2>
        {lead.visits.length === 0 ? (
          <p className="text-gray-400 text-sm mb-3">Aucune visite planifiee.</p>
        ) : (
          <ul className="flex flex-col gap-2 mb-3">
            {lead.visits.map((visit) => (
              <li key={visit.id} className="border rounded-lg p-3 text-sm">
                {visit.property.title} - {new Date(visit.date).toLocaleString("fr-FR")}
              </li>
            ))}
          </ul>
        )}

        <form action={scheduleVisit} className="border rounded-lg p-3 flex flex-col gap-2">
          <input type="hidden" name="leadId" value={lead.id} />
          <p className="text-xs text-gray-500 mb-1">Planifier une visite</p>

          <select name="propertyId" required className="border p-2 rounded text-sm">
            <option value="">Choisir un bien</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select name="agentId" required className="border p-2 rounded text-sm">
            <option value="">Choisir un conseiller</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <input type="datetime-local" name="date" required className="border p-2 rounded text-sm" />

          <button type="submit" className="bg-black text-white text-sm px-3 py-2 rounded">
            Planifier la visite
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Taches ({lead.tasks.length})</h2>
        {lead.tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune tache.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lead.tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-2 text-sm border rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span>{task.done ? "[fait]" : "[a faire]"}</span>
                  {task.title}
                </div>
                {!task.done && (
                  <form
                    action={async () => {
                      "use server";
                      await sendRelance(task.id, lead.id);
                    }}
                  >
                    <button type="submit" className="bg-black text-white text-xs px-3 py-1 rounded">
                      Envoyer
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Biens compatibles</h2>
        {matches.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun bien disponible pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map(({ property, score, penalties }) => (
              <li key={property.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{property.title}</p>
                  <span className="text-sm font-bold">{score}%</span>
                </div>
                <p className="text-xs text-gray-500">
                  {property.price.toLocaleString()} {property.currency} - {property.neighborhood}
                </p>
                {penalties.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">{penalties.join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 border-t pt-4 flex gap-3">
        <a href={exportUrl} className="text-sm border px-3 py-2 rounded">
          Exporter mes donnees (RGPD)
        </a>
        <form action={deleteLead}>
          <input type="hidden" name="leadId" value={lead.id} />
          <button type="submit" className="text-sm border border-red-300 text-red-600 px-3 py-2 rounded">
            Supprimer ce prospect (RGPD)
          </button>
        </form>
      </div>
    </div>
  );
}
