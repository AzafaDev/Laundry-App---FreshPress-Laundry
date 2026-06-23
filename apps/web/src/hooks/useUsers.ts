import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserListQuery,
} from "@/types/user.types";

const USERS_KEY = ["admin", "users"] as const;

export const useUsers = (query: UserListQuery = {}) =>
  useQuery({
    queryKey: [...USERS_KEY, query],
    queryFn: () => userService.list(query),
    placeholderData: keepPreviousData,
  });

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: [...USERS_KEY, "detail", id],
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useHardDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.hardRemove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};
