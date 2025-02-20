import React, { useState } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ gameProbs, setWhiteChances, setFen, fenMovesList, updateBoard }) {
  // Total pages based on the length of gameProbs
  const totalPages = gameProbs ? gameProbs.length : 0;
  const [currentPage, setCurrentPage] = useState(1);

  console.log("gameProbs", gameProbs);

  // Helper function to generate a list of page numbers (and ellipses)
  const generatePageNumbers = (total, current) => {
    const delta = 2; // Number of pages to show on each side of the current page
    const pages = [];

    if (total <= 1) return [1];

    // Always include the first page.
    pages.push(1);

    // Determine the range of pages around the current page.
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    // Insert ellipsis if there is a gap between first page and start.
    if (start > 2) {
      pages.push('...');
    }

    // (59) [0.47, 0.53, 0.47, 0.53, 0.47, 0.56, 0.44, 0.57, 0.43, 0.59, 0.45, 0.6, 0.45, 0.59, 0.49, 0.51, 0.49, 0.51, 0.5, 0.52, 0.49, 0.55, 0.48, 0.53, 0.53, 0.54, 0.5, 0.62, 0.48, 0.56, 0.38, 0.69, 0.31, 0.7, 0.3, 0.75, 0.21, 0.82, 0.21, 0.8, 0.26, 0.74, 0.26, 0.83, 0.18, 0.81, 0.25, 0.8, 0.2, 0.84, 0.16, 0.86, 0.17, 0.82, 0.19, 0.89, 0.13, 0.88, 0.12]0: 0.471: 0.532: 0.473: 0.534: 0.475: 0.566: 0.447: 0.578: 0.439: 0.5910: 0.4511: 0.612: 0.4513: 0.5914: 0.4915: 0.5116: 0.4917: 0.5118: 0.519: 0.5220: 0.4921: 0.5522: 0.4823: 0.5324: 0.5325: 0.5426: 0.527: 0.6228: 0.4829: 0.5630: 0.3831: 0.6932: 0.3133: 0.734: 0.335: 0.7536: 0.2137: 0.8238: 0.2139: 0.840: 0.2641: 0.7442: 0.2643: 0.8344: 0.1845: 0.8146: 0.2547: 0.848: 0.249: 0.8450: 0.1651: 0.8652: 0.1753: 0.8254: 0.1955: 0.8956: 0.1357: 0.8858: 0.12length: 59[[Prototype]]: Array(0)

    // Add the page numbers in the range.
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Insert ellipsis if there is a gap between the range and the last page.
    if (end < total - 1) {
      pages.push('...');
    }

    // Always include the last page.
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  };

  const pagesToDisplay = generatePageNumbers(totalPages, currentPage);

  return (
    // This container forces the pagination to always take the full available width.
    <div className="w-full">
      <nav aria-label="Page navigation example">
        {/* The ul now spans the full width, and the items are centered */}
        <ul className="flex w-full items-center justify-center -space-x-px h-10 text-base">
          {/* Previous Button */}
          <li>
            <a
              href="#"
              onClick={() => {
                if (currentPage > 1) {
                    setWhiteChances((gameProbs[currentPage] * 100).toFixed(2) + '%');
                    console.log(fenMovesList)
                    console.log("fen", fenMovesList[currentPage]);
                    updateBoard(currentPage - 1);

                  setCurrentPage(currentPage - 1);
                  console.log("left click", currentPage - 1);
                }
              }}
              className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-3 h-3 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </a>
          </li>

          {/* Page Number Buttons */}
          {pagesToDisplay.map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
                  {page}
                </span>
              ) : (
                <a
                  href="#"
                  onClick={() => {
                    // setWhiteChances((gameProbs[currentPage - 1] * 100).toFixed(1) + '%');
                    console.log("Current <li> page:", page);
                    console.log("game probs", (gameProbs[currentPage - 1] * 100).toFixed(1) + '%')
                    updateBoard(page);
                    setCurrentPage(page);
                    console.log("fen", fenMovesList[page]);

                    setWhiteChances((gameProbs[page - 1] * 100).toFixed(2) + '%');
                  }}
                  className={`flex items-center justify-center px-4 h-10 leading-tight ${
                    page === currentPage
                      ? 'text-blue-600 border border-blue-300 bg-blue-50'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                  } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
                >
                  {page}
                </a>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li>
            <a
              onClick={() => {
                if (currentPage < totalPages) {
                    setWhiteChances((gameProbs[currentPage] * 100).toFixed(2) + '%');
                    updateBoard(currentPage + 1);
                    console.log("fen", fenMovesList[currentPage]);
                    setCurrentPage(currentPage + 1);
                    // setWhiteChances((gameProbs[currentPage] * 100).toFixed(2) + '%');
                  console.log("right click", currentPage + 1);
                }
              }}
              href="#"
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-3 h-3 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
