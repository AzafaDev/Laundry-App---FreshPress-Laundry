import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

const orders = [
  {
    id: "#ORD-2841",
    customer: "James Smith",
    email: "james.s@example.com",
    status: "Processing",
    date: "Oct 24, 2023",
    total: "$42.50",
  },
  {
    id: "#ORD-2840",
    customer: "Emily Miller",
    email: "e.miller@web.com",
    status: "Ready",
    date: "Oct 23, 2023",
    total: "$12.00",
  },
  {
    id: "#ORD-2839",
    customer: "Bruce Wayne",
    email: "bruce@wayne.co",
    status: "Delivered",
    date: "Oct 23, 2023",
    total: "$85.20",
  },
  {
    id: "#ORD-2838",
    customer: "Sarah Hudson",
    email: "s.hudson@mail.com",
    status: "Issue",
    date: "Oct 22, 2023",
    total: "$24.00",
  },
];

const statusStyles: Record<string, string> = {
  Processing: "bg-primary-container text-on-primary-container",
  Ready: "bg-secondary-container text-on-secondary-container",
  Delivered: "bg-surface-container-highest text-on-surface-variant",
  Issue: "bg-error-container text-on-error-container",
};

export const OrderDataTable = () => (
  <div className="bg-surface border-x border-b border-outline-variant rounded-b-xl overflow-hidden shadow-sm">
    {/* Desktop */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="p-4 text-sm font-bold">Order ID</th>
            <th className="p-4 text-sm font-bold">Customer</th>
            <th className="p-4 text-sm font-bold">Status</th>
            <th className="p-4 text-sm font-bold">Date</th>
            <th className="p-4 text-sm font-bold">Total</th>
            <th className="p-4 text-sm font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-surface-container-lowest transition-colors"
            >
              <td className="p-4 font-bold text-primary text-sm">{order.id}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs font-bold">
                    {order.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{order.customer}</p>
                    <p className="text-xs text-on-surface-variant">
                      {order.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="p-4 text-sm">{order.date}</td>
              <td className="p-4 text-sm font-bold">{order.total}</td>
              <td className="p-4 text-right">
                <button className="p-1 hover:bg-surface-container-high rounded-lg text-on-surface-variant">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile */}
    <div className="md:hidden divide-y divide-outline-variant">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 bg-surface active:bg-surface-container-high transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-primary">{order.id}</p>
              <p className="font-bold text-sm">{order.customer}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyles[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-xs text-on-surface-variant">{order.date}</p>
            <p className="font-bold text-sm">{order.total}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-surface-container-low p-4 flex items-center justify-between">
      <p className="text-xs text-on-surface-variant">
        Showing 1 to 4 of 24 results
      </p>
      <div className="flex items-center gap-1">
        <button className="p-1 bg-surface border border-outline-variant rounded-lg opacity-50 cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="w-8 h-8 bg-primary text-on-primary rounded-lg text-xs font-bold">
          1
        </button>
        <button className="w-8 h-8 bg-surface border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high">
          2
        </button>
        <button className="w-8 h-8 bg-surface border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high">
          3
        </button>
        <button className="p-1 bg-surface border border-outline-variant rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);
