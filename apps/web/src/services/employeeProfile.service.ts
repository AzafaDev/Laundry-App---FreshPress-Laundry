import { axiosInstance } from "@/lib/axios";
import { Employee } from "@/types/employee.types";

type ProfileData = Pick<Employee, "id" | "full_name" | "email" | "phone" | "avatar_url" | "role" | "outlet_id" | "outlet_name">;

export const employeeProfileService = {
  getProfile: async (): Promise<ProfileData> => {
    const { data } = await axiosInstance.get<{ success: true; data: ProfileData }>(
      "/v1/employee/profile",
      { withCredentials: true },
    );
    return data.data;
  },

  updateProfile: async (payload: { full_name?: string; phone?: string }): Promise<ProfileData> => {
    const { data } = await axiosInstance.patch<{ success: true; data: ProfileData }>(
      "/v1/employee/profile",
      payload,
      { withCredentials: true },
    );
    return data.data;
  },

  updateAvatar: async (file: File): Promise<ProfileData> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await axiosInstance.patch<{ success: true; data: ProfileData }>(
      "/v1/employee/profile/avatar",
      formData,
      { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },
};
