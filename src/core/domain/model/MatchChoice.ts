export class MatchChoice {
  id: string;
  value1: string;
  value2: string;

  constructor(params: {
    id: string;
    value1: string;
    value2: string;
  }) {
    this.id = params.id;
    this.value1 = params.value1;
    this.value2 = params.value2;
  }
}
