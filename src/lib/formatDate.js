import { format, parseISO } from 'date-fns';

const formatDate = (isoDateString) => {
  const date = parseISO(isoDateString);
  return format(date, 'MMM d, y');
};

export default formatDate;
