/**
 * PATTERN 5: OBSERVER
 * 
 * Why: Decouples the action (finishing a lesson) from the reaction (updating progress bars, 
 * badges, or notifications). Multiple components can subscribe to these updates.
 */

type Listener = (data: { studentId: number; lessonId: number }) => void;

class LessonCompletionSubject {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(studentId: number, lessonId: number) {
    this.listeners.forEach(listener => listener({ studentId, lessonId }));
  }
}

export const progressSubject = new LessonCompletionSubject();
