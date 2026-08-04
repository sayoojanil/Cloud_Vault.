import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  Loader2,
  List,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Archive,
  Eye,
  Edit,
  ChevronDown,
  User,
  CreditCard,
  Heart,
  Shield,
  Scale,
  Folder,
  Plane,
  File,
  Tag,
  Calendar,
  Building,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Camera,
  Share2
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVault } from '@/contexts/VaultContext';
import { Document, DocumentCategory } from '@/types/vault';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentCardSkeleton } from '@/components/ui/skeleton-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Slider,
} from '@/components/ui/slider';
import { CreateCategoryDialog } from '@/components/CreateCategoryDialog';
import { VerifyBadge } from '@/components/ui/verify-badge';

const fileTypeIcons = {
  pdf: FileText,
  jpg: ImageIcon,
  png: ImageIcon,
  webp: ImageIcon,
  gif: ImageIcon,
};

// Track last tap time for double tap detection
let lastTapTime = 0;

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, categories, isLoading, deleteDocument, archiveDocument, toggleFavorite, updateDocument, addDocument } = useVault();

  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    searchParams.get('category') as DocumentCategory | null
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(searchParams.get('action') === 'upload');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string>('');
  const [zoomImageName, setZoomImageName] = useState<string>('');
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);
  
  const uploadBellRef = useRef<HTMLAudioElement | null>(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [currentFolder, setCurrentFolder] = useState<string>('');

  // Pending Upload states
  const [pendingUploadFile, setPendingUploadFile] = useState<window.File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: 'other' as DocumentCategory,
    notes: '',
    issuer: '',
    tags: '',
    folder: ''
  });

  const [isOpeningDocument, setIsOpeningDocument] = useState(false);

  useEffect(() => {
    uploadBellRef.current = new Audio('/Doc.wav');
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (!showUploadDialog) {
      if (isCameraOpen) {
        stopCamera();
        setIsCameraOpen(false);
      }
      setPendingUploadFile(null);
    }
  }, [showUploadDialog, isCameraOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera');
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!videoRef.current) {
      toast.error('Camera video not found');
      return;
    }

    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Camera is still initializing, please wait');
      return;
    }

    const toastId = toast.loading('Processing image...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        toast.error('Failed to initialize capture context', { id: toastId });
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Manually convert data URL to File to avoid fetch() issues with data: URIs
      const base64Data = dataUrl.split(',')[1];
      const byteString = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const file = new window.File([blob], `Camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      toast.dismiss(toastId);
      
      setPendingUploadFile(file);
      setUploadFormData({
        name: `Camera-${format(new Date(), 'yyyy-MM-dd-HHmm')}`,
        category: currentFolder ? (currentFolder.split('/')[0] as DocumentCategory) : 'other',
        notes: '',
        issuer: '',
        tags: '',
        folder: currentFolder ? currentFolder.split('/').slice(1).join('/') : ''
      });
      stopCamera();
      setIsCameraOpen(false);
    } catch (err: any) {
      console.error('Capture error:', err);
      toast.error('Error taking photo: ' + (err.message || 'Unknown error'), { id: toastId });
    }
  };

  const confirmUpload = async () => {
    if (!pendingUploadFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await addDocument(pendingUploadFile, {
        name: uploadFormData.name || pendingUploadFile.name,
        category: uploadFormData.category,
        type: 'image',
        tags: uploadFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
        metadata: {
          notes: uploadFormData.notes,
          issuer: uploadFormData.issuer,
        },
        folder: uploadFormData.folder,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      uploadBellRef.current?.play().catch(() => {});
      // toast.success('Document uploaded successfully');
      
      // Close dialog after a brief delay to show completion
      setTimeout(() => {
        setShowUploadDialog(false);
        setPendingUploadFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  document.title = "Documents";

  const handleToggleFavorite = (docId: string, isFavorite: boolean) => {
    toggleFavorite(docId);

    const document = documents.find(doc => doc.id === docId);
    const docName = document ? document.name : 'Document';

    toast.success(
      isFavorite ? `${docName} removed from favorites` : `${docName} added to favorites`,
      {
        description: isFavorite
          ? "This document is no longer starred."
          : "This document has been starred.",
      }
    );
  };

  const handleImageZoom = (imageSrc: string, imageName: string) => {
    setZoomImageSrc(imageSrc);
    setZoomImageName(imageName);
    setZoomLevel(100);
    setRotation(0);
    setShowZoomModal(true);
  };

  // Open PDF in same tab
 const openPdfInSameTab = (documentId: string) => {
  try {
    setIsOpeningDocument(true);

    const token = localStorage.getItem("vault_token");
    if (!token) {
      setIsOpeningDocument(false);
      toast.error("Authentication required. Please log in again.");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      setIsOpeningDocument(false);
      toast.error("Configuration error. Please try again.");
      return;
    }

    const viewUrl = `${apiUrl}/api/documents/${documentId}/view?token=${token}`;

    // Small delay so spinner becomes visible
    setTimeout(() => {
      window.location.href = viewUrl;
    }, 300);
  } catch (error) {
    setIsOpeningDocument(false);
    toast.error("Failed to open document.");
  }
};

  // Share document
  const handleShare = async (doc: Document) => {
    try {
      const token = localStorage.getItem('vault_token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const shareUrl = `${apiUrl}/api/documents/${doc.id}/view?token=${token}`;

      if (navigator.share) {
        await navigator.share({
          title: doc.name,
          text: `Check out this document: ${doc.name}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share document');
      }
    }
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(d => !d.isArchived);

    if (searchParams.get('filter') === 'favorites') {
      filtered = filtered.filter(d => d.isFavorite);
    }

    if (selectedCategory) {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query)) ||
        d.metadata.issuer?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents, selectedCategory, searchQuery, searchParams]);

  // Folder traversal and helpers
  const currentFolderDocs = useMemo(() => {
    if (searchQuery || searchParams.get('filter') === 'favorites' || selectedCategory) {
      return filteredDocuments;
    }
    
    if (currentFolder === '') {
      return [];
    }

    if (currentFolder === 'all_files') {
      return filteredDocuments;
    }

    const parts = currentFolder.split('/');
    const currentCategory = parts[0];
    const actualFolder = parts.slice(1).join('/');

    return filteredDocuments.filter(doc => 
      doc.category === currentCategory && 
      (doc.folder || '') === actualFolder
    );
  }, [filteredDocuments, currentFolder, searchQuery, searchParams, selectedCategory]);

  const currentSubfolders = useMemo(() => {
    if (searchQuery || searchParams.get('filter') === 'favorites' || selectedCategory) {
      return [];
    }

    if (currentFolder === 'all_files') {
      return [];
    }

    if (currentFolder === '') {
      return ['all_files', ...categories.map(c => c.key).sort()];
    }

    const parts = currentFolder.split('/');
    const currentCategory = parts[0];
    const actualFolder = parts.slice(1).join('/');

    const subfoldersSet = new Set<string>();
    documents.forEach(doc => {
      if (doc.category !== currentCategory) return;
      
      const docFolder = doc.folder || '';
      
      if (actualFolder === '') {
        if (docFolder !== '') {
          const firstPart = docFolder.split('/')[0];
          if (firstPart) subfoldersSet.add(`${currentCategory}/${firstPart}`);
        }
      } else {
        if (docFolder.startsWith(actualFolder + '/')) {
          const relativePath = docFolder.substring(actualFolder.length + 1);
          const firstPart = relativePath.split('/')[0];
          if (firstPart) subfoldersSet.add(`${currentFolder}/${firstPart}`);
        }
      }
    });

    return Array.from(subfoldersSet).sort();
  }, [documents, categories, currentFolder, searchQuery, searchParams, selectedCategory]);

  const existingFolders = useMemo(() => {
    const foldersSet = new Set<string>();
    documents.forEach(doc => {
      if (doc.folder && doc.folder.trim() !== '') {
        foldersSet.add(`${doc.category}/${doc.folder.trim()}`);
      }
    });
    return Array.from(foldersSet).sort();
  }, [documents]);

  const getFolderFileCount = useCallback((folderPath: string) => {
    if (folderPath === 'all_files') {
      return documents.filter(d => !d.isArchived).length;
    }

    const parts = folderPath.split('/');
    const cat = parts[0];
    const actualFolder = parts.slice(1).join('/');
    
    return documents.filter(doc => {
      if (doc.category !== cat) return false;
      
      const docFolder = doc.folder || '';
      if (actualFolder === '') {
        return true;
      }
      
      return docFolder === actualFolder || docFolder.startsWith(actualFolder + '/');
    }).length;
  }, [documents]);

  const renderBreadcrumbs = () => {
    if (searchQuery || searchParams.get('filter') === 'favorites' || selectedCategory) {
      return null;
    }

    const parts = currentFolder ? currentFolder.split('/') : [];
    
    return (
      <div className="flex items-center gap-1.5 mb-6 text-sm text-muted-foreground overflow-x-auto py-1">
        <button 
          onClick={() => setCurrentFolder('')}
          className="hover:text-foreground font-medium transition-colors"
        >
          Categories
        </button>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          let displayName = part;
          if (index === 0) {
            if (part === 'all_files') {
              displayName = 'All Files';
            } else {
              const cat = categories.find(c => c.key === part);
              if (cat) displayName = cat.label;
            }
          }
          
          return (
            <div key={path} className="flex items-center gap-1.5">
              <span>/</span>
              <button 
                onClick={() => setCurrentFolder(path)}
                className="hover:text-foreground font-medium transition-colors max-w-[120px] truncate"
              >
                {displayName}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: window.File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (files.length === 0) {
      return;
    }

    if (files.length === 1) {
      const file = files[0];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name || 'File'} is not a supported file type. Only PDF, JPG, PNG, WebP, and GIF are allowed.`);
        return;
      }

      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast.error(`${file.name || 'File'} is too large. Maximum file size is 20MB.`);
        return;
      }
      
      setPendingUploadFile(file);
      
      let defaultName = file.name || `Document-${Date.now()}`;
      const extIndex = defaultName.lastIndexOf('.');
      if (extIndex > 0) defaultName = defaultName.substring(0, extIndex);
      
      setUploadFormData({
        name: defaultName,
        category: currentFolder ? (currentFolder.split('/')[0] as DocumentCategory) : 'other',
        notes: '',
        issuer: '',
        tags: '',
        folder: currentFolder ? currentFolder.split('/').slice(1).join('/') : ''
      });
      return;
    }

    // Multiple files upload with spinner
    setIsUploading(true);
    setUploadProgress(0);
    
    let successfulUploads = 0;
    let failedUploads = 0;
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setUploadProgress(Math.round((i / totalFiles) * 100));
        
        // Validate file type
        if (!validTypes.includes(file.type)) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is not a supported file type.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        // Validate file size (20MB limit)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
          failedUploads++;
          toast.error(`${file.name || 'File'} is too large. Maximum file size is 20MB.`, {
            id: `error-${Date.now()}`,
          });
          continue;
        }

        // Determine file type
        let fileType: 'pdf' | 'image' = file.type === 'application/pdf' ? 'pdf' : 'image';

        // Ensure file name is not empty
        const fileName = file.name || `Document-${Date.now()}`;

        try {
          await addDocument(file, {
            name: fileName,
            category: currentFolder ? (currentFolder.split('/')[0] as DocumentCategory) : 'other',
            type: fileType,
            tags: [],
            metadata: {},
            folder: currentFolder ? currentFolder.split('/').slice(1).join('/') : '',
          });
          successfulUploads++;
        } catch (error: any) {
          failedUploads++;
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name || 'file'}: ${error.message || 'Unknown error'}`, {
            id: `error-${Date.now()}`,
          });
        }
      }

      setUploadProgress(100);
      
      // Update the loading toast with result
      if (successfulUploads > 0 && failedUploads === 0) {
        uploadBellRef.current?.play().catch(() => {});
        toast.success(`Successfully uploaded ${successfulUploads} files`);
        setTimeout(() => {
          setShowUploadDialog(false);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } else if (successfulUploads > 0 && failedUploads > 0) {
        toast.warning(`Uploaded ${successfulUploads} files, ${failedUploads} failed`);
        setIsUploading(false);
        setUploadProgress(0);
      } else if (successfulUploads === 0) {
        toast.error('No files were uploaded successfully');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleFolderUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    let successfulUploads = 0;
    let failedUploads = 0;
    const totalFiles = files.length;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setUploadProgress(Math.round((i / totalFiles) * 100));
        
        // Validate file type (if it has type; sometimes directories or hidden system files have no type, skip them)
        if (file.type && !validTypes.includes(file.type)) {
          continue;
        }

        // Validate file size (20MB limit)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
          failedUploads++;
          continue;
        }

        // Extract virtual folder structure from webkitRelativePath
        const relativePath = file.webkitRelativePath || '';
        const pathParts = relativePath.split('/');
        let baseFolder = currentFolder ? currentFolder.split('/').slice(1).join('/') : '';
        let uploadCategory = currentFolder ? (currentFolder.split('/')[0] as DocumentCategory) : 'other';
        
        if (pathParts.length > 1) {
          const directoryParts = pathParts.slice(0, -1);
          const relativeFolder = directoryParts.join('/');
          baseFolder = baseFolder ? `${baseFolder}/${relativeFolder}` : relativeFolder;
        }

        const fileName = file.name || `Document-${Date.now()}`;
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';

        try {
          await addDocument(file, {
            name: fileName,
            category: uploadCategory,
            type: fileType,
            tags: [],
            metadata: {},
            folder: baseFolder,
          });
          successfulUploads++;
        } catch (error) {
          failedUploads++;
          console.error('Folder file upload error:', error);
        }
      }

      setUploadProgress(100);
      
      // Update the loading toast with result
      if (successfulUploads > 0 && failedUploads === 0) {
        uploadBellRef.current?.play().catch(() => {});
        toast.success(`Successfully uploaded folder containing ${successfulUploads} files`);
        setTimeout(() => {
          setShowUploadDialog(false);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } else if (successfulUploads > 0 && failedUploads > 0) {
        toast.warning(`Uploaded ${successfulUploads} files, ${failedUploads} failed`);
        setIsUploading(false);
        setUploadProgress(0);
      } else if (successfulUploads === 0) {
        toast.error('No files from the folder were uploaded successfully');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Folder upload failed: ' + (error.message || 'Unknown error'));
    }
  };
const handleDelete = async () => {
  if (!selectedDocument) return;

  setIsDeleting(true);

  try {
    await deleteDocument(selectedDocument.id);

    toast.success("Document deleted successfully", {
      description: `${selectedDocument.name} has been permanently deleted.`,
    });

    setShowDeleteDialog(false);
    setSelectedDocument(null);
  } catch (error) {
    toast.error("Failed to delete document", {
      description: selectedDocument?.name,
    });
    console.error("Delete error:", error);
  } finally {
    setIsDeleting(false);
  }
};

  const handleArchive = async (doc: Document) => {
    try {
      const toastId = toast.loading('Archiving document...');
      await archiveDocument(doc.id);
      toast.success('Document archived successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to archive document');
      console.error('Archive error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-surface">
        <Header />
        <main className="pt-24 pb-12 container-wide">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-surface">
      <Header />

      <AnimatePresence>
  {isOpeningDocument && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
    >
      {/* <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="flex flex-col items-center gap-4"
      > */}
       <div className="relative h-20 w-20">
  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>

  <FileText className="absolute inset-0 m-auto h-8 w-8 text-primary" />

      
</div>
  <p className="text-sm font-medium ">
  Loading document...
</p>

   

      </motion.div>
  )}
</AnimatePresence>

      <main className="pt-24 pb-12 container-wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button className="gap-2 rounded-full bg-green-500 text-white" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4" />
            Upload Documents
          </Button>
        </div>
    
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {selectedCategory ? categories.find(c => c.key === selectedCategory)?.label : 'All Categories'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => {
                  const Icon = (Icons as any)[cat.icon] || Icons.Folder;
                  return (
                    <DropdownMenuItem key={cat.key} onClick={() => setSelectedCategory(cat.key)}>
                      <Icon className="w-4 h-4 mr-2" />
                      {cat.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCreateCategoryDialog(true)}>
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Create Category...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-input rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-secondary' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-secondary' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || searchParams.get('filter') === 'favorites') && (
          <div className="flex gap-2 mb-6">
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.key === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory(null)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchParams.get('filter') === 'favorites' && (
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3" />
                Favorites
                <button onClick={() => setSearchParams({})}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {renderBreadcrumbs()}

        {/* Documents Grid/List */}
        {currentFolderDocs.length === 0 && currentSubfolders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="vault-card p-12 text-center"
          >
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
            </p>
            <Button className='rounded-full' onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2 " />
              Upload Document
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {currentSubfolders.map((folderPath) => {
                let folderName = folderPath.split('/').pop() || folderPath;
                let FolderIcon = Folder;

                if (currentFolder === '') {
                  if (folderPath === 'all_files') {
                    folderName = 'All Files';
                    FolderIcon = Icons.Files || Icons.FolderOpen;
                  } else {
                    const cat = categories.find(c => c.key === folderPath);
                    if (cat) {
                      folderName = cat.label;
                      if ((Icons as any)[cat.icon]) {
                        FolderIcon = (Icons as any)[cat.icon];
                      }
                    }
                  }
                }

                return (
                  <motion.div
                    key={`folder-${folderPath}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="vault-card-hover group cursor-pointer"
                    onClick={() => setCurrentFolder(folderPath)}
                  >
                    <div className="p-6 flex flex-col items-center justify-center gap-3 aspect-[4/3] bg-vault-surface-hover/50">
                      <FolderIcon className="w-16 h-16 text-blue-500 fill-blue-500/20" />
                      <div className="text-center">
                        <p className="font-semibold">{folderName}</p>
                        <p className="text-xs text-muted-foreground">{getFolderFileCount(folderPath)} items</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {currentFolderDocs.map((doc) => {
                const docCat = categories.find(c => c.key === doc.category) || categories.find(c => c.key === 'other');
                const CategoryIcon = (Icons as any)[docCat?.icon || 'Folder'] || Icons.Folder;
                const FileIcon = fileTypeIcons[doc.fileType];
                const catLabel = docCat?.label || 'Other';

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="vault-card-hover group"
                  >
                    <div
                      className="aspect-[4/3] bg-vault-surface rounded-none flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => openPdfInSameTab(doc.id)}
                    >
                      {doc.fileType === 'pdf' ? (
                        <FileIcon className="w-12 h-12 text-muted-foreground" />
                      ) : (
                        <img
                          src={doc.thumbnailUrl || doc.fileUrl}
                          alt={doc.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openPdfInSameTab(doc.id)}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <VerifyBadge verified={doc.isVerified ?? true} />
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CategoryIcon className="w-3 h-3" />
                            <span>{catLabel}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(doc.id, doc.isFavorite)}
                            className={`p-1 rounded hover:bg-secondary ${
                              doc.isFavorite ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${doc.isFavorite ? "fill-current" : ""}`} />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openPdfInSameTab(doc.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowEditDialog(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const token = localStorage.getItem('vault_token');
                                const apiUrl = import.meta.env.VITE_API_URL;
                                window.open(`${apiUrl}/api/documents/${doc.id}/download?token=${token}`, '_blank');
                              }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(doc)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchive(doc)}>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => { setSelectedDocument(doc); setShowDeleteDialog(true); }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">{formatBytes(doc.size)}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="vault-card divide-y divide-border"
          >
            {currentSubfolders.map((folderPath) => {
              let folderName = folderPath.split('/').pop() || folderPath;
              let FolderIcon = Folder;

              if (currentFolder === '') {
                if (folderPath === 'all_files') {
                  folderName = 'All Files';
                  FolderIcon = Icons.Files || Icons.FolderOpen;
                } else {
                  const cat = categories.find(c => c.key === folderPath);
                  if (cat) {
                    folderName = cat.label;
                    if ((Icons as any)[cat.icon]) {
                      FolderIcon = (Icons as any)[cat.icon];
                    }
                  }
                }
              }

              return (
                <div 
                  key={`folder-${folderPath}`} 
                  className="flex items-center gap-4 p-4 hover:bg-vault-surface-hover transition-colors cursor-pointer"
                  onClick={() => setCurrentFolder(folderPath)}
                >
                  <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FolderIcon className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{folderName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getFolderFileCount(folderPath)} items</p>
                  </div>
                </div>
              );
            })}
            {currentFolderDocs.map((doc) => {
              const docCat = categories.find(c => c.key === doc.category) || categories.find(c => c.key === 'other');
              const CategoryIcon = (Icons as any)[docCat?.icon || 'Folder'] || Icons.Folder;
              const FileIcon = fileTypeIcons[doc.fileType];
              const catLabel = docCat?.label || 'Other';

              return (
                <div 
                  key={doc.id} 
                  className="flex items-center gap-4 p-4 hover:bg-vault-surface-hover transition-colors cursor-pointer"
                  onClick={() => openPdfInSameTab(doc.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs truncate">{doc.name}</p>
                      <VerifyBadge verified={doc.isVerified ?? true} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        {catLabel}
                      </span>
                      <span>{formatBytes(doc.size)}</span>
                      <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="ghost" className="text-xs hidden sm:inline-flex bg-green-100 text-green-600 border-green-100">
                        {tag}
                      </Badge>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(doc.id);
                        handleToggleFavorite(doc.id, doc.isFavorite);
                      }}
                      className={`p-2 rounded hover:bg-secondary ${doc.isFavorite ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-2 rounded hover:bg-secondary text-muted-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPdfInSameTab(doc.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                          setShowEditDialog(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          const token = localStorage.getItem('vault_token');
                          const apiUrl = import.meta.env.VITE_API_URL;
                          window.open(`${apiUrl}/api/documents/${doc.id}/download?token=${token}`, '_blank');
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleShare(doc);
                        }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(doc);
                        }}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Upload Dialog with Loading Spinner */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Drag and drop files or click to browse. Supports PDF, JPG, PNG, WebP, and GIF.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center w-full">
            {isUploading ? (
              // Loading Spinner UI
              <div className="w-full py-12 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  {/* Animated spinner */}
                  <div className="absolute inset-0 border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50 rounded-full animate-spin"></div>
                  {/* Center percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{uploadProgress}%</span>
                  </div>
                </div>
                <p className="mt-6 font-medium text-foreground">Uploading document...</p>
                <p className="mt-1 text-sm text-muted-foreground">Please wait while your file is being uploaded</p>
                
                {/* Progress bar */}
                <div className="w-full max-w-xs mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-6 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setPendingUploadFile(null);
                    toast.warning('Upload cancelled');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Upload
                </Button>
              </div>
            ) : pendingUploadFile ? (
              <div className="w-full space-y-4 text-left">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input 
                    value={uploadFormData.name} 
                    onChange={e => setUploadFormData({...uploadFormData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={uploadFormData.category}
                        onValueChange={(value) => setUploadFormData({...uploadFormData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.key} value={cat.key}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 flex-shrink-0"
                      onClick={() => setShowCreateCategoryDialog(true)}
                      title="Create custom category"
                    >
                      <Icons.Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Issuer</Label>
                  <Input 
                    placeholder="e.g. Govt, Hospital, etc." 
                    value={uploadFormData.issuer} 
                    onChange={e => setUploadFormData({...uploadFormData, issuer: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input 
                    placeholder="e.g. personal, important" 
                    value={uploadFormData.tags} 
                    onChange={e => setUploadFormData({...uploadFormData, tags: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Add any additional notes here..." 
                    value={uploadFormData.notes} 
                    onChange={e => setUploadFormData({...uploadFormData, notes: e.target.value})} 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button  variant="outline" className="flex-1 bg-red-500 text-white" onClick={() => setPendingUploadFile(null)}>
                    Discard
                  </Button>
                  <Button className="flex-1 bg-green-500 text-white" onClick={confirmUpload}>
                    Upload Photo
                  </Button>
                </div>
              </div>
            ) : !isCameraOpen ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors w-full ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-1">Drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                  multiple
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                />
                <div className="flex justify-center gap-4">
                  <Button 
                    className='rounded-full bg-black text-white hover:bg-gray-600 hover:text-white' 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select Files
                  </Button>
                  <Button 
                    className='rounded-full bg-black text-white hover:bg-gray-600 hover:text-white' 
                    variant="outline" 
                    onClick={() => {
                      setIsCameraOpen(true);
                      startCamera();
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Open Camera
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      stopCamera();
                      setIsCameraOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className='bg-black text-white hover:bg-gray-600'
                    onClick={capturePhoto}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Maximum file size: 20MB • Supported formats: PDF, JPG, PNG, WebP, GIF
          </p>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-vault-surface rounded-none flex items-center justify-center overflow-hidden">
                {selectedDocument.fileType === 'pdf' ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_URL}/api/documents/${selectedDocument.id}/view?token=${localStorage.getItem('vault_token')}`}
                    className="w-1/4 h-1/4 border-0"
                    title={selectedDocument.name}
                  />
                ) : (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                    onClick={(e) => {
                      if (selectedDocument.fileType !== 'pdf') {
                        handleImageZoom(selectedDocument.fileUrl, selectedDocument.name);
                        setShowPreviewDialog(false);
                      }
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">
                      {categories.find(c => c.key === selectedDocument.category)?.label || selectedDocument.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span className="font-medium">{format(new Date(selectedDocument.uploadedAt), 'PPP')}</span>
                  </div>
                  {selectedDocument.metadata.issuer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">{selectedDocument.metadata.issuer}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{formatBytes(selectedDocument.size)}</span>
                  </div>
                  {selectedDocument.metadata.expiryDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">{format(new Date(selectedDocument.metadata.expiryDate), 'PPP')}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              {selectedDocument.metadata.notes && (
                <div className="bg-vault-surface p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedDocument.metadata.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button 
              className='bg-black text-white'
              variant="outline" 
              onClick={() => {
                if (selectedDocument) {
                  openPdfInSameTab(selectedDocument.id);
                }
              }}
              disabled={selectedDocument?.fileType !== 'pdf'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View document
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toastId = toast.loading('Updating document...');
                try {
                  await updateDocument(selectedDocument.id, {
                    name: formData.get('name') as string,
                    category: formData.get('category') as DocumentCategory,
                    tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
                    metadata: {
                      ...selectedDocument.metadata,
                      issuer: formData.get('issuer') as string,
                      notes: formData.get('notes') as string,
                    },
                  });
                  toast.success('Document updated successfully', { id: toastId });
                  setShowEditDialog(false);
                } catch (error) {
                  toast.error('Failed to update document', { id: toastId });
                  console.error('Update error:', error);
                }
              }}
            >
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={selectedDocument.name} className="mt-1.5" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={selectedDocument.category}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => setShowCreateCategoryDialog(true)}
                  title="Create custom category"
                >
                  <Icons.Plus className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" defaultValue={selectedDocument.tags.join(', ')} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input id="issuer" name="issuer" defaultValue={selectedDocument.metadata.issuer || ''} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={selectedDocument.metadata.notes || ''} className="mt-1.5" rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update document</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
  variant="destructive"
  onClick={handleDelete}
  disabled={isDeleting}
>
  {isDeleting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Deleting...
    </>
  ) : (
    "Delete"
  )}
</Button>

            
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zoom Modal for Images - Mobile Optimized */}
      <Dialog open={showZoomModal} onOpenChange={setShowZoomModal}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 border-0 bg-black">
          <div className="relative w-full h-full flex flex-col">
            {/* Image Container */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-2 touch-none">
              <motion.img
                src={zoomImageSrc}
                alt={zoomImageName}
                className="origin-center select-none max-w-full max-h-full object-contain"
                style={{
                  scale: zoomLevel / 100,
                  rotate: `${rotation}deg`,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoomLevel / 100 }}
                transition={{ duration: 0.2 }}
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    e.preventDefault();
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                      touch2.clientX - touch1.clientX,
                      touch2.clientY - touch1.clientY
                    );
                    
                    const baseDistance = 100;
                    const newZoom = Math.min(300, Math.max(50, (distance / baseDistance) * 100));
                    setZoomLevel(Math.round(newZoom / 5) * 5);
                  }
                }}
                onTouchEnd={(e) => {
                  if (e.touches.length === 0 && e.changedTouches.length === 1) {
                    const touch = e.changedTouches[0];
                    const now = Date.now();
                    if (now - lastTapTime < 300) {
                      if (zoomLevel === 100) {
                        setZoomLevel(200);
                      } else {
                        setZoomLevel(100);
                        setRotation(0);
                      }
                    }
                    lastTapTime = now;
                  }
                }}
              />
            </div>

            {/* Compact Mobile Controls */}
            <div className="flex flex-col gap-2 p-3 bg-black/90 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-1">
                <p className="text-white text-sm font-medium truncate max-w-[80vw] text-center">
                  {zoomImageName}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => {
                            setZoomLevel(100);
                            setRotation(0);
                          }}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Reset</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setRotation(prev => (prev + 90) % 360)}
                        >
                          <span className="text-xs font-medium">↻</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Rotate 90°</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                          disabled={zoomLevel <= 50}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Zoom Out</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="min-w-[60px] text-center">
                    <span className="text-white text-sm font-medium">{zoomLevel}%</span>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setZoomLevel(prev => Math.min(300, prev + 25))}
                          disabled={zoomLevel >= 300}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Zoom In</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-white hover:bg-white/20"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              <div className="px-1 mt-1">
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => setZoomLevel(value)}
                  min={50}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-xs text-white/70">50%</span>
                  <span className="text-xs text-white/70">Zoom</span>
                  <span className="text-xs text-white/70">300%</span>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-2">
                {[100, 150, 200].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className={`h-7 text-xs ${zoomLevel === preset ? 'bg-white text-black' : 'text-white border-white/30'}`}
                    onClick={() => setZoomLevel(preset)}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCategoryDialog
        open={showCreateCategoryDialog}
        onOpenChange={setShowCreateCategoryDialog}
      />
    </div>
  );
}