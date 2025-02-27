import React, { useState, useEffect } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ gameProbs, setWhiteChances, setFen, fenMovesList, updateBoard }) {
  // Total pages based on the length of gameProbs
  const totalPages = gameProbs ? gameProbs.length : 0;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pre-generate all possible page layouts to ensure consistent sizing
  const [allPossiblePageLayouts, setAllPossiblePageLayouts] = useState([]);
  
  useEffect(() => {
    if (totalPages > 0) {
      // Generate and store all possible page layouts at component mount
      const layouts = [];
      for (let i = 1; i <= totalPages; i++) {
        layouts.push(generatePageNumbers(totalPages, i));
      }
      setAllPossiblePageLayouts(layouts);
    }
  }, [totalPages]);

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

  // Find the layout with the most elements to create a placeholder
  const maxLayout = allPossiblePageLayouts.length > 0 
    ? allPossiblePageLayouts.reduce((max, layout) => layout.length > max.length ? layout : max, [])
    : generatePageNumbers(totalPages, currentPage);

  // Current pages to display
  const pagesToDisplay = generatePageNumbers(totalPages, currentPage);

  return (
    // Fixed width container with consistent appearance
    <div className="w-full bg-white rounded-lg shadow-sm">
      <nav aria-label="Page navigation" className="py-2">
        {/* Use flex with a fixed width and justify-center */}
        <ul className="flex items-center justify-center h-10 text-base">
          {/* Previous Button */}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    setWhiteChances((gameProbs[currentPage] * 100).toFixed(2) + '%');
                    updateBoard(currentPage - 1);
                    setCurrentPage(currentPage - 1);
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

          {/* Page Number Buttons - Fixed width buttons */}
          {pagesToDisplay.map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="flex items-center justify-center w-10 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
                  {page}
                </span>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    updateBoard(page);
                    setCurrentPage(page);
                    setWhiteChances((gameProbs[page - 1] * 100).toFixed(2) + '%');
                  }}
                  className={`flex items-center justify-center w-10 h-10 leading-tight ${
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
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    setWhiteChances((gameProbs[currentPage] * 100).toFixed(2) + '%');
                    updateBoard(currentPage + 1);
                    setCurrentPage(currentPage + 1);
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