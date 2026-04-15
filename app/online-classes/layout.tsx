import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Yoga Classes | Abharana Kakal",
  description:
    "Join personalised online yoga classes with Abharana Kakal. Experience guided movement, breathwork, and meditation from the comfort of your home.",
};

export default function OnlineClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
