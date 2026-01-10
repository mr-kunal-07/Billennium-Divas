import LayoutWrapper from "@/components/AfterLogin/LayoutWrapper";

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
    );
}