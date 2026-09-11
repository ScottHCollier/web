import { redirect } from "next/navigation";
import { getAuthenticatedApiUser } from "@/lib/auth";
import LoginForm from "./login-form";

function safeNextPath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safeNextPath((await searchParams).next);
  if (await getAuthenticatedApiUser()) redirect(nextPath);
  return <LoginForm nextPath={nextPath} />;
}
