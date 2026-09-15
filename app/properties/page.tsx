import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, string> = {
    AVAILABLE: "Disponible",
    RESERVED: "Réservé",
    SOLD: "Vendu",
  };

  const statusColor: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    RESERVED: "bg-yellow-100 text-yellow-700",
    SOLD: "bg-gray-200 text-gray-600",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catalogue des biens</h1>
        <Link
          href="/properties/new"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Nouveau bien
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-gray-500">Aucun bien pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{property.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    statusColor[property.status]
                  }`}
                >
                  {statusLabel[property.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500">{property.type}</p>
              <p className="text-sm text-gray-500">{property.neighborhood}</p>
              <p className="mt-2 font-bold">
                {property.price.toLocaleString()} {property.currency}
              </p>
              {property.surface && (
                <p className="text-sm text-gray-500">
                  {property.surface} m²
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}