import React from "react";
import { isAdmin } from "@/lib/adminAuth";
import { getSubscribers } from "@/lib/subscriberStore";
import { getNewsletterAd } from "@/lib/adStore";
import { getSources } from "@/lib/sourceStore";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin />;
  }

  return (
    <AdminDashboard
      initialSubscribers={await getSubscribers()}
      initialAd={await getNewsletterAd()}
      initialSources={await getSources()}
    />
  );
}
