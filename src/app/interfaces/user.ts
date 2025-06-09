interface User {
  email: string;
  password: string;
  role?: 'customer' | 'admin'; // Add role field
  profile?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    phone?: string;
    birthday?: string;
    image?: string;
  };
}