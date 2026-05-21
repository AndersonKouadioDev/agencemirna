import { notFound } from "next/navigation";
import { getTestimonialAdmin } from "@/src/actions/admin/content";
import { TestimonialForm } from "../testimonial-form";

export const metadata = { title: "Édition témoignage · Admin Mirna" };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getTestimonialAdmin(id);
  if (!row) notFound();
  return <TestimonialForm row={row} />;
}
