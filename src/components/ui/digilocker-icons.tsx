import React from 'react';
import { Document } from '@/types/vault';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

interface FileIconProps extends IconProps {
  fileType?: string;
  category?: string;
  name?: string;
}

const sizeMap = {
  xs: { w: 24, h: 30, text: 'text-[7px]', iconSize: 12, pillH: 'h-3' },
  sm: { w: 32, h: 40, text: 'text-[8px]', iconSize: 15, pillH: 'h-3.5' },
  md: { w: 42, h: 52, text: 'text-[10px]', iconSize: 20, pillH: 'h-4' },
  lg: { w: 60, h: 74, text: 'text-[12px]', iconSize: 28, pillH: 'h-5' },
  xl: { w: 80, h: 98, text: 'text-[14px]', iconSize: 36, pillH: 'h-6' },
  '2xl': { w: 104, h: 128, text: 'text-[16px]', iconSize: 48, pillH: 'h-8' },
};

/**
 * DigiLocker-style realistic PDF file icon with folded corner & red banner
 */
export const DigiLockerPdfIcon: React.FC<IconProps> = ({ size = 'md', className = '' }) => {
  const { w, h, text } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative select-none inline-flex items-center justify-center flex-shrink-0 drop-shadow-sm ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <svg
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="pdfBg" x1="0" y1="0" x2="64" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF1F2" />
            <stop offset="1" stopColor="#FFE4E6" />
          </linearGradient>
          <linearGradient id="pdfRibbon" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E11D48" />
            <stop offset="1" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id="pdfFold" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
          <filter id="pdfShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Paper Body */}
        <path
          d="M6 4C6 1.79086 7.79086 0 10 0H42L58 16V74C58 76.2091 56.2091 78 54 78H10C7.79086 78 6 76.2091 6 74V4Z"
          fill="url(#pdfBg)"
          stroke="#F43F5E"
          strokeWidth="1.5"
          filter="url(#pdfShadow)"
        />

        {/* Folded Dog-ear Corner */}
        <path
          d="M42 0V14C42 15.1046 42.8954 16 44 16H58L42 0Z"
          fill="#FDA4AF"
        />
        <path
          d="M42 0L58 16H44C42.8954 16 42 15.1046 42 14V0Z"
          fill="url(#pdfFold)"
          opacity="0.3"
        />

        {/* PDF Badge Strip / Ribbon */}
        <rect x="0" y="44" width="48" height="20" rx="3" fill="url(#pdfRibbon)" filter="url(#pdfShadow)" />
        
        {/* PDF text label */}
        <text
          x="24"
          y="58"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          PDF
        </text>

        {/* Simulated Document Lines */}
        <rect x="14" y="16" width="18" height="3" rx="1.5" fill="#FDA4AF" opacity="0.8" />
        <rect x="14" y="24" width="30" height="2.5" rx="1.25" fill="#E2E8F0" />
        <rect x="14" y="31" width="24" height="2.5" rx="1.25" fill="#E2E8F0" />
        <rect x="14" y="38" width="28" height="2.5" rx="1.25" fill="#E2E8F0" />

        {/* DigiLocker shield / Adobe curve icon mark */}
        <path
          d="M34 68C34 68 38 66.5 44 68C47 68.8 50 71 50 71"
          stroke="#E11D48"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

/**
 * DigiLocker-style realistic Image file icon
 */
export const DigiLockerImageIcon: React.FC<IconProps & { ext?: string }> = ({ size = 'md', ext = 'IMG', className = '' }) => {
  const { w, h } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative select-none inline-flex items-center justify-center flex-shrink-0 drop-shadow-sm ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <svg
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="imgBg" x1="0" y1="0" x2="64" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5F3FF" />
            <stop offset="1" stopColor="#EDE9FE" />
          </linearGradient>
          <linearGradient id="imgRibbon" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Paper Body */}
        <path
          d="M6 4C6 1.79086 7.79086 0 10 0H42L58 16V74C58 76.2091 56.2091 78 54 78H10C7.79086 78 6 76.2091 6 74V4Z"
          fill="url(#imgBg)"
          stroke="#818CF8"
          strokeWidth="1.5"
        />

        {/* Folded Corner */}
        <path d="M42 0V14C42 15.1046 42.8954 16 44 16H58L42 0Z" fill="#C7D2FE" />

        {/* Picture Frame */}
        <rect x="14" y="14" width="34" height="24" rx="3" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="1" />
        {/* Sun */}
        <circle cx="22" cy="21" r="3" fill="url(#sunGrad)" />
        {/* Mountains */}
        <path d="M16 34L26 23L33 30L38 25L46 34H16Z" fill="#818CF8" opacity="0.9" />
        <path d="M28 34L35 27L43 34H28Z" fill="#6366F1" opacity="0.7" />

        {/* IMG Badge Ribbon */}
        <rect x="0" y="44" width="48" height="20" rx="3" fill="url(#imgRibbon)" />
        <text
          x="24"
          y="58"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          {ext.toUpperCase().slice(0, 4)}
        </text>
      </svg>
    </div>
  );
};

/**
 * DigiLocker 3D Realistic Folder Icon
 */
export const DigiLockerFolderIcon: React.FC<IconProps & { color?: 'blue' | 'amber' | 'emerald' | 'purple' }> = ({
  size = 'md',
  color = 'blue',
  className = '',
}) => {
  const pixelMap = {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 64,
    xl: 84,
    '2xl': 110,
  };
  const px = pixelMap[size] || 44;

  const colorConfig = {
    blue: {
      back: ['#1D4ED8', '#1E40AF'],
      front: ['#3B82F6', '#2563EB'],
      tab: '#1E40AF',
      glow: 'rgba(59, 130, 246, 0.3)',
      line: '#60A5FA',
    },
    amber: {
      back: ['#D97706', '#B45309'],
      front: ['#F59E0B', '#D97706'],
      tab: '#B45309',
      glow: 'rgba(245, 158, 11, 0.3)',
      line: '#FDE68A',
    },
    emerald: {
      back: ['#059669', '#047857'],
      front: ['#10B981', '#059669'],
      tab: '#047857',
      glow: 'rgba(16, 185, 129, 0.3)',
      line: '#A7F3D0',
    },
    purple: {
      back: ['#6D28D9', '#5B21B6'],
      front: ['#8B5CF6', '#7C3AED'],
      tab: '#5B21B6',
      glow: 'rgba(139, 92, 246, 0.3)',
      line: '#DDD6FE',
    },
  }[color];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none drop-shadow-md ${className}`}
      style={{ width: `${px}px`, height: `${px * 0.85}px` }}
    >
      <svg
        viewBox="0 0 100 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`folderBack-${color}`} x1="0" y1="0" x2="0" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor={colorConfig.back[0]} />
            <stop offset="1" stopColor={colorConfig.back[1]} />
          </linearGradient>
          <linearGradient id={`folderFront-${color}`} x1="0" y1="20" x2="0" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor={colorConfig.front[0]} />
            <stop offset="1" stopColor={colorConfig.front[1]} />
          </linearGradient>
          <linearGradient id="folderDoc" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <filter id={`folderDrop-${color}`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Back Flap + Tab */}
        <path
          d="M8 12C8 7.58172 11.5817 4 16 4H36C39.1826 4 42.1481 5.88886 43.4868 8.766L45.5132 13.234C46.8519 16.1111 49.8174 18 53 18H84C88.4183 18 92 21.5817 92 26V70C92 74.4183 88.4183 78 84 78H16C11.5817 78 8 74.4183 8 70V12Z"
          fill={`url(#folderBack-${color})`}
        />

        {/* Inside Peek Sheet / Document */}
        <rect x="22" y="10" width="56" height="30" rx="3" fill="url(#folderDoc)" opacity="0.9" />
        <rect x="28" y="16" width="24" height="3" rx="1.5" fill="#94A3B8" opacity="0.8" />
        <rect x="28" y="22" width="38" height="2" rx="1" fill="#CBD5E1" />

        {/* Front Pocket / Flap */}
        <path
          d="M6 28C6 24.6863 8.68629 22 12 22H88C91.3137 22 94 24.6863 94 28V72C94 76.4183 90.4183 80 86 80H14C9.58172 80 6 76.4183 6 72V28Z"
          fill={`url(#folderFront-${color})`}
          filter={`url(#folderDrop-${color})`}
        />

        {/* Gloss Top Highlight */}
        <path
          d="M12 23H88C90.2091 23 92 24.7909 92 27V30C92 27.7909 90.2091 26 88 26H12C9.79086 26 8 27.7909 8 30V27C8 24.7909 9.79086 23 12 23Z"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Subtle Government/DigiLocker Badge or Line */}
        <path
          d="M24 50C24 45 28 42 34 42H66C72 42 76 45 76 50"
          stroke={colorConfig.line}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <circle cx="50" cy="54" r="5" fill={colorConfig.line} opacity="0.35" />
      </svg>
    </div>
  );
};

/**
 * Universal DigiLocker File Icon that intelligently renders based on type and category
 */
export const DigiLockerFileIcon: React.FC<FileIconProps> = ({
  fileType = 'pdf',
  category = 'other',
  name = '',
  size = 'md',
  className = '',
}) => {
  const normType = (fileType || '').toLowerCase();
  const normName = (name || '').toLowerCase();

  // If image format
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(normType) || normName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
    const ext = normType || (normName.split('.').pop() || 'IMG');
    return <DigiLockerImageIcon size={size} ext={ext} className={className} />;
  }

  // If PDF
  if (normType === 'pdf' || normName.endsWith('.pdf')) {
    return <DigiLockerPdfIcon size={size} className={className} />;
  }

  // Document / Identity / Medical / Financial badge based on category
  const { w, h } = sizeMap[size] || sizeMap.md;

  let badgeColor = '#3B82F6';
  let badgeLabel = normType.toUpperCase().slice(0, 4) || 'DOC';
  let themeBg = '#EFF6FF';
  let themeBorder = '#93C5FD';

  if (category === 'identity' || normName.includes('aadhaar') || normName.includes('pan') || normName.includes('passport')) {
    badgeColor = '#2563EB';
    badgeLabel = 'GOVT';
    themeBg = '#F0FDF4';
    themeBorder = '#86EFAC';
  } else if (category === 'financial') {
    badgeColor = '#059669';
    badgeLabel = 'BANK';
    themeBg = '#ECFDF5';
    themeBorder = '#6EE7B7';
  } else if (category === 'medical') {
    badgeColor = '#E11D48';
    badgeLabel = 'HLTH';
    themeBg = '#FFF1F2';
    themeBorder = '#FDA4AF';
  } else if (category === 'insurance' || category === 'legal') {
    badgeColor = '#7C3AED';
    badgeLabel = 'LEGL';
    themeBg = '#F5F3FF';
    themeBorder = '#C4B5FD';
  }

  return (
    <div
      className={`relative select-none inline-flex items-center justify-center flex-shrink-0 drop-shadow-sm ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <svg
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M6 4C6 1.79086 7.79086 0 10 0H42L58 16V74C58 76.2091 56.2091 78 54 78H10C7.79086 78 6 76.2091 6 74V4Z"
          fill={themeBg}
          stroke={themeBorder}
          strokeWidth="1.5"
        />
        <path d="M42 0V14C42 15.1046 42.8954 16 44 16H58L42 0Z" fill={themeBorder} />
        
        {/* Document lines */}
        <rect x="14" y="16" width="22" height="3" rx="1.5" fill={badgeColor} opacity="0.6" />
        <rect x="14" y="24" width="30" height="2" rx="1" fill="#94A3B8" opacity="0.5" />
        <rect x="14" y="30" width="26" height="2" rx="1" fill="#94A3B8" opacity="0.5" />
        <rect x="14" y="36" width="28" height="2" rx="1" fill="#94A3B8" opacity="0.5" />

        {/* Badge Banner */}
        <rect x="0" y="46" width="48" height="18" rx="3" fill={badgeColor} />
        <text
          x="24"
          y="59"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
          textAnchor="middle"
        >
          {badgeLabel}
        </text>
      </svg>
    </div>
  );
};

/**
 * Realistic DigiLocker Document Preview Component for Grid View
 */
export const DigiLockerDocumentPreview: React.FC<{
  doc: Document;
  onClick?: () => void;
}> = ({ doc, onClick }) => {
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(doc.fileType.toLowerCase());

  if (isImage && (doc.thumbnailUrl || doc.fileUrl)) {
    return (
      <div
        className="w-full h-full relative group/img overflow-hidden cursor-pointer bg-slate-900/10 flex items-center justify-center"
        onClick={onClick}
      >
        <img
          src={doc.thumbnailUrl || doc.fileUrl}
          alt={doc.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
          {doc.fileType}
        </div>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-white/90 text-gray-900 text-xs font-semibold shadow">
            Preview
          </span>
        </div>
      </div>
    );
  }

  // Realistic Certificate / Document Sheet Preview
  const isIdentity = doc.category === 'identity';
  const isFinance = doc.category === 'financial';
  const isMedical = doc.category === 'medical';

  const themeHeader = isIdentity
    ? 'from-blue-600 to-indigo-700'
    : isFinance
    ? 'from-emerald-600 to-teal-700'
    : isMedical
    ? 'from-rose-600 to-pink-700'
    : 'from-red-600 to-rose-700';

  return (
    <div
      onClick={onClick}
      className="w-full h-full relative cursor-pointer p-3 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-900/60 group/doc select-none"
    >
      {/* Document Sheet Card */}
      <div className="w-[86%] h-[92%] bg-white dark:bg-slate-900 rounded-md shadow-md border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative transition-all duration-300 group-hover/doc:shadow-xl group-hover/doc:-translate-y-0.5">
        
        {/* Top Official Banner */}
        <div className={`h-6 bg-gradient-to-r ${themeHeader} px-2.5 flex items-center justify-between text-white`}>
          <span className="text-[9px] font-black tracking-widest uppercase">
            {doc.fileType === 'pdf' ? 'DIGITAL PDF' : 'SECURE DOC'}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] font-bold opacity-90">VAULT</span>
          </div>
        </div>

        {/* Paper Sheet Content */}
        <div className="flex-1 p-2.5 flex flex-col justify-between relative">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-24 h-24 fill-current">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
              <path d="M50 15 L58 35 L80 38 L63 54 L68 76 L50 64 L32 76 L37 54 L20 38 L42 35 Z" />
            </svg>
          </div>

          <div>
            {/* Document Header Preview */}
            <div className="flex items-center gap-2 mb-2">
              <DigiLockerPdfIcon size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {doc.name}
                </p>
                <p className="text-[9px] text-slate-400 capitalize truncate">
                  {doc.metadata?.issuer || doc.category}
                </p>
              </div>
            </div>

            {/* Simulated Document Lines */}
            <div className="space-y-1.5 mt-2">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6" />
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-4/5" />
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                VERIFIED DIGILOCKER
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-400">
              {doc.fileType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] opacity-0 group-hover/doc:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg scale-95 group-hover/doc:scale-100 transition-transform">
            Open Document
          </span>
        </div>
      </div>
    </div>
  );
};
