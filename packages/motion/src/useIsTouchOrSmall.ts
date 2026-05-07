import { useEffect, useState } from "react";

export const useIsTouchOrSmall = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const check = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const small = window.innerWidth < 1024;
      setIsTouch(coarse || small);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isTouch;
};
