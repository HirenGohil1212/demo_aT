import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>
              This is your central hub for managing the store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the navigation on the left to manage products, view orders, and configure settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
