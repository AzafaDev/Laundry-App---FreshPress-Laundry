"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Shirt,
  Mail,
  ShieldCheck,
  ShieldOff,
  Headphones,
  ArrowLeft,
  Truck,
  User,
  Home,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";

// Mobile bottom navigation – matches the dashboard app shell
const BottomNavMobile = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-sm px-md pb-safe border-t border-outline-variant shadow-lg rounded-t-xl">
    <NavTab icon={Home} label="Home" />
    <NavTab icon={Shirt} label="Orders" />
    <NavTab icon={Truck} label="Pickup" />
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
    className={`flex flex-col items-center justify-center gap-0.5 ${
      active ? "text-primary font-bold" : "text-on-surface-variant"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </a>
);

export default function AccessDeniedPage() {
  // Placeholder actions – integrate real API calls here
  const handleResendVerification = () => {
    // TODO: call resend verification endpoint
    console.log("Resending verification email...");
  };

  const handleContactSupport = () => {
    // TODO: redirect to support or open modal
    console.log("Contact support clicked");
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased overflow-x-hidden">
      {/* Sticky Top Navigation (reuses existing TopBar) */}
      <TopBar />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-md md:p-xl bg-surface-container-low">
        <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-12 gap-lg items-center">
          {/* Left: Visual / Context */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-md">
            <div className="relative w-full aspect-square max-w-[320px] md:max-w-none rounded-xl overflow-hidden shadow-lg border border-outline-variant">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJhsG27Pt5__xppq4LsIEidiZSJqgFi-B7tiUhOsjn7Q12XvEPHbioTIrY08dXq-ZWME9SPFqoLYLd6-zHcU6scIYJ9ogSN3RQVe72bsXr94T8T0_YSkXz2pBnKhJhL_ENdoAtbTMp7pynZh25mKR3noYcL548ufHRXud2wiaS-Qmpwx3rIkObJuaogIk-R796Xs2AjacvYGJaF4QJy_EjVMLq9WOFnVymGUHpsDOS3kuufHjGp9nsp0HOQeS7vj3mao2HOWm_os4"
                alt="A professional modern office interior with a clean glass partition and subtle teal accents, showing a secure digital interface."
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            <div className="bg-secondary-container p-md rounded-lg w-full">
              <div className="flex items-center gap-sm text-on-secondary-container">
                <ShieldCheck className="w-5 h-5" />
                <p className="font-label-md text-label-md">
                  Secure Authorization System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Stacked Error Cards */}
          <div className="md:col-span-7 flex flex-col gap-md">
            {/* Main Error Card */}
            <div className="bg-surface border border-outline-variant p-xl rounded-xl shadow-sm">
              <div className="mb-lg">
                <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center mb-md">
                  <ShieldOff className="text-error w-8 h-8" />
                </div>
                <h1 className="text-headline-lg font-headline-lg text-on-surface mb-xs">
                  Access Restricted
                </h1>
                <p className="text-body-lg text-on-surface-variant">
                  It looks like you don&apos;t have the necessary permissions to
                  access this feature, or your account requires further
                  verification.
                </p>
              </div>

              <div className="space-y-md mb-xl">
                {/* Email Verification Required */}
                <div className="flex gap-md p-md bg-surface-container rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                  <div className="flex-shrink-0">
                    <Mail className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface">
                      Email Verification Required
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      Please confirm your email address to unlock all
                      administrative features and dashboard access.
                    </p>
                  </div>
                </div>

                {/* Permission Mismatch */}
                <div className="flex gap-md p-md bg-surface-container rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                  <div className="flex-shrink-0">
                    <ShieldOff className="text-secondary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface">
                      Permission Mismatch
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      Your current role (Staff) does not include access to
                      &apos;Inventory Management&apos;. Contact your Super Admin
                      for upgrades.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-md">
                <button
                  onClick={handleResendVerification}
                  className="flex-1 bg-primary text-on-primary h-12 px-xl rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
                >
                  <Mail className="w-5 h-5" />
                  Resend Verification
                </button>
                <button
                  onClick={handleContactSupport}
                  className="flex-1 border border-outline text-primary h-12 px-xl rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
                >
                  <Headphones className="w-5 h-5" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Footer Quick Links */}
            <div className="flex justify-between items-center px-md text-label-sm font-label-sm text-on-surface-variant">
              <Link
                href="/dashboard"
                className="hover:text-primary transition-colors flex items-center gap-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <span className="opacity-40">System ID: FP-AUTH-882</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavMobile />
    </div>
  );
}
