"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shirt,
  CreditCard,
  Lock,
  Landmark,
  Wallet,
  ShieldCheck,
  ShoppingCart,
  Info,
  Truck,
  User,
  Home,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

// Custom bottom navigation for the Payment page (active Payment tab)
const PaymentBottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-sm px-md pb-safe border-t border-outline-variant shadow-lg rounded-t-xl">
    <NavTab icon={Home} label="Home" />
    <NavTab icon={Shirt} label="Orders" />
    <NavTab icon={CreditCard} label="Payment" active />
    <NavTab icon={User} label="Profile" />
  </nav>
);

const NavTab = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex flex-col items-center justify-center transition-transform duration-150 active:scale-95 ${
      active ? "text-primary font-bold scale-95" : "text-on-surface-variant"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </a>
);

const paymentMethods = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Pay with Visa, Mastercard, or AMEX",
    icon: CreditCard,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Instant transfer from major banks",
    icon: Landmark,
  },
  {
    id: "wallet",
    label: "E-wallet",
    description: "PayPal, Apple Pay, or Google Pay",
    icon: Wallet,
  },
];

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayNow = () => {
    // TODO: integrate payment gateway
    console.log("Processing payment...");
    alert("Payment processing (simulated)");
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href="/dashboard"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/payment"
            className="text-primary font-semibold border-b-2 border-primary"
          >
            Payment
          </Link>
        </nav>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsXReDEFvgLRAWcFyasMtVPz_isUyJNIduFrhTFalw_qxkdGZp3pfl1_oeDyVs-GqkmzjtzFBMb_uJ37k1wD3-1gSfe57e6-vn1thabn06CA8acjfPgPWX8KKilmVoNH2JOkkwE-hViIx_cKlsUpAIsJeFyT_9Mz_gxj_2kUeyfOlGiWVePaG-0sKmhcEnrVBJllP9pMUibo19au4_nJ_hlsCZY5cWUtJfAzBHCsKs0bfJwOo0kzYfIoMYwmMP656kZvvRg6V7epQ"
            alt="User avatar"
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container-max mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Payment Selection Column */}
          <div className="w-full lg:w-2/3 space-y-6">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm">
              <h2 className="text-xl font-bold text-on-surface mb-6">
                Choose Payment Method
              </h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <div
                      onClick={() => setSelectedMethod(method.id)}
                      className={`group cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${
                        selectedMethod === method.id
                          ? "border-primary bg-surface-container-low"
                          : "border-outline-variant bg-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded-full flex items-center justify-center p-0.5 ${
                          selectedMethod === method.id
                            ? "border-primary"
                            : "border-outline-variant"
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="w-full h-full bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-on-surface">
                          {method.label}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {method.description}
                        </p>
                      </div>
                      <method.icon
                        className={`w-6 h-6 ${
                          selectedMethod === method.id
                            ? "text-primary"
                            : "text-outline"
                        }`}
                      />
                    </div>

                    {/* Card Details Expansion (only for Credit Card) */}
                    {method.id === "card" && selectedMethod === "card" && (
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mt-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-on-surface-variant">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                className="w-full bg-white border border-outline-variant rounded-lg p-3 pr-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="xxxx xxxx xxxx xxxx"
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-on-surface-variant">
                              Cardholder Name
                            </label>
                            <input
                              className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="John Doe"
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-on-surface-variant">
                              Expiry Date
                            </label>
                            <input
                              className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="MM/YY"
                              type="text"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-on-surface-variant">
                              CVV
                            </label>
                            <input
                              className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="***"
                              type="password"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Security Assurance */}
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <ShieldCheck className="text-primary w-5 h-5" />
              <span className="text-sm">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>

          {/* Right: Order Summary Sidebar */}
          <aside className="w-full lg:w-1/3 sticky top-24">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-on-surface border-b border-outline-variant pb-4">
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-bold text-on-surface">
                      Premium Wash & Fold
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      12kg • Regular Service
                    </p>
                  </div>
                  <span className="text-base font-bold text-on-surface">
                    $24.00
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-bold text-on-surface">
                      Dry Cleaning
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      2 Suits • Silk Care
                    </p>
                  </div>
                  <span className="text-base font-bold text-on-surface">
                    $18.50
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-bold text-on-surface">
                      Express Pickup
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      Same-day collection
                    </p>
                  </div>
                  <span className="text-base font-bold text-on-surface">
                    $5.00
                  </span>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-4 space-y-2">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-base">Subtotal</span>
                  <span className="text-base">$47.50</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-base">Tax (8%)</span>
                  <span className="text-base">$3.80</span>
                </div>
                <div className="flex justify-between pt-4 text-primary">
                  <span className="text-xl font-bold">Total Amount</span>
                  <span className="text-xl font-bold">$51.30</span>
                </div>
              </div>
              <button
                onClick={handlePayNow}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                Pay Now
              </button>
              <div className="bg-surface-container-highest rounded-lg p-4">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-secondary flex-shrink-0" />
                  <p className="text-sm text-on-surface-variant">
                    Cancellation is free until the driver is assigned to your
                    pickup.
                  </p>
                </div>
              </div>
            </div>

            {/* Promo Banner */}
            <div className="mt-6 relative overflow-hidden rounded-xl h-32 flex items-center p-6">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvW0qlHyn8I8-14cDM2f25UvIznShItVMYvdIiansmDETUfVxZSq8yE5Tjd5NTazw78NOufOHKMqVhS5ttItaniLtHBjyFn_DJU_o2iEUHZzn7SPyp1jbCVLOlabp0nwtuAbxUI_jqIbWaxABILZWbSiwnoOg8w4BMXCXUonYEip9Lt8DpeFsj61yNIkJPBNnwiVlxp47PtWmVajQGMW65KaelT0eCMi8QA71or7rcIRtGwVHtLbXFzlneRO2uizVjpehKud2679o"
                alt="Laundry loyalty"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
              <div className="relative z-10 text-white">
                <p className="text-sm font-bold">LOYALTY REWARD</p>
                <p className="text-base">Earn 52 points from this order</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <PaymentBottomNav />
    </div>
  );
}
