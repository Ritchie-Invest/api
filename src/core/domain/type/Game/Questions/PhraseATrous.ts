export interface PhrasesATrousQuestion {
  firstText: string;
  secondText: string;
  blanks: BlankOption[];
  feedback: string;
}
export interface BlankOption {
  value: string;
  is_valid: boolean;
}