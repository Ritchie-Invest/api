import { QcmQuestion } from "./Questions/QCM";
import { PhrasesATrousQuestion } from "./Questions/PhraseATrous";
import { MatchTheWordQuestion } from "./Questions/MatchTheWord";
import { TrueOrFalseQuestion } from "./Questions/TrueOrFalse";
import { GaugeQuestion } from "./Questions/GaugeQuestion";
import { ChooseAnOrderQuestion } from "./Questions/ChooseAnOrderQuestion";

export type Question = 
  | QcmQuestion 
  | PhrasesATrousQuestion 
  | MatchTheWordQuestion 
  | TrueOrFalseQuestion 
  | GaugeQuestion 
  | ChooseAnOrderQuestion[];