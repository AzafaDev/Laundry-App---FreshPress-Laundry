import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { shiftService } from "@/services/shift.service";
import type {
  CreateWorkShiftPayload,
  UpdateWorkShiftPayload,
  WorkShiftListQuery,
  AssignEmployeeShiftPayload,
} from "@/types/shift.types";

const SHIFTS_KEY = ["admin", "shifts"] as const;

// ── WorkShift queries ─────────────────────────────────────────────────────────

export const useWorkShifts = (query: WorkShiftListQuery = {}) =>
  useQuery({
    queryKey: [...SHIFTS_KEY, query],
    queryFn: () => shiftService.list(query),
    placeholderData: keepPreviousData,
  });

export const useCreateWorkShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkShiftPayload) =>
      shiftService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHIFTS_KEY }),
  });
};

export const useUpdateWorkShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkShiftPayload }) =>
      shiftService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHIFTS_KEY }),
  });
};

export const useDeactivateWorkShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SHIFTS_KEY }),
  });
};

// ── EmployeeShift queries ─────────────────────────────────────────────────────

export const useEmployeeShifts = (employeeId: string | null) =>
  useQuery({
    queryKey: ["admin", "employees", employeeId, "shifts"],
    queryFn: () => shiftService.listEmployeeShifts(employeeId!),
    enabled: !!employeeId,
  });

export const useAssignEmployeeShift = (employeeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignEmployeeShiftPayload) =>
      shiftService.assignEmployeeShift(employeeId, payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["admin", "employees", employeeId, "shifts"],
      }),
  });
};

export const useRemoveEmployeeShift = (employeeId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shiftRecordId: string) =>
      shiftService.removeEmployeeShift(employeeId, shiftRecordId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["admin", "employees", employeeId, "shifts"],
      }),
  });
};
