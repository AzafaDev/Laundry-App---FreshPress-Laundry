import { MoreVertical } from "lucide-react";

const outlets = [
  {
    name: "Downtown Express",
    address: "42 Wall St, NY",
    orders: 148,
    capacity: 85,
    status: "High Load",
  },
  {
    name: "Westside Premium",
    address: "128 Broadway, NY",
    orders: 64,
    capacity: 40,
    status: "Normal",
  },
  {
    name: "Brooklyn Hub",
    address: "5th Ave, BK",
    orders: 210,
    capacity: 98,
    status: "Critical",
  },
];

const statusStyles: Record<string, string> = {
  "High Load": "bg-primary-fixed text-on-primary-fixed",
  Normal: "bg-surface-container-high text-on-surface-variant",
  Critical: "bg-error-container text-on-error-container",
};

export const OutletTable = () => (
  <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <div className="p-6 border-b border-outline-variant flex justify-between items-center">
      <h3 className="text-lg font-bold">Outlet Performance</h3>
      <button className="text-on-surface-variant">
        <MoreVertical className="w-6 h-6" />
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface-container-low text-sm text-on-surface-variant">
          <tr>
            <th className="px-6 py-4 font-bold">Outlet Name</th>
            <th className="px-6 py-4 font-bold">Current Orders</th>
            <th className="px-6 py-4 font-bold">Capacity</th>
            <th className="px-6 py-4 font-bold">Status</th>
            <th className="px-6 py-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-base divide-y divide-outline-variant">
          {outlets.map((outlet) => (
            <tr
              key={outlet.name}
              className="hover:bg-surface-container-low transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold">{outlet.name}</span>
                  <span className="text-xs text-on-surface-variant">
                    {outlet.address}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">{outlet.orders}</td>
              <td className="px-6 py-4">
                <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      outlet.status === "Critical" ? "bg-error" : "bg-primary"
                    }`}
                    style={{ width: `${outlet.capacity}%` }}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[outlet.status]}`}
                >
                  {outlet.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-primary font-bold text-sm hover:underline">
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
