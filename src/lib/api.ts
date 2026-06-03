const API = import.meta.env.VITE_API_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("vault_token");
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export async function apiSignup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API}/loginWithEmail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Documents API
export async function apiGetDocuments(params?: {
  category?: string;
  favorite?: boolean;
  archived?: boolean;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.favorite) queryParams.append("favorite", "true");
  if (params?.archived) queryParams.append("archived", "true");
  if (params?.search) queryParams.append("search", params.search);

  const url = `${API}/api/documents${queryParams.toString() ? `?${queryParams}` : ""}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.data || [];
}

export async function apiUploadDocument(
  file: File,
  metadata: {
    name?: string;
    category?: string;
    type?: string;
    tags?: string[];
    metadata?: any;
    folder?: string;
  }
) {
  const formData = new FormData();
  formData.append("file", file);
  
  // Always send name, category, and type (backend will use defaults if not provided, but it's better to be explicit)
  formData.append("name", metadata.name || file.name || `Document-${Date.now()}`);
  formData.append("category", metadata.category || "other");
  formData.append("type", metadata.type || (file.type === "application/pdf" ? "pdf" : "image"));
  
  if (metadata.folder) {
    formData.append("folder", metadata.folder);
  }
  
  if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
    formData.append("tags", JSON.stringify(metadata.tags));
  }
  if (metadata.metadata && Object.keys(metadata.metadata).length > 0) {
    formData.append("metadata", JSON.stringify(metadata.metadata));
  }

  const res = await fetch(`${API}/api/documents`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Upload failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
      // Include validation errors if present
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((e: any) => e.msg || e.message).join(", ");
        if (validationErrors) {
          errorMessage += `: ${validationErrors}`;
        }
      }
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch (e2) {
        // Ignore
      }
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  return data.data;
}

export async function apiUpdateDocument(
  id: string,
  updates: {
    name?: string;
    category?: string;
    tags?: string[];
    metadata?: any;
    isFavorite?: boolean;
    isArchived?: boolean;
    folder?: string;
  }
) {
  const res = await fetch(`${API}/api/documents/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Failed to update document");
  const data = await res.json();
  return data.data;
}

export async function apiDeleteDocument(id: string) {
  const res = await fetch(`${API}/api/documents/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete document");
  return true;
}

export async function apiArchiveDocument(id: string) {
  const res = await fetch(`${API}/api/documents/${id}/archive`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to archive document");
  const data = await res.json();
  return data.data;
}

export async function apiToggleFavorite(id: string) {
  const res = await fetch(`${API}/api/documents/${id}/favorite`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to toggle favorite");
  const data = await res.json();
  return data.data;
}

export async function apiGetActivities(limit = 50) {
  const res = await fetch(`${API}/api/activities?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch activities");
  const data = await res.json();
  return data.data || [];
}

export async function apiGetStats() {
  const res = await fetch(`${API}/api/stats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch stats");
  const data = await res.json();
  return data.data;
}

// OCR helper for Aadhaar image using tesseract.js
import Tesseract from 'tesseract.js';

/**
 * Extract text from an Aadhaar image using OCR.
 * Returns plain extracted text; caller can parse for Aadhaar number.
 */
export async function extractAadhaarText(file: File): Promise<string> {
  // Convert File to Blob URL for tesseract.js
  const imageUrl = URL.createObjectURL(file);
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: m => console.log(m), // optional progress logger
    });
    return text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function apiUpdateProfile(data: { name?: string; avatar?: string; phone?: string; gender?: string; dob?: string }) {
  const res = await fetch(`${API}/api/user/profile`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  const responseData = await res.json();
  return responseData.data;
}

export async function apiUploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API}/api/user/avatar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Profile picture upload failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }
  const responseData = await res.json();
  return responseData.data;
}

export async function apiDeleteAvatar() {
  const res = await fetch(`${API}/api/user/avatar`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let errorMessage = "Profile picture removal failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }
  const responseData = await res.json();
  return responseData.data;
}

export async function apiUploadAdhar(file: File) {
  const formData = new FormData();
  formData.append("adharImage", file);

  const res = await fetch(`${API}/api/user/adhar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Aadhaar image upload failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }
  const responseData = await res.json();
  return responseData.data;
}

export async function apiDeleteAdhar() {
  const res = await fetch(`${API}/api/user/adhar`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let errorMessage = "Aadhaar image removal failed";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }
  const responseData = await res.json();
  return responseData.data;
}

// Categories API
export async function apiGetCategories() {
  const res = await fetch(`${API}/api/categories`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data || [];
}

export async function apiCreateCategory(data: { label: string; icon: string }) {
  const res = await fetch(`${API}/api/categories`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create category");
  const responseData = await res.json();
  return responseData.data;
}

export async function apiDeleteCategory(id: string) {
  const res = await fetch(`${API}/api/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete category");
  return true;
}

// Admin API
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

export async function apiAdminGetUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API}/api/admin/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch admin users list");
  const responseData = await res.json();
  return responseData.data || [];
}

export async function apiAdminGetUserDetails(id: string): Promise<{ user: AdminUser; documents: AdminDocument[] }> {
  const res = await fetch(`${API}/api/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch user details");
  const responseData = await res.json();
  return responseData.data;
}

export async function apiAdminUpdateDocumentStatus(
  id: string,
  status: 'pending' | 'verification_sent' | 'verified'
): Promise<{ id: string; verificationStatus: string }> {
  const res = await fetch(`${API}/api/admin/documents/${id}/status`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update verification status");
  const responseData = await res.json();
  return responseData.data;
}

