import { Phone, MapPin } from "lucide-react";

export const CustomerProfileCard = () => (
  <div className="bg-surface-container-high/50 border border-outline-variant rounded-xl p-4 shadow-sm">
    <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
      Customer Profile
    </h3>
    <div className="flex items-center gap-3 mb-4">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9J1BaZEfvIIUi0Fjyu1UuNrnW2oQzCFd19zSjXJJo9VVU-DfS3F1ZJAWM84bn7Pwx1UKRzgkC8gYalvdBSb39d25bIAD0HsIAprAEbn_O109Ol2o4E6OAf4yvsTFX-f_Uq31inByerbxEaJk7XcxDRhA050-5IfVSRoTllkairkPkgphMHJaxVASP6N_6n5NXiG5YHXMqJmfZCmXocTYJn9qRIIxxU3yQXI4aGeJgRjsiJuz3Iexp-xRRpVcIeNGMnquy2QZgeRg"
        alt="Customer"
        className="w-12 h-12 rounded-full object-cover border-2 border-white"
      />
      <div>
        <p className="font-bold text-sm">James Arrington</p>
        <p className="text-xs text-on-surface-variant">Premium Member</p>
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <Phone className="w-[18px] h-[18px]" />
        <span className="text-xs">+1 (555) 012-3456</span>
      </div>
      <div className="flex items-center gap-2 text-on-surface-variant">
        <MapPin className="w-[18px] h-[18px]" />
        <span className="text-xs">241 Baker St, Apartment 4B</span>
      </div>
    </div>
  </div>
);
