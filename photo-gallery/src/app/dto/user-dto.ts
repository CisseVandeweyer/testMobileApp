export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userRole_id: number; // Veldnaam komt overeen met de backend
  email: string;
  adres: string;
  gemeente: string;
  bus: string | null;
}
