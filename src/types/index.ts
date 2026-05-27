export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  cover?: string;
  bio?: string;
  headline?: string;
  role?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  location?: string;
  skills?: string[];
  lab?: any;
}
