"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Property = {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  surface: number | null;
  neighborhood: string;
  status: string;
};

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

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm">
            {selected.length} bien{selected.length > 1 ? "s" : ""} sélectionné
            {selected.length > 1 ? "s" : ""} (max 3)
          </span>
          <button
            disabled={selected.length < 2}
            onClick={() =>
              router.push(`/properties/compare?ids=${selected.join(",")}`)
            }
            className="bg-black text-white text-sm px-3 py-1 rounded disabled:opacity-40"
          >
            Comparer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`border rounded-lg p-4 ${
              selected.includes(property.id) ? "ring-2 ring-black" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(property.id)}
                  onChange={() => toggle(property.id)}
                />
                <span className="font-semibold">{property.title}</span>
              </label>
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
              <p className="text-sm text-gray-500">{property.surface} m²</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}