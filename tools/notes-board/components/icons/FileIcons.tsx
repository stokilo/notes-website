import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

export const FolderIcon: React.FC<IconProps> = ({ size = 24, color = '#2196F3' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill={color}/>
  </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ size = 24, color = '#2196F3' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18Z" fill={color}/>
  </svg>
);

export const TypeScriptIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#3178C6"/>
    <path d="M13.5 15.5H15.5V17.5H13.5V15.5Z" fill="white"/>
    <path d="M11.5 15.5H13.5V17.5H11.5V15.5Z" fill="white"/>
    <path d="M9.5 15.5H11.5V17.5H9.5V15.5Z" fill="white"/>
    <path d="M7.5 15.5H9.5V17.5H7.5V15.5Z" fill="white"/>
    <path d="M5.5 15.5H7.5V17.5H5.5V15.5Z" fill="white"/>
    <path d="M3.5 15.5H5.5V17.5H3.5V15.5Z" fill="white"/>
    <path d="M15.5 13.5H17.5V15.5H15.5V13.5Z" fill="white"/>
    <path d="M13.5 13.5H15.5V15.5H13.5V13.5Z" fill="white"/>
    <path d="M11.5 13.5H13.5V15.5H11.5V13.5Z" fill="white"/>
    <path d="M9.5 13.5H11.5V15.5H9.5V13.5Z" fill="white"/>
    <path d="M7.5 13.5H9.5V15.5H7.5V13.5Z" fill="white"/>
    <path d="M5.5 13.5H7.5V15.5H5.5V13.5Z" fill="white"/>
    <path d="M3.5 13.5H5.5V15.5H3.5V13.5Z" fill="white"/>
  </svg>
);

export const JavaScriptIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#F7DF1E"/>
    <path d="M7.5 15.5L8.5 16.5C9.5 15.5 10.5 15 11.5 15C12.5 15 13 15.5 13 16.5C13 17.5 12 18 11 18C10 18 9 17.5 8 16.5L7 17.5C8 18.5 9.5 19.5 11.5 19.5C13.5 19.5 15 18.5 15 16.5C15 14.5 13.5 13.5 11.5 13.5C10.5 13.5 9.5 14 8.5 15L7.5 15.5Z" fill="black"/>
    <path d="M16.5 15.5L17.5 16.5C18.5 15.5 19.5 15 20.5 15C21.5 15 22 15.5 22 16.5C22 17.5 21 18 20 18C19 18 18 17.5 17 16.5L16 17.5C17 18.5 18.5 19.5 20.5 19.5C22.5 19.5 24 18.5 24 16.5C24 14.5 22.5 13.5 20.5 13.5C19.5 13.5 18.5 14 17.5 15L16.5 15.5Z" fill="black"/>
  </svg>
);

export const HtmlIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#E34F26"/>
    <path d="M7 7H17V9H7V7Z" fill="white"/>
    <path d="M7 11H17V13H7V11Z" fill="white"/>
    <path d="M7 15H17V17H7V15Z" fill="white"/>
  </svg>
);

export const CssIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#1572B6"/>
    <path d="M7 7H17V9H7V7Z" fill="white"/>
    <path d="M7 11H17V13H7V11Z" fill="white"/>
    <path d="M7 15H17V17H7V15Z" fill="white"/>
  </svg>
);

export const JsonIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#000000"/>
    <path d="M7 7H17V9H7V7Z" fill="#F7DF1E"/>
    <path d="M7 11H17V13H7V11Z" fill="#F7DF1E"/>
    <path d="M7 15H17V17H7V15Z" fill="#F7DF1E"/>
  </svg>
);

export const MarkdownIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#000000"/>
    <path d="M7 7H17V9H7V7Z" fill="white"/>
    <path d="M7 11H17V13H7V11Z" fill="white"/>
    <path d="M7 15H17V17H7V15Z" fill="white"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#4CAF50"/>
  </svg>
);

export const DefaultFileIcon: React.FC<IconProps> = ({ size = 24, color = '#78909C' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill={color}/>
    <path d="M14 2V8H20" fill="#78909C"/>
  </svg>
);

export const JavaIcon: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H21V21H3V3Z" fill="#007396"/>
    <path d="M7 7H17V9H7V7Z" fill="white"/>
    <path d="M7 11H17V13H7V11Z" fill="white"/>
    <path d="M7 15H17V17H7V15Z" fill="white"/>
    <path d="M9 5H15V7H9V5Z" fill="white"/>
    <path d="M9 19H15V21H9V19Z" fill="white"/>
  </svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ size = 24, color = '#4a90e2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="6" rx="8" ry="3" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
    <ellipse cx="12" cy="18" rx="8" ry="3" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
    <rect x="4" y="6" width="16" height="12" rx="8" fill={color} fillOpacity="0.10" stroke={color} strokeWidth="2"/>
    <ellipse cx="12" cy="18" rx="8" ry="3" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
    <ellipse cx="12" cy="6" rx="8" ry="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2"/>
  </svg>
); 