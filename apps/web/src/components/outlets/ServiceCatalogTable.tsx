import { Shirt, Pencil, Trash2, ChevronDown, ListFilter } from "lucide-react";

interface Service {
  name: string;
  category: string;
  price: string;
  type: string;
}

interface ServiceCatalogTableProps {
  services: Service[];
}

export function ServiceCatalogTable({ services }: ServiceCatalogTableProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Service Catalog &amp; Pricing</h3>
        <button className="text-primary font-bold text-sm flex items-center gap-1">
          <ListFilter className="w-5 h-5" />
          Filter Categories
        </button>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-6 py-4 text-sm font-bold">Item &amp; Service</th>
              <th className="px-6 py-4 text-sm font-bold">Category</th>
              <th className="px-6 py-4 text-sm font-bold text-right">Base Price</th>
              <th className="px-6 py-4 text-sm font-bold text-right">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {services.map((service, idx) => (
              <tr
                key={idx}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-1 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{service.name}</p>
                      <p className="text-xs text-on-surface-variant">{service.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-surface-container-high text-on-surface text-xs rounded-full">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold">{service.price}</td>
                <td className="px-6 py-4 text-right">
                  <span className="text-primary text-xs font-bold">Active</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-1 hover:bg-surface-container-high rounded-full transition-colors" aria-label="Edit service">
                      <Pencil className="w-5 h-5 text-on-surface-variant" />
                    </button>
                    <button className="p-1 hover:bg-error-container rounded-full transition-colors" aria-label="Delete service">
                      <Trash2 className="w-5 h-5 text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-surface-container-low flex items-center justify-center">
          <button className="text-primary font-bold text-sm flex items-center gap-1">
            View All 42 Items
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
