import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
