/** A-8 리그 설정 — screen-design-admin.md §A-8 */
import { PageHeader } from "@/components/navigation/page-header";
import { ConsoleHeader } from "@/features/admin/console-header";
import { LeagueForm } from "@/features/admin/league-form";
import { getLeague } from "@/lib/data/admin";
import { REGIONS } from "@/mocks/data";

export default async function LeaguePage(props: PageProps<"/admin/league">) {
  const sp = await props.searchParams;
  const league = await getLeague();
  return (
    <>
      <ConsoleHeader>
        <PageHeader title="리그 설정" />
      </ConsoleHeader>
      <LeagueForm league={league} regions={REGIONS} focusAccount={sp.focus === "account"} />
    </>
  );
}
