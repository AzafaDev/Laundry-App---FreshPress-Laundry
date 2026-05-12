"use client";

import { useState, FormEvent } from "react";
import { RoleButton } from "@/components/ui/RoleButton";
import { InputField } from "@/components/ui/InputField";

import {
  User,
  Truck,
  Shirt,
  ShieldAlert,
  Mail,
  Lock,
  EyeOff,
  Eye,
  BadgeCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

const roles = [
  { icon: <User className="w-5 h-5" />, label: "Customer" },
  { icon: <Truck className="w-5 h-5" />, label: "Driver" },
  { icon: <Shirt className="w-5 h-5" />, label: "Worker" },
  { icon: <ShieldAlert className="w-5 h-5" />, label: "Admin" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login:", { role: roles[selectedRole].label, email, password });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-sm rounded-xl overflow-hidden min-h-[700px] border border-outline-variant">
        {/* Branding Section */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary items-center justify-center p-12 text-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfyW_Jp_vsIZvoGASs7i2fcxWB131PhQKIa_3yrPdsaS0kzCfPbFGLxI-Z-6MDlYpOqkxvr6zOWDc_ksIFVVTZmxQ8uk88AMk3LsDj_oYTAfImADWilMtU7Wntpo-i4y8H4xbG5XttF0O_5gmViB92BEy4HLXVZkRKtqO_JfpCR4aS1d0gMWHMgnV1StP_fKEvVsDSHAFZjUZNUjDeBP4AX4ZjxR5rLS9DQc7y7mA4ik5mpC2VaU7IZd6LKldQmfNzD_hH7__3iKs')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 mb-6">
              <Shirt className="w-12 h-12" />
              <h1 className="text-5xl font-bold">FreshPress</h1>
            </div>
            <p className="text-lg opacity-90 leading-relaxed">
              Join the most efficient laundry management ecosystem. Experience
              effortless garment care with precision tracking and professional
              reliability.
            </p>
            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-5 h-5 p-1 bg-primary-container rounded-full box-content" />
                <span className="text-sm font-medium">
                  Certified Hygiene Standards
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 p-1 bg-primary-container rounded-full box-content" />
                <span className="text-sm font-medium">
                  Optimized Logistics Network
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 bg-surface">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="flex items-center gap-1 text-primary mb-2">
              <Shirt className="w-9 h-9" />
              <h2 className="text-3xl font-bold">FreshPress</h2>
            </div>
            <p className="text-on-surface-variant">Cleanliness, redefined.</p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-on-surface mb-1">
                Welcome Back
              </h2>
              <p className="text-on-surface-variant">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-3">
                  Access Role
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {roles.map((role, idx) => (
                    <RoleButton
                      key={role.label}
                      icon={role.icon}
                      label={role.label}
                      active={selectedRole === idx}
                      onClick={() => setSelectedRole(idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Email */}
              <InputField
                label="Email Address"
                icon={<Mail className="w-5 h-5" />}
                type="email"
                placeholder="name@freshpress.com"
              />

              {/* Password dengan toggle visibility */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-on-surface-variant"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <InputField
                  label=""
                  icon={<Lock className="w-5 h-5" />}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  id="password"
                  rightIcon={
                    showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-grow bg-outline-variant" />
                  <span className="text-xs text-outline">OR</span>
                  <div className="h-px flex-grow bg-outline-variant" />
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-white border border-outline-variant text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
                >
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="pt-6 text-center">
                <p className="text-sm text-on-surface-variant">
                  New to FreshPress?{" "}
                  <a
                    href="#"
                    className="text-primary font-bold hover:underline"
                  >
                    Register your account
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-auto pt-12 flex flex-wrap justify-center gap-6 text-xs text-outline">
            <a href="#" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
