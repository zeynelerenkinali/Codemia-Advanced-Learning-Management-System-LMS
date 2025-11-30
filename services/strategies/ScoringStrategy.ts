import { Question } from '../../types';

/**
 * PATTERN 4: STRATEGY
 * 
 * Why: Allows us to swap scoring algorithms at runtime without changing the Quiz component.
 * E.g., Standard mode vs. "Strict" mode where wrong answers deduct points.
 */
export interface ScoringStrategy {
  calculateScore(questions: Question[], answers: Record<number, string>): number;
  getName(): string;
  getDescription(): string;
}

export class StandardScoring implements ScoringStrategy {
  getName() { return "Standard Scoring"; }
  getDescription() { return "Correct answers give points. No penalty for wrong answers."; }
  
  calculateScore(questions: Question[], answers: Record<number, string>): number {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score += q.points;
      }
    });
    return score;
  }
}

export class StrictScoring implements ScoringStrategy {
  getName() { return "Strict Scoring"; }
  getDescription() { return "Correct answers give points. Wrong answers deduct 2 points."; }

  calculateScore(questions: Question[], answers: Record<number, string>): number {
    let score = 0;
    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correct_answer) {
        score += q.points;
      } else if (userAnswer) {
        // Penalty for wrong answer, but not for skipped (empty)
        score = Math.max(0, score - 2); 
      }
    });
    return score;
  }
}
