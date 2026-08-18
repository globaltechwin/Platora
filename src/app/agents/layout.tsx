import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
