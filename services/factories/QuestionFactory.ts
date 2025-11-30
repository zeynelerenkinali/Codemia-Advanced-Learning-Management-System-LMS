import { Question, QuestionType } from '../../types';

/**
 * PATTERN 3: FACTORY METHOD
 * 
 * Why: Centralizes object creation logic. Different question types might need 
 * different default structures or validation logic.
 */
export class QuestionFactory {
  static createDefault(type: QuestionType, quizId: number): Omit<Question, 'id'> {
    const base = {
      quiz_id: quizId,
      points: 10,
      text: '',
      type,
    };

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return {
          ...base,
          options: ['Option 1', 'Option 2', 'Option 3'],
          correct_answer: 'Option 1'
        };
      case QuestionType.TRUE_FALSE:
        return {
          ...base,
          options: ['True', 'False'],
          correct_answer: 'True'
        };
      case QuestionType.SHORT_ANSWER:
        return {
          ...base,
          correct_answer: ''
        };
      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }
}
