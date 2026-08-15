import { Star, StarHalf } from "lucide-react";
import { FC } from "react";

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star
          key={`star-${i}`}
          size={18}
          className="fill-yellow-500 text-yellow-500"
        />,
      );
    } else if (i - rating < 1 && i - rating > 0) {
      // partial star (e.g. rating = 4.5 -> 5th star is half)
      stars.push(
        <StarHalf
          key={`half-${i}`}
          size={18}
          className="fill-yellow-500 text-yellow-500"
        />,
      );
    } else {
      // empty star
      stars.push(
        <Star key={`empty-${i}`} size={18} className="text-gray-300" />,
      );
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;
