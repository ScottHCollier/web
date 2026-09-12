import Link from "next/link";
import { Icon } from "@/components/icon";

export function PublicAccountMenu() {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const loginUrl = `${appOrigin ?? ""}/login?next=/dashboard`;
  return <Link href={loginUrl} className="public-account-menu" aria-label="Sign in to the app" title="Sign in to the app"><Icon name="account" /></Link>;
}
