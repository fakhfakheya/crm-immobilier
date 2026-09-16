import { prisma } from "@/lib/prisma";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",") : [];

  const properties = await prisma.property.findMany({
    where: { id: { in: idList } },
  });

  const statusLabel: Record<string, string> = {
    AVAILABLE: "Disponible",
    RESERVED: "Réservé",
    SOLD: "Vendu",
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Comparaison de biens</h1>

      {properties.length === 0 ? (
        <p className="text-gray-500">Aucun bien à comparer.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b"></th>
                {properties.map((p) => (
                  <th key={p.id} className="text-left p-2 border-b">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-medium text-gray-500">Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-2">{p.type}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium text-gray-500">Prix</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-2 font-bold">
                    {p.price.toLocaleString()} {p.currency}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium text-gray-500">Surface</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-2">
                    {p.surface ? `${p.surface} m²` : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium text-gray-500">Quartier</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-2">{p.neighborhood}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-medium text-gray-500">Statut</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-2">{statusLabel[p.status]}</td>
                ))}
              </tr>
              {properties.some((p) => p.surface) && (
                <tr>
                  <td className="p-2 font-medium text-gray-500">Prix / m²</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-2">
                      {p.surface
                        ? `${Math.round(p.price / p.surface).toLocaleString()} ${p.currency}`
                        : "-"}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}