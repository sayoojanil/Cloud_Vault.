const API = import.meta.env.VITE_API_URL;

// Auth helpers
const getAuthToken = () => localStorage.getItem("vault_token");

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with error handling
const fetchWrapper = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    ...(options.body && !(options.body instanceof FormData) 
      ? { "Content-Type": "application/json" } 
      : {}),
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText || "Request failed";
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
      if (error.errors) {
        const validationErrors = error.errors
          .map((e: any) => e.msg || e.message)
          .filter(Boolean)
          .join(", ");
        if (validationErrors) errorMessage += `: ${validationErrors}`;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Ignore
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Auth APIs
export const apiSignup = (data: { name: string; email: string; password: string }) =>
  fetchWrapper("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiLogin = (email: string, password: string) =>
  fetchWrapper("/loginWithEmail", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// Document APIs
export const apiGetDocuments = (params?: {
  category?: string;
  favorite?: boolean;
  archived?: boolean;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.favorite) queryParams.append("favorite", "true");
  if (params?.archived) queryParams.append("archived", "true");
  if (params?.search) queryParams.append("search", params.search);

  const url = `/api/documents${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchWrapper<any[]>(url);
};

export const apiUploadDocument = (file: File, metadata: {
  name?: string;
  category?: string;
  type?: string;
  tags?: string[];
  metadata?: any;
  folder?: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", metadata.name || file.name || `Document-${Date.now()}`);
  formData.append("category", metadata.category || "other");
  formData.append("type", metadata.type || (file.type === "application/pdf" ? "pdf" : "image"));

  if (metadata.folder) formData.append("folder", metadata.folder);
  if (metadata.tags?.length) formData.append("tags", JSON.stringify(metadata.tags));
  if (metadata.metadata && Object.keys(metadata.metadata).length) {
    formData.append("metadata", JSON.stringify(metadata.metadata));
  }

  return fetchWrapper("/api/documents", {
    method: "POST",
    body: formData,
  });
};

export const apiUpdateDocument = (id: string, updates: {
  name?: string;
  category?: string;
  tags?: string[];
  metadata?: any;
  isFavorite?: boolean;
  isArchived?: boolean;
  folder?: string;
}) =>
  fetchWrapper(`/api/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const apiDeleteDocument = (id: string) =>
  fetchWrapper(`/api/documents/${id}`, {
    method: "DELETE",
  });

export const apiArchiveDocument = (id: string) =>
  fetchWrapper(`/api/documents/${id}/archive`, {
    method: "POST",
  });

export const apiToggleFavorite = (id: string) =>
  fetchWrapper(`/api/documents/${id}/favorite`, {
    method: "POST",
  });

// Activity & Stats APIs
export const apiGetActivities = (limit = 50) =>
  fetchWrapper<any[]>(`/api/activities?limit=${limit}`);

export const apiGetStats = () =>
  fetchWrapper<any>("/api/stats");

// OCR Helper
import Tesseract from 'tesseract.js';

export const extractAadhaarText = async (file: File): Promise<string> => {
  const imageUrl = URL.createObjectURL(file);
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => console.log(m),
    });
    return text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

// User Profile APIs
export const apiUpdateProfile = (data: { 
  name?: string; 
  avatar?: string; 
  phone?: string; 
  gender?: string; 
  dob?: string;
}) =>
  fetchWrapper("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiUploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return fetchWrapper("/api/user/avatar", {
    method: "POST",
    body: formData,
  });
};

export const apiDeleteAvatar = () =>
  fetchWrapper("/api/user/avatar", {
    method: "DELETE",
  });

export const apiUploadAdhar = (file: File) => {
  const formData = new FormData();
  formData.append("adharImage", file);
  return fetchWrapper("/api/user/adhar", {
    method: "POST",
    body: formData,
  });
};

export const apiDeleteAdhar = () =>
  fetchWrapper("/api/user/adhar", {
    method: "DELETE",
  });

// Categories APIs
export const apiGetCategories = () =>
  fetchWrapper<any[]>("/api/categories");

export const apiCreateCategory = (data: { label: string; icon: string }) =>
  fetchWrapper("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiDeleteCategory = (id: string) =>
  fetchWrapper(`/api/categories/${id}`, {
    method: "DELETE",
  });

// Admin APIs
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  storageUsed: number;
  storageLimit: number;
  isGuest: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  fileType: string;
  size: number;
  tags: string[];
  metadata: any;
  thumbnailUrl: string | null;
  fileUrl: string;
  isArchived: boolean;
  isFavorite: boolean;
  folder: string;
  verificationStatus: 'pending' | 'verification_sent' | 'verified';
  createdAt: string;
}

export const apiAdminGetUsers = () =>
  fetchWrapper<AdminUser[]>("/api/admin/users");

export const apiAdminGetUserDetails = (id: string) =>
  fetchWrapper<{ user: AdminUser; documents: AdminDocument[] }>(
    `/api/admin/users/${id}`
  );

export const apiAdminUpdateDocumentStatus = (
  id: string,
  status: 'pending' | 'verification_sent' | 'verified'
) =>
  fetchWrapper<{ id: string; verificationStatus: string }>(
    `/api/admin/documents/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );