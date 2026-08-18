import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
