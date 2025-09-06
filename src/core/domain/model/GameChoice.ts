export class GameChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  correctionMessage: string;

  constructor(params: {
    id: string;
    text: string;
    isCorrect: boolean;
    correctionMessage: string;
  }) {
    this.id = params.id;
    this.text = params.text;
    this.isCorrect = params.isCorrect;
    this.correctionMessage = params.correctionMessage;
  }
}
