import { DocumentLibrary } from "@/components/document-library";
import { PageHeading } from "@/components/page-ui";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { listDocuments } from "@/lib/document-api";
import { canAccessRole } from "@/lib/roles";

export default async function Page() {
  const data = await getCurrentClub();
  const [documents, role] = await Promise.all([
    listDocuments(),
    getCurrentClubRole(data.club.id),
  ]);
  return (
    <>
      <PageHeading
        title="Documents"
        description="A shared home for the information your club relies on."
      />
      <DocumentLibrary
        initialDocuments={documents}
        canManage={canAccessRole(role, "admin")}
      />
    </>
  );
}
