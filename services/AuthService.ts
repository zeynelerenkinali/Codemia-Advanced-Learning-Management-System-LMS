import { Database } from './Database';
import { User, UserRole } from '../types';

export class AuthService {
  private db = Database.getInstance();

  login(email: string, password: string): User {
    // In a real app, we would hash the password input before comparing
    const user = this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password);
    if (!user) {
      throw new Error("Invalid email or password. Try 'admin@codemia.edu' / 'pw'");
    }
    return user;
  }

  register(name: string, email: string, password: string, role: UserRole): User {
    if (this.db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("A user with this email already exists.");
    }
    // In a real app, password should be hashed here
    return this.db.addUser({ name, email, password_hash: password, role });
  }

  resetPassword(email: string): boolean {
      const user = this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      // In a real app, this would trigger an email service
      // We return true if valid email format, to prevent user enumeration security risks, 
      // but for this demo we'll return based on user existence to show the UI feedback.
      return !!user;
  }
}