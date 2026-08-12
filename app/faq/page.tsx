import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import ContactClient from "../contact/ContactClient";

export default async function FaqPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return <ContactClient settings={settings} user={session} />;
}
