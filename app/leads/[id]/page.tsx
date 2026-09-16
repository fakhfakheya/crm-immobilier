import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTopMatches } from "@/lib/matching";

async function sendRelance(taskId: string, leadId: string) {
  "use server";

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!task || !lead || !lead.email) return;

  const messageText = task.title.replace("Relance à valider : ", "");

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

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
  const matches = getTopMatches(lead, properties);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">{lead.name}</h1>
      <p className="text-gray-500 mb-6">
        {lead.email ?? "Pas d'email"} · {lead.phone ?? "Pas de téléphone"}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="font-semibold">
            {lead.budgetMin ?? "?"} - {lead.budgetMax ?? "?"} {lead.currency}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Étape</p>
          <p className="font-semibold">{lead.stage}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Conseiller</p>
          <p className="font-semibold">{lead.agent?.name ?? "Non assigné"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Consentement RGPD</p>
          <p className="font-semibold">
            {lead.gdprConsent ? "✅ Oui" : "❌ Non"}
          </p>
        </div>
      </div>

      {lead.criteria && (
	
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Critères de recherche</h2>
          <p className="text-gray-700">{lead.criteria}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Visites ({lead.visits.length})</h2>
        {lead.visits.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune visite planifiée.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lead.visits.map((visit) => (
              <li key={visit.id} className="border rounded-lg p-3 text-sm">
                {visit.property.title} —{" "}
                {new Date(visit.date).toLocaleString("fr-FR")}
              </li>
            ))}
          </ul>
        )}
      </div>

            <div className="mb-6">
        <h2 className="font-semibold mb-2">Tâches ({lead.tasks.length})</h2>
        {lead.tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune tâche.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lead.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 text-sm border rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <span>{task.done ? "✅" : "⬜"}</span>
                  {task.title}
                </div>
                {!task.done && (
                  <form
                    action={async () => {
                      "use server";
                      await sendRelance(task.id, lead.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="bg-black text-white text-xs px-3 py-1 rounded"
                    >
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
          <p className="text-gray-400 text-sm">
            Aucun bien disponible pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map(({ property, score, penalties }) => (
              <li key={property.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{property.title}</p>
                  <span className="text-sm font-bold">{score}%</span>
                </div>
                <p className="text-xs text-gray-500">
                  {property.price.toLocaleString()} {property.currency} ·{" "}
                  {property.neighborhood}
                </p>
                {penalties.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    {penalties.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}