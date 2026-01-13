import LayoutWrapper from "@/components/AfterLogin/LayoutWrapper";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <LayoutWrapper>
            {children}
            <Toaster />
        </LayoutWrapper>
    );
}