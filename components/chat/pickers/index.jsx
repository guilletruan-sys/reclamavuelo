import TypePicker from './TypePicker';
import AirlinePicker from './AirlinePicker';
import AirportPicker from './AirportPicker';
import DatePicker from './DatePicker';
import TextPicker from './TextPicker';
import RadioPicker from './RadioPicker';
import FilePicker from './FilePicker';
import IbanPicker from './IbanPicker';
import ConsentPicker from './ConsentPicker';
import ResultCard from './ResultCard';

const REGISTRY = {
  type: TypePicker,
  airline: AirlinePicker,
  airport: AirportPicker,
  date: DatePicker,
  text: TextPicker,
  radio: RadioPicker,
  file: FilePicker,
  iban: IbanPicker,
  consent: ConsentPicker,
  resultCard: ResultCard,
};

export default function Pickers({ picker, ...rest }) {
  const Comp = REGISTRY[picker.kind];
  if (!Comp) return null;
  return <Comp {...picker} {...rest} />;
}
