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
  image: string;
  membersCount: number;
  projectsCount: number;
  location: string;
}
