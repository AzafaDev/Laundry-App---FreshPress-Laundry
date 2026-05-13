"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  ClipboardList,
  CheckCircle,
  Camera,
  ArrowRight,
  Navigation,
  Shirt,
  Truck,
  Home,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TaskDetailPage() {
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Custom Top Bar with back arrow */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/driver"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="text-primary w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary">Task Detail</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1_9oQBGxO9Zxokoa7WgRy1Rt7k2Jk516mOBTh6RXSOxNqnzlSsKRBWClPutO-ny4F5FwtKXxejBbg_E8wT7GmhkadZRbEk6Y9KjB38bBbtW4YdJvvwTGCIWS2njUWdnHGcOWt_y4URarEY_lKCxOJYIFYpR7E7nvd2a8UeDTcqXvetD8EXD4aIpffmW-m3rOYgSxSylkYnDoSCnxJ_9ujYVAIK-_SeGhEVnsls95gMwYE1bHGXfSDwREKPOmnPr9WIvwmQaBYhIo"
            alt="Driver avatar"
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
        </div>
      </header>

      <main className="max-w-container-max mx-auto p-4 md:p-8 lg:flex lg:gap-8">
        {/* Left Column: Map & Customer Info */}
        <div className="lg:w-2/3 space-y-6">
          {/* Map Section */}
          <section className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm">
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxb4bQXhhNGaXqBm_-s67pA1lfK_F4w2jfSeG52YSXbaZ-3XvN5JyUTwVrEPt0uU09frZlp_u_DtlscGNYxoJgvft85C1lH8NoEaXFfFQaXig2YVM7Xl545gsrvLlecV1TtHeVocumgFnuzJSULFwJwMICOG2lfZFKSQ0ck0tHjAQCUZezUg7bOqWTzNiVF9uIfNpSuR7enrVLf32OUnLNGdYcYWddGUpRFsAm2CqiVIyUejUqiLl177P1a3J4rzugIZgfIs6Zmg0"
                alt="Map with route"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-primary-container transition-all active:scale-95">
                  <Navigation className="w-5 h-5" />
                  Open Navigation
                </button>
              </div>
            </div>
          </section>

          {/* Customer Bento Card */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-bold">
                    ACTIVE TASK
                  </span>
                  <span className="text-xs text-outline">#ORD-8829</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface mb-1">
                  Eleanor Thompson
                </h2>
                <p className="text-base text-on-surface-variant mb-6">
                  2443 Fillmore St, San Francisco, CA 94115
                </p>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 bg-surface-container-high text-primary font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-dim transition-all">
                  <Phone className="w-5 h-5" />
                  Call
                </button>
                <button className="flex-1 bg-surface-container-high text-primary font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-dim transition-all">
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
              </div>
            </div>

            {/* Order Summary & Notes */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                SPECIAL INSTRUCTIONS
              </h3>
              <div className="bg-surface-container-low p-4 rounded-lg text-base text-on-surface-variant italic">
                "Gate code is 4492. Please leave the bags on the porch under the
                awning. Handle the delicate items with extra care."
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-outline">SERVICE TYPE</p>
                  <p className="text-base font-semibold text-on-surface">
                    Premium Wash & Fold
                  </p>
                </div>
                <div>
                  <p className="text-xs text-outline">WEIGHT (EST)</p>
                  <p className="text-base font-semibold text-on-surface">
                    12.5 lbs
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Item List & Actions */}
        <div className="lg:w-1/3 mt-6 lg:mt-0 space-y-6">
          {/* Itemized List */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface">Item List</h3>
              <span className="text-sm bg-surface-container-highest px-4 py-1 rounded-full">
                4 Items
              </span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-transparent hover:border-outline-variant transition-colors">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-base font-semibold">Large Laundry Bag</p>
                    <p className="text-xs text-on-surface-variant">
                      Standard Whites & Darks
                    </p>
                  </div>
                </div>
                <span className="text-base text-on-surface">x1</span>
              </li>
              <li className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-transparent">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-base font-semibold">Duvet Cover</p>
                    <p className="text-xs text-on-surface-variant">
                      King Size / Delicates
                    </p>
                  </div>
                </div>
                <span className="text-base text-on-surface">x1</span>
              </li>
              <li className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-transparent">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-base font-semibold">Dress Shirts</p>
                    <p className="text-xs text-on-surface-variant">
                      Hanger / Light Starch
                    </p>
                  </div>
                </div>
                <span className="text-base text-on-surface">x5</span>
              </li>
            </ul>
          </section>

          {/* Photo Confirmation */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              DELIVERY CONFIRMATION
            </h3>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-8 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
              <Camera className="w-10 h-10 text-outline mb-4 group-hover:text-primary" />
              <p className="text-base font-semibold text-on-surface">
                Take or Upload Photo
              </p>
              <p className="text-xs text-outline">
                Required for completing order
              </p>
            </div>
          </section>

          {/* Large Action Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-outline-variant lg:relative lg:bg-transparent lg:border-none lg:p-0">
            <button className="w-full bg-primary-container text-on-primary-container h-16 rounded-xl text-xl font-bold shadow-lg flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all">
              Confirm Pickup
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
