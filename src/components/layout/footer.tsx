export default function Footer() {
  return (
    <footer className="bg-card shadow-inner mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LuxeLiquor. All rights reserved.</p>
        <p className="text-xs mt-2">Please drink responsibly.</p>
      </div>
    </footer>
  );
}
