import { useEffect, useState } from "react";

const breakPoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};
// recibe el ancho y retorna el breackpoint al que pertenece
const assingBreackpoint = (width) => {
  for (const [key, value] of Object.entries(breakPoints)) {
    if (width < value) return key;
  }
  return Object.keys(breakPoints).reverse()[0];
};

// verifica si el breackpoint actual es igual o mayor al que se esta observando
const verifyBreakPoint = (breakPoint, currentBreackPoint) => {
  if (!breakPoint) return true;
  const indexCurrent = Object.keys(breakPoints).indexOf(currentBreackPoint);
  const indexBreak = Object.keys(breakPoints).indexOf(breakPoint);
  return indexBreak <= indexCurrent;
};
export function useWidth(breakPointWatch) {
  const [width, setWidth] = useState(window.innerWidth);
  const [breakPoint, setBreakPoint] = useState(assingBreackpoint(window.innerWidth));
  const [watch, setWatch] = useState(verifyBreakPoint(breakPointWatch, assingBreackpoint(window.innerWidth)));

  const resizeHandle = () => {
    setWidth(window.innerWidth);
    setBreakPoint(assingBreackpoint(window.innerWidth));
    setWatch(verifyBreakPoint(breakPointWatch, assingBreackpoint(window.innerWidth)));
  };

  useEffect(() => {
    window.addEventListener("resize", resizeHandle);

    return () => window.removeEventListener("resize", resizeHandle);
  }, []);
  return {
    width,
    breakPoint,
    watch,
  };
}
