import React, { useState } from "react";
import "./scrollUp.css";
import scrollUp from "../extras/scrollUp.svg";

const ScrollUp = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 600) {
      setVisible(true);
    } else if (scrolled <= 600) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
      /* you can also use 'auto' behaviour 
         in place of 'smooth' */
    });
  };

  window.addEventListener("scroll", toggleVisible);

  return (
    <a
      onClick={scrollToTop}
      style={{ display: visible ? "block" : "none" }}
      id="scrollUp"
    >
      <svg
        className="scrollUpImg"
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
      >
        <path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z" />
      </svg>
    </a>
  );
};

export default ScrollUp;
