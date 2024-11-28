import React, { useEffect } from "react";
import "./ChessBoard.css";

const ChessLoading = () => {
  useEffect(() => {
    // This mimics the restartCSS functionality
    const restartCSS = () => {
      const pawnPieces = document.querySelectorAll(".pawnpiece");
      const wrapper = document.getElementById("wrapper");

      pawnPieces.forEach((piece) => piece.classList.remove("pawnimate"));
      wrapper.classList.remove("restart-css");

      setTimeout(() => {
        pawnPieces.forEach((piece) => piece.classList.add("pawnimate"));
        wrapper.classList.add("restart-css");
      }, 100);
    };

    const intervalId = setInterval(restartCSS, 4000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="chessboard">
    <div id="wrapper" className="why restart-css">
      <ul className="oddrow blackbackrow">
        {Array.from({ length: 8 }).map((_, index) => (
          <li key={`blackback-${index}`} className={index === 0 ? "topleftcorner" : ""}>
            <svg
              className="pawnpiece pawnimate"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20.5 48.9"
            >
              <path d="M18.1 42.2c0.2-0.3 0.3-0.6 0.3-0.9 0-0.9-0.8-1.8-2-2.4 -3.1-6.2-1.2-9.2-1.2-9.2h0c1.2-0.5 1.9-1.3 1.9-2.1v-4.1c0-0.8-0.7-1.5-1.7-2v2.3c-0.4-0.2-0.8-0.4-1.3-0.5v-2.3c-0.9-0.3-1.9-0.4-3.1-0.5v2.3c-0.2 0-0.5 0-0.8 0s-0.5 0-0.8 0v-2.3c-1.1 0.1-2.2 0.2-3.1 0.5v2.3c-0.5 0.1-0.9 0.3-1.3 0.5v-2.3c-1.1 0.5-1.7 1.2-1.7 2v4.1c0 0.8 0.7 1.5 1.9 2.1h0c0 0 2 3-1.2 9.2 -1.3 0.6-2 1.5-2 2.4 0 0.3 0.1 0.6 0.3 0.9 -1.1 0.7-1.7 1.5-1.7 2.4 0 2.4 4.3 4.3 9.6 4.3 5.3 0 9.6-1.9 9.6-4.3C19.8 43.7 19.2 42.9 18.1 42.2z" />
            </svg>
          </li>
        ))}
      </ul>
      <div id="side"></div>
    </div>
    </div>
  );
};

export default ChessLoading;
