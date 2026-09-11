import { PageHeading } from "@/components/page-ui";
import { PaymentLedger } from "@/components/payment-ledger";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { getPayments } from "@/lib/payment-api";
import { canAccessRole } from "@/lib/roles";

export default async function Page() {
  const data = await getCurrentClub();
  const [payments, role] = await Promise.all([
    getPayments(),
    getCurrentClubRole(data.club.id),
  ]);
  return (
    <>
      <PageHeading
        title="Payments"
        description="Keep track of membership fees and season costs."
      />
      <PaymentLedger
        initialPayments={payments}
        players={data.players.map((player) => ({ id: player.id, name: player.name }))}
        canManage={canAccessRole(role, "admin")}
      />
    </>
  );
}
