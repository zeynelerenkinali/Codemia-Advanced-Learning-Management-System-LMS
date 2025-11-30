
import { Database } from '../Database';
import { User, InstructorProfile, UserRole } from '../../types';

export class UserRepository {
  private db = Database.getInstance();

  getById(id: number): User | undefined {
    return this.db.users.find(u => u.id === id);
  }

  getInstructorProfile(userId: number): InstructorProfile | undefined {
    return this.db.instructorProfiles.find(p => p.user_id === userId);
  }

  becomeInstructor(userId: number, bio: string, expertise: string): User {
    const user = this.getById(userId);
    if (!user) throw new Error("User not found");
    if (user.role === UserRole.INSTRUCTOR) throw new Error("User is already an instructor");

    return this.db.promoteUser(userId, bio, expertise);
  }
}
