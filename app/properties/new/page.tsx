import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createProperty(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const price = formData.get("price") as string;
  const surface = formData.get("surface") as string;
  const neighborhood = formData.get("neighborhood") as string;

  await prisma.property.create({
    data: {
      title,
      type,
      price: parseFloat(price),
      surface: surface ? parseFloat(surface) : null,
      neighborhood,
    },
  });

  redirect("/properties");
}

export default function NewPropertyPage() {
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Nouveau bien</h1>
      <form action={createProperty} className="flex flex-col gap-4">
        <input
          name="title"
          placeholder="Titre (ex: Appartement F3 vue mer)"
          required
          className="border p-2 rounded"
        />
        <input
          name="type"
          placeholder="Type (appartement, maison, terrain...)"
          required
          className="border p-2 rounded"
        />
        <input
          name="price"
          type="number"
          placeholder="Prix"
          required
          className="border p-2 rounded"
        />
        <input
          name="surface"
          type="number"
          placeholder="Surface (m²)"
          className="border p-2 rounded"
        />
        <input
          name="neighborhood"
          placeholder="Quartier"
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Créer
        </button>
      </form>
    </div>
  );
}