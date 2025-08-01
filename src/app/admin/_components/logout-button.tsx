"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

export function LogoutButton({ onLinkClick }: { onLinkClick?: () => void }) {
    const router = useRouter();

    const handleLogout = async () => {
        // First, navigate to the home page.
        router.push('/');
        
        // Then, sign the user out.
        await auth.signOut();

        // Close the mobile menu if it's open.
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
