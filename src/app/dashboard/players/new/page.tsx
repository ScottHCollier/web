import { getMemberApiContext } from "@/lib/member-api";
import { PageHeading } from "@/components/page-ui";
import { PlayerCreateForm } from "@/components/player-create-form";

export default async function NewPlayerPage() {
  const { teams } = await getMemberApiContext();
  return <><PageHeading title="Add player" description="Add a player and invite their parent or guardian." /><PlayerCreateForm teams={teams} /></>;
}
