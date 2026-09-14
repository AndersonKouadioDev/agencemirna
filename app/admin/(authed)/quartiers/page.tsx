import { redirect } from "next/navigation";

/** Communes et quartiers se gèrent désormais ensemble : ils sont liés. */
export default function Page() {
  redirect("/admin/geographie");
}
