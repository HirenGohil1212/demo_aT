
"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

export function LogoutButton({ onLinkClick }: { onLinkClick?: () => void }) {
    const router = useRouter();

    const handleLogout = async () => {
        router.push('/');
        await auth.signOut();
        if (onLinkClick) {
            onLinkClick();
        }
    }

    return (
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2" />
            Logout
        </Button>
    )
}
