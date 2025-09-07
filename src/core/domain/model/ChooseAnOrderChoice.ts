export class ChooseAnOrderChoice {
  sentence: string;
  value: number;

  constructor(params: {
    sentence: string;
    value: number;
  }) {
    this.sentence = params.sentence;
    this.value = params.value;
  }
}
