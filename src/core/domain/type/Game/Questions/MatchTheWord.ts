export interface MatchTheWordQuestion {
  instruction: string;
  matches: WordMatch[];
  feedback: string;
}

export interface WordMatch {
  value1: string;
  value2: string;
}