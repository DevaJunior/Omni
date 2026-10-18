import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  isNew?: boolean;
  isLocked?: boolean;
  favorite?: boolean;
}

export interface LabProfile {
  id: string;
  name: string;
  institution: string;
  description: string;
  image?: string;
  logoImage?: string;
  membersCount?: number;
  projectsCount?: number;
  location: string;
  website?: string;
  email?: string;
  verified?: boolean;
  adminId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface LabMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  headline?: string;
  role?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  department?: string;
  lastActive?: any;
}
