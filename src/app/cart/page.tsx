
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, MessageSquareText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, itemCount } = useCart();
  const [fullName, setFullName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const isDetailsComplete = fullName.trim() !== '' && shippingAddress.trim() !== '' && contactNumber.trim() !== '';

  const handleWhatsAppOrder = () => {
    if (!isDetailsComplete) {
      alert("Please fill in all your details before placing an order.");
      return;
    }

    const adminPhoneNumber = '917990305570'; // Hardcoded number
    
    let message = 'Hello LuxeLiquor, I would like to place an order for the following items:\n\n';
    
    cartItems.forEach(item => {
      message += `*${item.quantity}x* ${item.product.name} (@ INR ${item.product.price.toFixed(2)} each)\n`;
    });
    
    message += `\n----------------------\n`;
    message += `*Total Order Value: INR ${totalPrice.toFixed(2)}*\n\n`;
    message += `----------------------\n`;
    message += `*Delivery Details:*\n`;
    message += `*Full Name:* ${fullName}\n`;
    message += `*Shipping Address:* ${shippingAddress}\n`;
    message += `*Contact Number:* ${contactNumber}\n`;

    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center min-h-[calc(100vh-400px)]">
        <ShoppingCart className="mx-auto h-24 w-24 text-primary mb-6" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md">It seems you haven't added any spirits to your cart yet. Explore our collection and find your new favorite.</p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg rounded-full px-8 py-6 font-bold shadow-lg hover:scale-105 transition-transform">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-12 text-primary">Your Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map(({ product, quantity }) => (
            <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-md">
                        <Image src={product.image} alt={product.name} fill className="object-contain p-2" data-ai-hint={`${product.category} bottle`} />
                    </div>
                    
                    <div className="flex-grow w-full flex flex-col items-center text-center md:items-start md:text-left">
                        <span className="font-headline text-xl font-bold text-primary transition-colors">{product.name}</span>
                        <p className="text-lg font-semibold text-primary/90 mt-1">INR {product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateQuantity(product.id, quantity - 1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={quantity} readOnly className="h-9 w-14 text-center font-bold bg-transparent border-x-0 border-t-0 border-b-2 border-primary/50 focus-visible:ring-0" />
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateQuantity(product.id, quantity + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="text-center md:text-right md:ml-4 flex-shrink-0">
                        <p className="font-bold text-xl">INR {(product.price * quantity).toFixed(2)}</p>
                    </div>

                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive self-center flex-shrink-0" onClick={() => removeFromCart(product.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl shadow-primary/10 border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required className="text-lg h-12"/>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="shippingAddress" className="text-base">Shipping Address</Label>
                  <Textarea id="shippingAddress" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Enter your full address" required className="text-lg"/>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-base">Contact Number</Label>
                  <Input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Enter your phone number" required className="text-lg h-12"/>
              </div>

              <div className="flex justify-between text-lg text-muted-foreground pt-6 border-t-2 border-dashed border-primary/20">
                <span>Subtotal ({itemCount} {itemCount > 1 ? 'items' : 'item'})</span>
                <span className="font-medium">INR {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-3xl text-primary border-t-2 pt-4 mt-2">
                <span className="font-headline">Total</span>
                <span>INR {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full h-14 font-bold text-lg sm:text-xl bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:scale-100 disabled:shadow-none" 
                onClick={handleWhatsAppOrder}
                disabled={!isDetailsComplete}
                title={!isDetailsComplete ? "Please fill in all your details" : "Place Order"}
              >
                <MessageSquareText className="mr-3 h-6 w-6"/>
                Place Order via WhatsApp
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
