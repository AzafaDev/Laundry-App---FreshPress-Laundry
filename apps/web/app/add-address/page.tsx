"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  Plus,
  MapPin,
  Map,
  Info,
  Save,
  FileText,
} from "lucide-react";

const addressLabels = ["Home", "Office", "Apartment"] as const;

export default function AddAddressPage() {
  const [selectedLabel, setSelectedLabel] = useState<string>("Home");
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [courierNote, setCourierNote] = useState("");
  const [isMainAddress, setIsMainAddress] = useState(true);
  const [customLabel, setCustomLabel] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSave = () => {
    // TODO: integrate API
    console.log("Saving address:", {
      label: selectedLabel === "custom" ? customLabel : selectedLabel,
      receiverName,
      phoneNumber,
      province,
      city,
      district,
      postalCode,
      fullAddress,
      courierNote,
      isMainAddress,
    });
    alert("Address saved (simulasi).");
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Top AppBar – custom for this page */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md md:px-xl h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <Link
            href="/dashboard/profile"
            className="p-base hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="text-primary w-6 h-6" />
          </Link>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">
            Add New Address
          </h1>
        </div>
        <button className="p-base hover:bg-surface-container-high rounded-full transition-colors">
          <X className="text-on-surface-variant w-6 h-6" />
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-container-max mx-auto px-md py-lg md:py-2xl lg:grid lg:grid-cols-12 lg:gap-xl">
        {/* Form Section */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          {/* Address Label Chips */}
          <section className="flex flex-col gap-sm">
            <label className="text-label-md font-label-md text-on-surface-variant">
              Address Label
            </label>
            <div className="flex flex-wrap gap-sm">
              {addressLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    setSelectedLabel(label);
                    setShowCustomInput(false);
                  }}
                  className={`px-md py-sm rounded-lg text-label-md font-label-md transition-all ${
                    selectedLabel === label
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedLabel("custom");
                  setShowCustomInput(true);
                }}
                className={`px-md py-sm rounded-lg text-label-md font-label-md transition-all flex items-center gap-xs ${
                  selectedLabel === "custom"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-surface-container-highest"
                }`}
              >
                <Plus className="w-4 h-4" />
                Custom
              </button>
            </div>
            {showCustomInput && (
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Enter custom label..."
                className="mt-sm w-full h-10 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-body-md"
              />
            )}
          </section>

          {/* Personal Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                Receiver Name
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-md text-body-md text-on-surface-variant border-r border-outline-variant pr-sm">
                  +62
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="812 3456 7890"
                  className="w-full h-12 pl-[72px] pr-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>
          </section>

          {/* Regional Dropdowns */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface appearance-none"
              >
                <option value="">Select Province</option>
                <option value="jakarta">Jakarta</option>
                <option value="west_java">West Java</option>
                <option value="central_java">Central Java</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface appearance-none"
              >
                <option value="">Select City</option>
                <option value="south_jakarta">South Jakarta</option>
                <option value="bandung">Bandung</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface appearance-none"
              >
                <option value="">Select District</option>
                <option value="kebayoran_baru">Kebayoran Baru</option>
                <option value="tebet">Tebet</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">
                Postal Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="12110"
                className="w-full h-12 px-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>
          </section>

          {/* Detailed Address */}
          <section className="flex flex-col gap-xs">
            <label className="text-label-md font-label-md text-on-surface-variant">
              Full Address Details
            </label>
            <textarea
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Street name, building name, house number..."
              rows={3}
              className="w-full p-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline resize-none"
            />
          </section>

          {/* Courier Note */}
          <section className="flex flex-col gap-xs">
            <label className="text-label-md font-label-md text-on-surface-variant">
              Note for Courier (Optional)
            </label>
            <div className="relative flex items-center">
              <FileText className="absolute left-md text-outline w-5 h-5" />
              <input
                type="text"
                value={courierNote}
                onChange={(e) => setCourierNote(e.target.value)}
                placeholder="e.g. Near the green gate, leave at security"
                className="w-full h-12 pl-xl pr-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>
          </section>

          {/* Main Address Toggle */}
          <section className="flex items-center justify-between p-md bg-surface-container-low rounded-xl border border-outline-variant">
            <div className="flex flex-col">
              <span className="text-label-md font-label-md text-on-surface font-bold">
                Set as Main Address
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Make this your primary shipping and pickup location.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMainAddress}
                onChange={() => setIsMainAddress(!isMainAddress)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </section>
        </div>

        {/* Sidebar / Map Section */}
        <div className="lg:col-span-5 flex flex-col gap-lg mt-xl lg:mt-0">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm sticky top-24">
            <div className="h-64 relative group">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCe4MYlq4AvwxiCxRYx-YzpiHvfQExxYpQAUqC6DHpcB38TIyQBgkqDmLwNwkmncOiwiB3kbjaErpqwMaeNYTpMKKtcZjccL2sNiKmMVlhqlh6FsoRYKn_6dQJEFVLZ2EjaieTt5_AFf3lclpGMz1GZFaLHIZoxdu7mV9ZT_COg4KS9j-J4gXIZ1gVYRmtfh9IHibG8SX_4_wffCI0PQtA_7VL17FpdrQPoo4r_DL-EPUecpwwrj34DHKVvhbVTdLICiREN-35vaY"
                alt="Map showing location"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg scale-110">
                  <MapPin className="w-6 h-6 fill-current" />
                </div>
              </div>
              <button className="absolute bottom-md left-1/2 -translate-x-1/2 bg-surface text-primary px-lg py-sm rounded-full shadow-lg border border-outline-variant flex items-center gap-sm text-label-md font-label-md hover:scale-105 transition-transform active:scale-95">
                <Map className="w-5 h-5" />
                Select from Map
              </button>
            </div>
            <div className="p-md">
              <h3 className="text-label-md font-bold text-on-surface mb-xs">
                Pinned Location
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Jalan Sudirman No. 123, Central Jakarta
              </p>
            </div>
            <div className="p-md border-t border-outline-variant bg-surface-container-low">
              <p className="text-label-sm text-on-surface-variant italic flex items-start gap-xs">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Pinning your location on the map helps our couriers find you
                much faster.
              </p>
            </div>
          </div>

          {/* Desktop Save Button */}
          <div className="hidden lg:block">
            <button
              onClick={handleSave}
              className="w-full h-14 bg-primary text-on-primary rounded-xl text-headline-md font-headline-md font-bold shadow-lg hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-md"
            >
              Save Address
              <Save className="w-6 h-6" />
            </button>
            <p className="text-center text-label-sm text-outline mt-md">
              By saving, you agree to our Service Area Terms.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-md bg-surface border-t border-outline-variant z-50">
        <button
          onClick={handleSave}
          className="w-full h-14 bg-primary text-on-primary rounded-xl text-body-lg font-bold shadow-lg flex items-center justify-center gap-md"
        >
          Save Address
          <Save className="w-6 h-6" />
        </button>
      </div>

      {/* Spacer for mobile */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
