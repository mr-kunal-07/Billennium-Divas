import LayoutWrapper from "@/components/AfterLogin/LayoutWrapper";
import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <LayoutWrapper>{children}</LayoutWrapper>
    </AuthGuard>
  );
}