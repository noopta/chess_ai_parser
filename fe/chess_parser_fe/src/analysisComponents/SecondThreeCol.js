import React from 'react';
import { Chessboard } from 'react-chessboard';
import ChatUI from './ChatUI';
import ProgressBar from './ProgressBar';
import Pagination from './Pagination';
import { useLocation } from 'react-router-dom';

function ThreeColumnLayout({fen, setFen, whiteChances, setWhiteChances, fenMovesList, updateBoard, locationState, gameProbs}) {
  // Get the width of the Chessboard component to use as reference for other components
  const chessboardWidth = 500; // This should match your Chessboard's actual width
  
  return (
    <div className="container mx-auto px-4 py-8 h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* First Column - Three Cards */}
        <div className="flex justify-end h-4/5">
          <div className="w-full max-w-xs bg-gray-50 rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detected Turning Points</h2>
            
            <div className="flex-grow flex flex-col justify-between space-y-4">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-gray-800">Account Overview</h3>
                <p className="text-sm text-gray-600 mt-2">View your account status and recent activity at a glance.</p>
                <div className="mt-4 flex space-x-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                    Settings
                  </button>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-gray-800">Analytics Report</h3>
                <p className="text-sm text-gray-600 mt-2">Monthly statistics and performance metrics for your portfolio.</p>
                <div className="mt-4 flex space-x-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Download
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                    Share
                  </button>
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-gray-800">Security Center</h3>
                <p className="text-sm text-gray-600 mt-2">Manage security settings and review recent login activity.</p>
                <div className="mt-4 flex space-x-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Security Check
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Second Column - Chessboard (moved up with flex-start) */}
        <div className="flex flex-col items-center justify-start">
          {/* Fixed width container for ProgressBar that matches the Chessboard width */}
          <div style={{ width: `${chessboardWidth}px` }}>
            <ProgressBar whiteChances={whiteChances} />
          </div>
          <div className="w-full rounded-lg shadow-md p-6 flex justify-center items-center">
            <div className="w-full">
                <Chessboard
                    className="rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10"
                    id="BasicBoard"
                    position={fen}
                    width={chessboardWidth}
                />
                    {/* Fixed width container for Pagination */}
                <div className="mt-10 flex justify-center">
                    <div style={{ width: `${chessboardWidth}px` }}>
                        <Pagination gameProbs={locationState ? gameProbs : []} setWhiteChances={setWhiteChances} setFen={setFen} fenMovesList={fenMovesList} updateBoard={updateBoard}/>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Third Column - Chat UI */}
        <div className="flex justify-start h-full">
          <div className="w-full max-w-xs">
            <ChatUI />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreeColumnLayout;