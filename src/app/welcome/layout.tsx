import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
