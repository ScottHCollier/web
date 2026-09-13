import Link from "next/link";
import { Icon } from "@/components/icon";

export function PublicAccountMenu() {
  return <Link href="/login?next=/dashboard" className="public-account-menu" aria-label="Sign in" title="Sign in"><Icon name="account" /></Link>;
}
