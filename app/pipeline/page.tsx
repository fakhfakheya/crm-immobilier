import { prisma } from "@/lib/prisma";

const stages = [
  "NEW",
  "QUALIFIED",
  "VISIT_SCHEDULED",
  "OFFER",
  "WON",
  "LOST",
] as const;

const stageLabels: Record<string, string> = {
  NEW: "Nouveau",
  QUALIFIED: "Qualifié",
  VISIT_SCHEDULED: "Visite",
  OFFER: "Offre",
  WON: "Vendu",
  LOST: "Perdu",
};

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    include: { agent: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pipeline</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);

          return (
            <div key={stage} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">
                  {stageLabels[stage]}
                </h2>
                <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {stageLeads.map((lead) => {
                  const daysSinceUpdate = Math.floor(
                    (Date.now() - new Date(lead.updatedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={lead.id}
                      className="bg-white border rounded-lg p-3 shadow-sm"
                    >
                      <p className="font-medium text-sm">{lead.name}</p>
                      {(lead.budgetMin || lead.budgetMax) && (
                        <p className="text-xs text-gray-500">
                          {lead.budgetMin ?? "?"} - {lead.budgetMax ?? "?"}{" "}
                          {lead.currency}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {lead.agent?.name ?? "Non assigné"} ·{" "}
                        {daysSinceUpdate === 0
                          ? "aujourd'hui"
                          : `il y a ${daysSinceUpdate}j`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}