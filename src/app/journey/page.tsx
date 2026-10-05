import { redirect } from "next/navigation";

/** The journey opens on the home-page film; `/journey` on its own goes there. */
export default function Page() {
  redirect("/");
}
