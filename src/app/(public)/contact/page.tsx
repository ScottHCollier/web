import { PageHeading } from "@/components/page-ui";
import { getPublicClub } from "@/lib/public-club";
import { getAuthenticatedApiUser } from "@/lib/auth";
import { PublicContactEditor } from "@/components/public-contact-editor";

export const metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { club } = await getPublicClub();
  const user = await getAuthenticatedApiUser();
  const membership = user?.memberships.find((item) => item.club_id === club.id);
  const canEdit = membership?.role === "owner" || membership?.role === "admin";
  const { edit } = await searchParams;
  if (canEdit && edit === "1") return <><PageHeading eyebrow="GET INVOLVED" title="Contact" description={`Get in touch with ${club.name}.`} /><PublicContactEditor initial={club} /></>;
  return (
    <>
      <PageHeading
        eyebrow="GET INVOLVED"
        title="Contact"
        description={`Get in touch with ${club.name}.`}
      />
      <section className="panel p-6">
        <h2 className="text-lg font-medium">We’d love to hear from you</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{club.contactDescription ?? "Whether you’re interested in playing, volunteering, or supporting the club, you’re welcome here."}</p>
        {club.contactEmail ? <p className="mt-3 text-sm text-muted"><strong>Email:</strong> <a className="text-accent hover:underline" href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a></p> : null}
        {club.contactPhone ? <p className="mt-2 text-sm text-muted"><strong>Phone:</strong> <a className="text-accent hover:underline" href={`tel:${club.contactPhone}`}>{club.contactPhone}</a></p> : null}
        {club.contactAddress ? <p className="mt-2 whitespace-pre-line text-sm text-muted"><strong>Address:</strong><br />{club.contactAddress}</p> : null}
        {!club.contactEmail && !club.contactPhone && !club.contactAddress ? <p className="mt-3 text-sm text-muted">Contact details will be published here soon.</p> : null}
        {club.instagramUrl || club.facebookUrl ? <div className="mt-5 flex gap-4 text-sm">{club.instagramUrl ? <a className="text-accent hover:underline" href={club.instagramUrl}>Instagram ↗</a> : null}{club.facebookUrl ? <a className="text-accent hover:underline" href={club.facebookUrl}>Facebook ↗</a> : null}</div> : null}
      </section>
    </>
  );
}
