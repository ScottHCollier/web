import { getCurrentClub } from "@/lib/current-club";
import { PageHeading } from "@/components/page-ui";
import { Status } from "@/components/page-ui";
import { RegistrationInviteAction } from "@/components/registration-invite-action";

export default async function Page() {
  const data = await getCurrentClub();
  return (
    <>
      <PageHeading
        title="Registrations"
        description="Help every player get ready for the season."
      />
      <section className="overflow-hidden panel">
        <div className="flex items-center justify-between gap-3 border-b border-line p-5">
          <h2 className="text-base font-medium tracking-tight">Season 2026 / 27</h2>
          <span>
            {
              data.players.filter(
                (player) => player.registration === "Complete",
              ).length
            }{" "}
            of {data.players.length} complete
          </span>
        </div>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Player</th>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Team</th>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Status</th>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.players.map((player) => (
                <tr key={player.id}>
                  <td className="border-b border-line px-5 py-4">
                    <strong>{player.name}</strong>
                  </td>
                  <td className="border-b border-line px-5 py-4">{player.team}</td>
                  <td className="border-b border-line px-5 py-4">
                    <Status>{player.registration}</Status>
                  </td>
                  <td className="border-b border-line px-5 py-4">
                    {player.registration !== "Complete" && <RegistrationInviteAction playerId={player.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line p-5 text-xs leading-relaxed text-muted">
          Invite a parent or guardian from the action column. The registration
          status updates when the invited account completes the form.
        </p>
      </section>
    </>
  );
}
