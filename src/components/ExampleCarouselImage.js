import React from 'react';

function ExampleCarouselImage({ src, alt, text }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden' }}>
      <img
        className="d-block w-100"
        src={src}
        alt={alt || text}
        style={{
          width: '100%',
          height: '500px',
          objectFit: 'cover',
          filter: 'brightness(0.7)',
        }}
      />
    </div>
  );
}

export default ExampleCarouselImage;
