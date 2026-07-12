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
  department?: string;
  skills?: string[];
  following?: string[];
  lab?: {
    id: string;
    role: string;
    name?: string;
  };
  labs?: {
    id: string;
    name: string;
    role: string;
  }[];
}
