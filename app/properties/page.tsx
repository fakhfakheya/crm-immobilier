import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PropertyGrid from "./PropertyGrid";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
  });

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
        <PropertyGrid properties={properties} />
      )}
    </div>
  );
}