
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
    const adminPhoneNumber = '917990305570'; 
    
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
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md">It seems you haven't added any spirits to your cart yet. Explore our collection and find your new favorite.</p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
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
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary">Your Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <Card key={product.id} className="flex items-start sm:items-center p-4 shadow-sm hover:shadow-md transition-shadow flex-col sm:flex-row gap-4">
              <div className="w-24 h-24 relative rounded-md overflow-hidden mr-2 sm:mr-6 flex-shrink-0 bg-white">
                <Image src={product.image} alt={product.name} fill className="object-contain" data-ai-hint={`${product.category} bottle`} />
              </div>
              <div className="flex-grow">
                <Link href={`/products/${product.id}`} className="font-bold text-lg hover:text-primary transition-colors">{product.name}</Link>
                <p className="text-sm text-muted-foreground">INR {product.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input type="number" value={quantity} readOnly className="h-8 w-14 text-center font-bold" />
                   <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right ml-auto sm:ml-4 flex flex-col sm:items-end justify-between self-stretch">
                <p className="font-bold text-lg mb-2 sm:mb-0">INR {(product.price * quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-auto" onClick={() => removeFromCart(product.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required/>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea id="shippingAddress" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Enter your full address" required/>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Enter your phone number" required/>
              </div>

              <div className="flex justify-between text-muted-foreground pt-4 border-t">
                <span>Subtotal ({itemCount} {itemCount > 1 ? 'items' : 'item'})</span>
                <span>INR {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-4 mt-2">
                <span>Total</span>
                <span>INR {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                onClick={handleWhatsAppOrder}
                disabled={!isDetailsComplete}
                title={!isDetailsComplete ? "Please fill in all your details" : "Place Order"}
              >
                <MessageSquareText className="mr-2"/>
                Place Order via WhatsApp
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
