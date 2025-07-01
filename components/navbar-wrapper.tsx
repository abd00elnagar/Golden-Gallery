import { getUser } from "@/lib/auth";
import { Navbar } from "./navbar";

export async function NavbarWrapper() {
  const user = await getUser();
  return <Navbar user={user} />;
}
