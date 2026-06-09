import { useQuery } from "@tanstack/react-query";
import { laundryItemService } from "@/services/laundryItem.service";

export const useLaundryItems = () =>
  useQuery({
    queryKey: ["laundry-items"],
    queryFn: laundryItemService.list,
  });
