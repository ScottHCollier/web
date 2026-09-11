import { getAuthenticatedApiUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "../onboarding-form";

export default async function CreateClubPage() {
  const user = await getAuthenticatedApiUser();
  if (!user) redirect("/login?next=/onboarding/create");
  if (user.memberships.length) redirect("/dashboard");
  return <OnboardingForm />;
}
