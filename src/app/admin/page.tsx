
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, LayoutGrid, Image as ImageIcon, ArrowRight } from "lucide-react";

const adminFeatures = [
    {
        href: "/admin/products",
        title: "Manage Products",
        description: "View, edit, or delete existing products in your collection.",
        icon: Package,
    },
    {
        href: "/admin/add-product",
        title: "Add New Product",
        description: "Add a new spirit to your online store.",
        icon: PlusCircle,
    },
    {
        href: "/admin/categories",
        title: "Manage Categories",
        description: "Add or remove product categories.",
        icon: LayoutGrid,
    },
    {
        href: "/admin/carousel",
        title: "Carousel Settings",
        description: "Select which products to feature on the homepage.",
        icon: ImageIcon,
    }
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center">
            <h1 className="font-headline text-3xl font-bold text-primary">Admin Dashboard</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
                <CardDescription>From here you can manage all aspects of your store. Select an option below to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    {adminFeatures.map((feature) => (
                         <Link href={feature.href} key={feature.href} className="group">
                            <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                                    <feature.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
