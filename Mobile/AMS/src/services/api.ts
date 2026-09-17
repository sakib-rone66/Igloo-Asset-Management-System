// src/services/api.ts

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";
import {
  Asset,
  AssetHistoryRecord,
  AssetRequestItem,
  CheckInRecord,
  DistrictRef,
  DistributorRef,
  OutletRef,
  RegionRef,
  RepairItem,
} from "./apiTypes";

// ========================================
// API URL RESOLUTION
// ========================================

const CUSTOM_API_URL_KEY = "igloo_custom_api_url";
const TOKEN_KEY = "igloo_auth_token";

// Auto-detect debugger host (e.g. Expo Go on physical device)
const getDebuggerHost = (): string | null => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        return `http://${ip}:3000/api`;
      }
    }
  } catch {
    // Ignore error
  }
  return null;
};

// Default fallbacks
const DEFAULT_FALLBACK_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web"
    ? "http://localhost:3000/api"
    : Platform.OS === "android"
      ? "http://10.0.2.2:3000/api"
      : "http://192.168.22.33:3000/api");

let cachedApiUrl: string | null = null;

export const getApiBaseUrl = async (): Promise<string> => {
  if (cachedApiUrl) return cachedApiUrl;

  try {
    const customUrl = await SecureStore.getItemAsync(CUSTOM_API_URL_KEY);
    if (customUrl && customUrl.trim()) {
      cachedApiUrl = customUrl.trim();
      return cachedApiUrl;
    }
  } catch {
    // Ignore secure store read failure
  }

  const detected = getDebuggerHost();
  if (detected) {
    cachedApiUrl = detected;
    return cachedApiUrl;
  }

  cachedApiUrl = DEFAULT_FALLBACK_URL;
  return cachedApiUrl;
};

export const setCustomApiUrl = async (url: string | null): Promise<void> => {
  if (url && url.trim()) {
    const trimmed = url.trim().replace(/\/+$/, "");
    await SecureStore.setItemAsync(CUSTOM_API_URL_KEY, trimmed);
    cachedApiUrl = trimmed;
  } else {
    await SecureStore.deleteItemAsync(CUSTOM_API_URL_KEY);
    cachedApiUrl = null;
  }
};

export const getCustomApiUrl = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(CUSTOM_API_URL_KEY);
  } catch {
    return null;
  }
};

export const testConnection = async (
  testUrl?: string,
): Promise<{ ok: boolean; url: string; message: string }> => {
  const url = testUrl
    ? testUrl.trim().replace(/\/+$/, "")
    : await getApiBaseUrl();
  try {
    const rootUrl = url.replace(/\/api$/, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${rootUrl}/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      return { ok: true, url, message: "Backend server reached successfully!" };
    }
    return { ok: false, url, message: `Server returned HTTP ${res.status}` };
  } catch (err: any) {
    return {
      ok: false,
      url,
      message:
        err.name === "AbortError"
          ? "Connection timed out"
          : "Unable to reach server",
    };
  }
};

export const API_BASE_URL = DEFAULT_FALLBACK_URL;

// ========================================
// API ERROR
// ========================================

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status = 0, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ========================================
// TOKEN MANAGEMENT
// ========================================

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Get Token Error:", error);
    return null;
  }
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Save Token Error:", error);
    throw new Error("Unable to securely save authentication token");
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Remove Token Error:", error);
  }
};

// ========================================
// BASE REQUEST FUNCTION
// ========================================

const request = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  try {
    const baseUrl = await getApiBaseUrl();
    const token = await getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    // Add a 10s timeout to prevent hanging UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // Auto-clear session on 401
      if (response.status === 401) {
        await removeToken();
      }

      throw new ApiError(
        data?.message || "Something went wrong",
        response.status,
        data,
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    const isTimeout = error.name === "AbortError";
    throw new ApiError(
      isTimeout
        ? "Server request timed out. Please verify your connection."
        : "Unable to connect to the server. Please verify your server IP.",
      0,
      null,
    );
  }
};

// ========================================
// AUTHENTICATION API
// ========================================

export const authApi = {
  login: async (email: string, password: string) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!data?.token) {
      throw new ApiError("Login token was not received from server");
    }

    await saveToken(data.token);
    return data;
  },

  getProfile: async () => {
    return await request("/auth/profile", { method: "GET" });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return await request("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  forgotPassword: async (email: string) => {
    return await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return await request(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  logout: async () => {
    await removeToken();
  },
};

export const userApi = {
  updateMyProfile: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }) => {
    return await request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  uploadMyProfilePicture: async (uri: string) => {
    const baseUrl = await getApiBaseUrl();
    const token = await getToken();
    const fileName = uri.split("/").pop() || "profile-picture.jpg";
    const extension = fileName.split(".").pop()?.toLowerCase();
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";
    const fileBlob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", uri, true);
      xhr.responseType = "blob";
      xhr.onload = () => {
        if (xhr.response) resolve(xhr.response);
        else
          reject(new ApiError("Unable to read the selected profile picture"));
      };
      xhr.onerror = () =>
        reject(new ApiError("Unable to read the selected profile picture"));
      xhr.send();
    });

    const uploadBlob = fileBlob.type
      ? fileBlob
      : new Blob([fileBlob], { type: mimeType });
    const formData = new FormData();

    formData.append("profilePicture", uploadBlob, fileName);

    const response = await fetch(`${baseUrl}/users/me/profile-picture`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || "Unable to upload profile picture",
        response.status,
        data,
      );
    }

    return data;
  },
};

// ========================================
// ASSET API
// ========================================

export const assetApi = {
  getAssets: async (
    params: {
      status?: string;
      ain?: string;
      serialNumber?: string;
      outlet?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    assets: Asset[];
    totalAssets: number;
    currentPage: number;
    totalPages: number;
  }> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.ain) query.append("ain", params.ain);
    if (params.serialNumber) query.append("serialNumber", params.serialNumber);
    if (params.outlet) query.append("outlet", params.outlet);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    return await request(`/assets${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getAssetById: async (id: string): Promise<{ asset: Asset }> => {
    return await request(`/assets/${id}`, { method: "GET" });
  },

  getAssetByAIN: async (ain: string): Promise<{ asset: Asset }> => {
    return await request(`/assets/ain/${encodeURIComponent(ain)}`, {
      method: "GET",
    });
  },

  getPublicAssetByQR: async (qrId: string): Promise<{ asset: Asset }> => {
    return await request(`/assets/public/qr/${encodeURIComponent(qrId)}`, {
      method: "GET",
    });
  },

  createAsset: async (data: {
    ain: string;
    serialNumber: string;
    manufacturer: string;
    capacity: number;
    manufacturingMonth: number;
    manufacturingYear: number;
  }) => {
    return await request("/assets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  assignAsset: async (id: string, outletId: string, remarks?: string) => {
    return await request(`/assets/${id}/assign`, {
      method: "PUT",
      body: JSON.stringify({ outletId, remarks }),
    });
  },

  transferAsset: async (id: string, outletId: string, remarks?: string) => {
    return await request(`/assets/${id}/transfer`, {
      method: "PUT",
      body: JSON.stringify({ outletId, remarks }),
    });
  },

  returnAsset: async (id: string, remarks?: string) => {
    return await request(`/assets/${id}/return`, {
      method: "PUT",
      body: JSON.stringify({ remarks }),
    });
  },

  getAssetHistory: async (
    assetId: string,
  ): Promise<{ history: AssetHistoryRecord[] }> => {
    return await request(`/asset-history/asset/${assetId}`, { method: "GET" });
  },
};

export const authorizationApi = {
  createAssetAuthorization: async (data: {
    capacity: number;
    manufacturingMonth: number;
    manufacturingYear: number;
    manufacturer: string;
  }) => {
    return await request("/authorizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ========================================
// CHECK-IN API
// ========================================

export const checkInApi = {
  createCheckIn: async (data: {
    checkInType: "OFFICE" | "OUTLET";
    outletId?: string;
    latitude: number;
    longitude: number;
    remarks?: string;
  }): Promise<{ message: string; checkIn: CheckInRecord }> => {
    return await request("/check-ins", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getLatestCheckIn: async (): Promise<{ checkIn: CheckInRecord | null }> => {
    try {
      return await request("/check-ins/latest", { method: "GET" });
    } catch {
      return { checkIn: null };
    }
  },

  getMyHistory: async (params?: {
    date?: string;
    timezoneOffset?: number;
  }): Promise<{
    history: CheckInRecord[];
    count: number;
  }> => {
    try {
      const query = new URLSearchParams();
      if (params?.date) query.append("date", params.date);
      if (params?.timezoneOffset !== undefined) {
        query.append("timezoneOffset", String(params.timezoneOffset));
      }
      const qs = query.toString();
      return await request(`/check-ins/history${qs ? `?${qs}` : ""}`, {
        method: "GET",
      });
    } catch {
      return { history: [], count: 0 };
    }
  },
};

// ========================================
// VERIFICATION MAPPING API
// ========================================

export const verificationApi = {
  getAssetForVerification: async (ain: string): Promise<{ asset: Asset }> => {
    return await request(
      `/verification-mappings/asset/ain/${encodeURIComponent(ain)}`,
      {
        method: "GET",
      },
    );
  },

  createVerificationMapping: async (data: {
    ain: string;
    outletId: string;
    remarks?: string;
  }) => {
    return await request("/verification-mappings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyVerificationRequests: async (): Promise<{ mappings: any[] }> => {
    return await request("/verification-mappings/my", {
      method: "GET",
    });
  },
};

// ========================================
// REQUESTS & MAINTENANCE API
// ========================================

export const requestApi = {
  getAssetRequests: async (
    params: { status?: string; search?: string } = {},
  ): Promise<{
    requests: AssetRequestItem[];
  }> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append("status", params.status);
      if (params.search) query.append("search", params.search);
      const qs = query.toString();
      const response = await request(
        `/asset-requests/my${qs ? `?${qs}` : ""}`,
        {
          method: "GET",
        },
      );
      return { requests: response.assetRequests || [] };
    } catch {
      return { requests: [] };
    }
  },

  getAllAssetRequests: async (
    params: { status?: string; search?: string } = {},
  ): Promise<{ requests: AssetRequestItem[] }> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append("status", params.status);
      if (params.search) query.append("search", params.search);
      const qs = query.toString();
      const response = await request(
        `/asset-requests/all${qs ? `?${qs}` : ""}`,
        {
          method: "GET",
        },
      );
      return { requests: response.assetRequests || [] };
    } catch {
      return { requests: [] };
    }
  },

  updateAssetRequestStatus: async (
    id: string,
    status: "APPROVED" | "REJECTED",
    remarks?: string,
  ) => {
    return await request(`/asset-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, remarks }),
    });
  },

  createAssetRequest: async (data: {
    outletId: string;
    quantity: number;
    reason: string;
    remarks?: string;
  }) => {
    return await request("/asset-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRepairs: async (
    params: { status?: string } = {},
  ): Promise<{ repairs: RepairItem[] }> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append("status", params.status);
      const qs = query.toString();
      return await request(`/repairs${qs ? `?${qs}` : ""}`, { method: "GET" });
    } catch {
      return { repairs: [] };
    }
  },

  createRepairRequest: async (data: {
    assetId: string;
    problem: string;
    serviceProvider?: string;
    remarks: string;
    repairCost?: number;
  }) => {
    return await request("/repairs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRepairAssetByAIN: async (ain: string): Promise<{ asset: Asset }> => {
    return await request(`/repairs/asset/ain/${encodeURIComponent(ain)}`, {
      method: "GET",
    });
  },

  createDisposal: async (data: {
    assetId: string;
    reason: string;
    remarks?: string;
  }) => {
    return await request("/disposals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ========================================
// INCOMING REQUESTS API
// ========================================

export const incomingRequestApi = {
  getAuthorizations: async () =>
    await request("/authorizations", { method: "GET" }),

  getMyAuthorizations: async () =>
    await request("/authorizations/my", { method: "GET" }),

  reviewAuthorization: async (id: string, decision: "APPROVED" | "REJECTED") =>
    await request(`/authorizations/${id}/decision`, {
      method: "PATCH",
      body: JSON.stringify({
        decision,
        rejectionReason:
          decision === "REJECTED" ? "Rejected from mobile app." : undefined,
      }),
    }),

  getPendingVerifications: async () =>
    await request("/verification-mappings/pending", { method: "GET" }),

  reviewVerification: async (id: string, decision: "APPROVED" | "REJECTED") =>
    await request(`/verification-mappings/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({
        decision,
        rejectionRemarks:
          decision === "REJECTED" ? "Rejected from mobile app." : undefined,
      }),
    }),

  getPendingRepairs: async () =>
    await request("/repairs/pending", { method: "GET" }),

  getMyRepairs: async () => await request("/repairs/my", { method: "GET" }),

  updateRepairStatus: async (
    id: string,
    status: "UNDER_REPAIR" | "COMPLETED",
    repairCost?: number,
    remarks?: string,
  ) =>
    await request(`/repairs/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, repairCost, remarks }),
    }),

  approveRepair: async (id: string) =>
    await request(`/repairs/${id}/approve`, { method: "PUT" }),

  rejectRepair: async (id: string) =>
    await request(`/repairs/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({
        rejectionReason: "Rejected from mobile app.",
      }),
    }),
};

// ========================================
// OUTLET & MASTER DATA API
// ========================================

export const outletApi = {
  getOutlets: async (
    params: { status?: string; search?: string } = {},
  ): Promise<{
    outlets: OutletRef[];
  }> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append("status", params.status);
      if (params.search) query.append("search", params.search);
      const qs = query.toString();
      return await request(`/outlets${qs ? `?${qs}` : ""}`, { method: "GET" });
    } catch {
      return { outlets: [] };
    }
  },

  getOutletById: async (id: string): Promise<{ outlet: OutletRef }> => {
    return await request(`/outlets/${id}`, { method: "GET" });
  },

  createOutlet: async (data: {
    name: string;
    code?: string;
    type?: string;
    address?: string;
    district?: string;
    contactPerson?: string;
    phone?: string;
    status?: string;
  }): Promise<{ message: string; outlet: OutletRef }> => {
    return await request("/outlets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateOutlet: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      type?: string;
      address?: string;
      district?: string;
      distributor?: string;
      contactPerson?: string;
      phone?: string;
    },
  ): Promise<{ message: string; outlet: OutletRef }> => {
    return await request(`/outlets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getOutletAssets: async (outletId: string): Promise<{ assets: Asset[] }> => {
    try {
      return await request(`/assets?outlet=${encodeURIComponent(outletId)}`, {
        method: "GET",
      });
    } catch {
      return { assets: [] };
    }
  },

  getRegions: async (): Promise<{ regions: RegionRef[] }> => {
    try {
      return await request("/regions", { method: "GET" });
    } catch {
      return { regions: [] };
    }
  },

  getDistricts: async (
    regionId?: string,
  ): Promise<{ districts: DistrictRef[] }> => {
    try {
      const endpoint = regionId
        ? `/districts?region=${regionId}`
        : "/districts";
      return await request(endpoint, { method: "GET" });
    } catch {
      return { districts: [] };
    }
  },

  getDistributors: async (
    districtId?: string,
  ): Promise<{ distributors: DistributorRef[] }> => {
    try {
      const endpoint = districtId
        ? `/distributors?district=${districtId}`
        : "/distributors";
      return await request(endpoint, { method: "GET" });
    } catch {
      return { distributors: [] };
    }
  },

  getManufacturers: async () => {
    try {
      return await request("/manufacturers", { method: "GET" });
    } catch {
      return { manufacturers: [] };
    }
  },
};

// ========================================
// DASHBOARD STATS API
// ========================================

export const dashboardApi = {
  getStats: async () => {
    try {
      const [totalRes, inStockRes, assignedRes, disposedRes, latestCheckInRes] =
        await Promise.allSettled([
          request("/assets?page=1&limit=1"),
          request("/assets?status=IN_STOCK&page=1&limit=1"),
          request("/assets?status=ASSIGNED&page=1&limit=1"),
          request("/assets?status=DISPOSED&page=1&limit=1"),
          request("/check-ins/latest"),
        ]);

      return {
        totalAssets:
          totalRes.status === "fulfilled"
            ? totalRes.value?.totalAssets || 0
            : 0,
        inStockAssets:
          inStockRes.status === "fulfilled"
            ? inStockRes.value?.totalAssets || 0
            : 0,
        assignedAssets:
          assignedRes.status === "fulfilled"
            ? assignedRes.value?.totalAssets || 0
            : 0,
        disposedAssets:
          disposedRes.status === "fulfilled"
            ? disposedRes.value?.totalAssets || 0
            : 0,
        latestCheckIn:
          latestCheckInRes.status === "fulfilled"
            ? latestCheckInRes.value?.checkIn || null
            : null,
      };
    } catch {
      return {
        totalAssets: 0,
        inStockAssets: 0,
        assignedAssets: 0,
        disposedAssets: 0,
        latestCheckIn: null,
      };
    }
  },
};

// ========================================
// GENERAL API
// ========================================

export const api = {
  get: async (endpoint: string) => {
    return await request(endpoint, { method: "GET" });
  },

  post: async (endpoint: string, body?: any) => {
    return await request(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch: async (endpoint: string, body?: any) => {
    return await request(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put: async (endpoint: string, body?: any) => {
    return await request(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete: async (endpoint: string) => {
    return await request(endpoint, { method: "DELETE" });
  },
};

export default api;
