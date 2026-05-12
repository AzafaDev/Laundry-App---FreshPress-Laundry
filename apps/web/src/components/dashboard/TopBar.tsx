import { Bell, Menu } from "lucide-react";

export const TopBar = () => (
  <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant lg:pl-[304px]">
    <div className="flex items-center gap-2">
      <button className="lg:hidden p-1 text-primary">
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant">
        <Bell className="w-6 h-6" />
      </button>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
        <img
          alt="User Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbSaYi65KLylwuTHTDMRCH8s66AQ20PLI2yB4VItxMH3SW-2K-yaxBD0SJyaOzqBT_ESgwLrG8o9h274ApMyKpfZyqWDn9Q2zhChIlWMlFSLibZcxqUsBpOSK5Se-aghI1rfRHGgCP4BeOf6T1LMoGQrnYnhhJBJ39qXzY9kavAOyD5LycAmXSfvl_BtJnSqMOuwrgZfFe9e433LmG7xb2uKcZHrD9nE9-oyiPo8izap7gqPGD-Uho5mBYfa5hbUVcz3R4sByMBYg"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
);
