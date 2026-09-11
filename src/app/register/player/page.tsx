import PlayerRegistrationForm from "./player-registration-form";

export default async function PlayerRegistrationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return <PlayerRegistrationForm token={(await searchParams).token ?? ""} />;
}
