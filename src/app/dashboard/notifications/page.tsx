import { PageHeading } from "@/components/page-ui";
import { NotificationList } from "@/components/notification-list";
import { getMemberNotifications } from "@/lib/member-api";

export const metadata = { title: "Notifications | Dashboard" };

export default async function NotificationsPage() {
  const notifications = await getMemberNotifications();
  return <><PageHeading title="Notifications" description="Updates about your club, fixtures, and squad." /><NotificationList initialNotifications={notifications} /></>;
}
