import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { agent: true },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prospects</h1>
        <Link
          href="/leads/new"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Nouveau prospect
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="text-gray-500">Aucun prospect pour le moment.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Nom</th>
              <th className="p-2">Email</th>
              <th className="p-2">Budget</th>
              <th className="p-2">Étape</th>
              <th className="p-2">Conseiller</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <Link href={`/leads/${lead.id}`} className="hover:underline">
                    {lead.name}
                  </Link>
                </td>
                <td className="p-2">{lead.email ?? "-"}</td>
                <td className="p-2">
                  {lead.budgetMin ?? "?"} - {lead.budgetMax ?? "?"} {lead.currency}
                </td>
                <td className="p-2">{lead.stage}</td>
                <td className="p-2">{lead.agent?.name ?? "Non assigné"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}