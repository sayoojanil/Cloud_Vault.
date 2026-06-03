export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'license' | 'insurance' | 'other';
  category: DocumentCategory;
  fileType: 'pdf' | 'jpg' | 'png' | 'webp' | 'gif';
  size: number;
  uploadedAt: Date;
  modifiedAt: Date;
  tags: string[];
  metadata: DocumentMetadata;
  thumbnailUrl?: string;
  fileUrl: string;
  isArchived: boolean;
  isFavorite: boolean;
  folder?: string;
}

export interface DocumentMetadata {
  issuer?: string;
  expiryDate?: Date;
  notes?: string;
  documentNumber?: string;
}

export type DocumentCategory = string;

export interface Category {
  id: string;
  key: string;
  label: string;
  icon: string;
  isCustom?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  avatarPublicId?: string | null;
  adharImage?: string | null;
  adharImagePublicId?: string | null;
  createdAt: Date;
  storageUsed: number;
  storageLimit: number;
  isGuest: boolean;
  phone?: string;
  gender?: string;
  dob?: Date;
}

export interface StorageStats {
  used: number;
  limit: number;
  documentCount: number;
  categoryBreakdown: Record<DocumentCategory, number>;
}

export interface ActivityLog {
  id: string;
  action: 'upload' | 'view' | 'download' | 'delete' | 'rename' | 'archive';
  documentId: string;
  documentName: string;
  timestamp: Date;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-identity', key: 'identity', label: 'Identity Documents', icon: 'User', isCustom: false },
  { id: 'default-financial', key: 'financial', label: 'Financial Records', icon: 'CreditCard', isCustom: false },
  { id: 'default-medical', key: 'medical', label: 'Medical Records', icon: 'Heart', isCustom: false },
  { id: 'default-insurance', key: 'insurance', label: 'Insurance Policies', icon: 'Shield', isCustom: false },
  { id: 'default-legal', key: 'legal', label: 'Legal Documents', icon: 'Scale', isCustom: false },
  { id: 'default-personal', key: 'personal', label: 'Personal Files', icon: 'Folder', isCustom: false },
  { id: 'default-travel', key: 'travel', label: 'Travel Documents', icon: 'Plane', isCustom: false },
  { id: 'default-other', key: 'other', label: 'Other', icon: 'File', isCustom: false },
];
