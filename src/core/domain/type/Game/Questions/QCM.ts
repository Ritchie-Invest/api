export interface QcmQuestion {
  question: string;
  options: QcmOption[];
  feedback: string;
}

export interface QcmOption {
  value: string;
  is_valid: boolean;
}