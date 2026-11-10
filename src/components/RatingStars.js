import React, { useState } from 'react';

function RatingStars({ rating = 0, onChange, setRating, readOnly = false, maxStars = 5 }) {
  const [hover, setHover] = useState(0);

  const handleSelect = (val) => {
    if (readOnly) return;
    if (onChange) onChange(val);
    if (setRating) setRating(val);
  };

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const isFilled = hover > 0 ? i <= hover : i <= rating;
    stars.push(
      <span
        key={i}
        role={readOnly ? 'img' : 'button'}
        aria-label={`${i} sao`}
        onClick={() => handleSelect(i)}
        onMouseEnter={() => !readOnly && setHover(i)}
        onMouseLeave={() => !readOnly && setHover(0)}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          color: isFilled ? '#ffc107' : '#e4e5e9',
          fontSize: '1.4rem',
          marginRight: '3px',
          userSelect: 'none',
          transition: 'color 0.15s ease-in-out',
        }}
      >
        ★
      </span>
    );
  }

  return <div className="d-inline-flex align-items-center">{stars}</div>;
}

export default RatingStars;
