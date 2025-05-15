import React, { useState, useCallback } from 'react';
import SvgComponent from './SvgComponent';

const MySvgComponent = () => {
  const [lineLength, setLineLength] = useState(100);

  const drawLine = useCallback((draw) => {
    var text = draw.text(function(add) {
      add.tspan( "KeyCloack -- >" )
    })

    var textPath = text.path('M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80')

    textPath.animate(4000).ease('<>')
      .plot('M10 80 C 40 150, 65 150, 95 80 S 150 10, 180 80')
      .loop(true, true)
  }, []);

  return (
    <div>
      <SvgComponent width={400} height={200} drawFunction={drawLine} />
    </div>
  );
};

export default MySvgComponent;