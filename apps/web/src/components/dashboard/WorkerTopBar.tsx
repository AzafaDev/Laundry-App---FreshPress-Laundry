import { Shirt, Bell } from "lucide-react";

export const WorkerTopBar = () => (
  <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
    <div className="flex items-center gap-2">
      <Shirt className="text-primary w-6 h-6" />
      <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
    </div>
    <div className="flex items-center gap-4">
      <Bell className="text-on-surface-variant w-6 h-6" />
      <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center border border-outline-variant overflow-hidden">
        <img
          alt="User Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgk_VMWoJ6Pxce8P5v1VXiFXBwbRDZIOjgEFSka7eqCyOjd4dSLFOJNalc9JpVUAq0zOIi8ar98mFJLI5qrY2AWY_cCFyDDXxbZ0sIQ6Z61WVbQ6rWoUa-cH0d8neHX2NK9f06vwZ5fKVmE9v4PEexWUVOEI0sIh9IBv1ONufBAGwdA89WW8zpra7_ddp-_dah_vq6fCj3aV02JCgn5no-8C-9VJR0RR4MJE3cvY7ju9uywC6RzKixIOYda05yTBwx1sbKNMDs8qY"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </header>
);
