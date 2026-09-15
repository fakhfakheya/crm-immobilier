import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createLead(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const budgetMin = formData.get("budgetMin") as string;
  const budgetMax = formData.get("budgetMax") as string;

  await prisma.lead.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      budgetMin: budgetMin ? parseFloat(budgetMin) : null,
      budgetMax: budgetMax ? parseFloat(budgetMax) : null,
    },
  });

  redirect("/leads");
}

export default function NewLeadPage() {
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Nouveau prospect</h1>
      <form action={createLead} className="flex flex-col gap-4">
        <input
          name="name"
          placeholder="Nom complet"
          required
          className="border p-2 rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          name="phone"
          placeholder="Téléphone"
          className="border p-2 rounded"
        />
        <input
          name="budgetMin"
          type="number"
          placeholder="Budget min"
          className="border p-2 rounded"
        />
        <input
          name="budgetMax"
          type="number"
          placeholder="Budget max"
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