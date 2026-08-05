import { AppLayout } from "@/components/ui/Layout";

export default function RoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}

