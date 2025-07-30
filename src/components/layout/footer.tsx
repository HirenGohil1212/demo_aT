import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card shadow-inner mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LuxeLiquor. All rights reserved.</p>
        <div className="text-xs mt-2">
            <span>Please drink responsibly.</span>
            <span className="mx-2">|</span>
            <Link href="/login" className="hover:text-primary">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
