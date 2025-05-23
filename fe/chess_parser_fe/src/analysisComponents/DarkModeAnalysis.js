import { ChatBubbleOvalLeftEllipsisIcon, CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid';
import { Chessboard } from "react-chessboard";
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, CheckIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { useParams, useLocation, useNavigation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import AnimatedText from './AnimatedText.js';
import { CardCarousel } from './CardCarousel.js';
import { Carousel } from "@material-tailwind/react";
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'; // Import icons for arrows
import ResourceCard from './ResourceCard.js';
import ProgressBar from './ProgressBar.js';
import Pagination from './Pagination.js';
import ThreeColumn from './ThreeColumn.js';
// import ChatInterface from './ChatInterface.js';
import ThreeColumnLayout from './SecondThreeCol.js';

const getFirstMoveRoundInBracket = (descriptionText) => {
    const regex = /\((\d+)\)/;
    const match = descriptionText.match(regex);

    if (match) {
        return match[1]
        // boardMap.set(index, match[1])
    }

    return null;
}

const navigation = [
    { name: 'Home', href: '/', current: false }
    // { name: 'About', href: '#', current: false }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function TextCard({textData, index, open, setOpen, resources, resourceMap, setResourcePopUpText, resourcePopUpText, setTitlePopupText, titlePopupText, moveStateArray, setBoardState, setFen, parsedMoveMap}) {
    var splitStrings = textData.split(":");
    var title = splitStrings[0];
    var description = splitStrings[1];
    var prefixRegex = /^\d+\.\s*/;

    title = title.replace(prefixRegex, ''); 
    resourcePopUpText = resourcePopUpText.replace(prefixRegex, '');

    // one option 
    // console.log("resource map: " + resourceMap.get(index + 1));
    // so resoruces in an array 
    // we just need to access the index of each element in some kind of organized way 
    // we can pass in the resources OR store it to a global variable for slightly easier access 
    // one thing that would help is it there was away to stroe the index as a key to each textComponent and then reference that 
    // when we want to get the data from the global map 
    const stringMatch = textData.match(/^(\d)\./);
    const resourceIndex = stringMatch ? parseInt(stringMatch[1], 10) : null;
    const resource = resourceIndex ? resourceMap.get(resourceIndex) : null;

    // Logging for debugging
    // console.log("title: " + title);

    const updateBoard = (index) => {
        // console.log("logging move state board")
        // console.log(moveStateArray[0][index]);
        // console.log(moveStateArray)
        // console.log(index)
        setBoardState(moveStateArray[0][index]);
        setFen(moveStateArray[0][index].fen());
    }

    return (
        <div class="dark object-cover flex justify-center">
            <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <a id={"card" + index} href="#">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
                </a>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {/* {description} */}

                    <AnimatedText text={description} speed={20} />
                </p>
                <a onClick={() => { setOpen(true); setResourcePopUpText(resourceMap.get(resourceIndex + 1)); setTitlePopupText(title)}} class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    View Resource
                    {/* <svg
                    class="w-3.5 h-3.5 ml-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    >
                    <path d="M11 3a7 7 0 00-7 7c0 2.386 1.052 4.29 2.634 5.642A1.992 1.992 0 007 17h6a1.993 1.993 0 00.366-1.358A7.002 7.002 0 0011 3zm.895 13H8.105a1.002 1.002 0 01.895 1.448 7.978 7.978 0 002 0 1.002 1.002 0 01.895-1.448zM9 20h2v-1H9v1z" />
                    </svg> */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 ml-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>

                </a>

                <a onClick={() => { updateBoard(index) }} class="inline-flex items-center ml-5 px-3 py-2 text-sm font-medium text-center text-white bg-[#6A5ACD] rounded-lg hover:bg-[#5a4cbf] focus:ring-4 focus:outline-none focus:ring-[#4e429f] dark:bg-[#6A5ACD] dark:hover:bg-[#5a4cbf] dark:focus:ring-[#4e429f]">
                Show On Board
                    <svg
                        class="w-3.5 h-3.5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                    >
                        <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                    </svg>
                </a>

                <ResourceCard open={open} setOpen={setOpen} titleText={titlePopupText} descriptionText={resourcePopUpText} />

            </div >
        </div >
    )
}


// {open ? (
//     < Transition.Root show={open} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={setOpen}>
//             <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//             >
//                 <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
//             </Transition.Child>

//             <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
//                 <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//                     <Transition.Child
//                         as={Fragment}
//                         enter="ease-out duration-300"
//                         enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//                         enterTo="opacity-100 translate-y-0 sm:scale-100"
//                         leave="ease-in duration-200"
//                         leaveFrom="opacity-100 translate-y-0 sm:scale-100"
//                         leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//                     >
//                         <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
//                             <div>
//                                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
//                                     <LightBulbIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
//                                 </div>
//                                 <div className="mt-3 text-center sm:mt-5">
//                                     <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
//                                         {titlePopupText}
//                                     </Dialog.Title>
//                                     <div className="mt-2">
//                                         <p className="text-sm text-gray-500">
//                                             {resourcePopUpText}
//                                             {/* have a state variable here, because at any given point we will have one message on the popup, so when a user
//                                              clicks on View Resource, we can set the state of the popup to the resource that we want to display
//                                              very scrappy but I can use the title e.g. 1 or 2 or 3 as the key to the resourceMap
//                                             */}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="mt-5 sm:mt-6">
//                                 <button
//                                     type="button"
//                                     className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                                     onClick={() => setOpen(false)}
//                                 >
//                                     Go back to analysis
//                                 </button>
//                             </div>
//                         </Dialog.Panel>
//                     </Transition.Child>
//                 </div>
//             </div>
//         </Dialog>
//     </Transition.Root>
// ) : null
// }


function NavBar() {
    const navigate = useNavigate();
    return (
        <Disclosure as="nav" className="bg-gray-800">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <a
                                                onClick={() => {
                                                    if (item.name == "Home") {
                                                        navigate('/');
                                                    } else {
                                                        navigate('/' + item.name.toLowerCase());
                                                    }
                                                }}
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                    'rounded-md px-3 py-2 text-sm font-medium'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}


const reformatResponse = (response, type) => {
    var reformattedResponse = [];

    if (type == "A") {
        // Analysis
        // split the string based on numeric bullet points (e.g. 1. 2. 3. 4.)
        var splitStrings = [];
        splitStrings = response.split("\n");

        for (var i = 0; i < splitStrings.length; i++) {
            if (splitStrings[i].length == 0 || splitStrings[i] == "Analysis:" || splitStrings[i] == "Analysis") {
                continue;
            }

            // check if the first 2 characters is a number followed by a period (e.g. 1.)
            if (!splitStrings[i].substring(0, 2).match(/[0-9]+\./)) {
                continue;
            }
            // update stateText using setStateText function by appending splitStrings[i]
            reformattedResponse.push(splitStrings[i]);
        }

    } else {
        // Resources
    }

    return reformattedResponse;
}

const LeftSide = ({
    game,
    decodeKey,
    chessAnalysis,
    setChessAnalysis,
    chessOpponent,
    setChessOpponent,
    gameProbs,
    locationState,
    fenMovesList
}) => {
    
    const [fen, setFen] = useState('start');
    const [open, setOpen] = useState(false);
    const [playerColor, setPlayerColor] = useState("")
    // split the string based on the string delimetor "Resources"

    // console.log("chess analysis: " + chessAnalysis);
    var analysisArray = chessAnalysis.split("Resources:");
    var analysis = analysisArray[0];
    // reformatResponse(analysisArray[1], "R");
    var resources = analysisArray[1];
    // var resourceMap = new Map();
    var analysisArray = [];
    const [analysisArrayState, setAnalysisArrayState] = useState([]);
    const [parsedFirstText, setParsedFirstTextState] = useState([]);
    const [boardState, setBoardState] = useState(new Chess());
    const [moveStateArray, setMoveStateArray] = useState([]);
    const [fenStateList, setFenStateList] = useState([]);
    const [resourceMap, setResourceMap] = useState(new Map());

    const [analysisSection, resourcesSection] = chessAnalysis.split("Resources:");
    // Extract analysis points
    var analysisPoints = null;
    var resourcePoints = null;
    var resourceArray = [];
    const [organizedAnalysisArray, setOrganizedAnalysisArray] = useState([]);
    const [resourcePopupText, setResourcePopupText] = useState("");
    const [titlePopupText, setTitlePopupText] = useState("");
    const [parsedMoveMap, setParsedMoveMap] = useState(new Map());

    // get all occurances of "(" in the analysis string
    // get all occurances of ")" in the analysis string and store to a list
    let indexOccurance = analysis.indexOf("(", 0);
    var startingIndices = [];
    var i = 0;
    const chess = new Chess();
    const [whiteChances, setWhiteChances] = useState("57.5%");
    console.log("left side");
    console.log(fenMovesList);

    const updateBoard = (index) => {
        // console.log("logging move state board")
        // console.log(moveStateArray[0][index]);
        // console.log(moveStateArray)
        // console.log(index)
        // setBoardState(moveStateArray[0][index]);
        setFen(fenMovesList[index]);
    }


    while (indexOccurance >= 0) {
        startingIndices.push(indexOccurance);
        indexOccurance = analysis.indexOf("(", indexOccurance + 1);
    }


    for (i = 0; i < startingIndices.length; i++) {
        var index = startingIndices[i];
        var endIndex = analysis.indexOf(")", index);
        var substring = analysis.substring(index, endIndex + 1);

        analysisArray.push(substring);
    }

    // useEffect(() => {
    //     var chess = new Chess();
    //     var chessMovesArray = [];
    //     var tempMap = new Map();

    //     if(analysisSection != undefined && resourcesSection != undefined) {
    //         // console.log("here")
    //         // console.log(analysisSection)
    //         // console.log("done")
    //         analysisPoints = analysisSection.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => line.trim());
    //         const tempMoveArray = []

    //         for(i = 0; i < analysisPoints.length; i++) {
    //             // we can go through each analysisPoint, extract the move number store it to our map, 
    //             // and then later we can use the map for when a user selects View on Board to get the appropriate board state   
    //             // getFirstMoveRoundInBracket(analysisPoints[i], tempParsedMoveMap, i); 
    //             tempMoveArray.push(getFirstMoveRoundInBracket(analysisPoints[i]));
    //         }
    //         //*********** */

    //         setAnalysisArrayState(tempMoveArray);
    //     }


    //     if (analysisArray.length > 0 && gameMap != undefined) {
    //         // console.log("gamemap is not undefined")
    //         // console.log(gameMap)
    //         setPlayerColor(gameMap.get(decodeKey).PlayerColor);
    //         const whiteMoves = gameMap.get(decodeKey).WhiteMoves;
    //         const blackMoves = gameMap.get(decodeKey).BlackMoves;

    //         // set parsedFirstText to the return response of reformatResponse function
    //         setParsedFirstTextState(reformatResponse(analysis, "A"));

    //         // how do I modify the move board with parsedMoveNumber 
    //         // don't want to refactor at the moment so might do a hacky solution for now
    //         // TODO: come back to this later to refactor because it'll become technical debt 
    //         for (let i = 0; i < analysisArray.length; i++) {
    //             var currentRound = analysisArray[i];
    //             chess = new Chess();

    //             // get the move number between the brackets
    //             // console.log("intiial analysis: " + analysisArray[i]);
    //             var moveNumber = currentRound.substring(currentRound.indexOf("(") + 1, currentRound.indexOf(")"));
    //             // convert the move number to an integer
    //             var convertedMoveNumber = parseInt(moveNumber);
    //             var j = 0;

    //             var moveMap = new Map();


    //             //COME BACK HERE
    //             // this is the ONLY place we need the converted move number, which affects our board array state 
    //             // the issue with this current approach is our board state array can have 3,4,5,6,7,etc. moves dependingon AI output
    //             for (j = 0; j < convertedMoveNumber; j++) {
    //                 if (moveMap.has(whiteMoves[j])) {
    //                     // repeat of moves
    //                     break;
    //                 };

    //                 if (whiteMoves[j] == "1-0" || blackMoves[j] == "1-0") {
    //                     continue;
    //                 }

    //                 chess.move(whiteMoves[j]);
    //                 chess.move(blackMoves[j]);


    //                 // set the chess game to the move state array 

    //                 moveMap.set(whiteMoves[j], blackMoves[j]);
    //             }

    //             chessMovesArray.push(chess);
    //         }
    //     }

    //     if (chessMovesArray != null && chessMovesArray.length > 0) {
    //         // what does chessMovesArray represent?
    //         // it is 
    //         // console.log("chessMovesArray: " + chessMovesArray);
    //         var moveStateMap = new Map();
    //         var tempArray = [];
    //         var j = 0;
            
    //         for(j = 0; j < chessMovesArray.length; j++) {
    //             if(!moveStateMap.has(chessMovesArray[j].fen())) {
    //                 tempArray.push(chessMovesArray[j]);
    //                 moveStateMap.set(chessMovesArray[j].fen(), 1);
    //             }
    //         }

    //         // console.log("tempArray: " + tempArray);

    //         setMoveStateArray(moveStateArray => [...moveStateArray, tempArray]);
    //     }

    //     if(analysisSection != undefined && resourcesSection != undefined) {
    //         analysisPoints = analysisSection.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => line.trim());
    //         // console.log("analysis points: " + analysisPoints);
    //         // console.log("analysis section: " + analysisSection);
            
    //         const tempParsedMoveMap = new Map();

    //         for(i = 0; i < analysisPoints.length; i++) {
    //             // we can go through each analysisPoint, extract the move number store it to our map, 
    //             // and then later we can use the map for when a user selects View on Board to get the appropriate board state   
    //             getFirstMoveRoundInBracket(analysisPoints[i], tempParsedMoveMap, i); 
    //         }

    //         setParsedMoveMap(tempParsedMoveMap);

    //         // console.log("parsed move round map" + tempParsedMoveMap.get(0) + " " + tempParsedMoveMap.get(1) + " " + tempParsedMoveMap.get(2));
    //         // Extract resource points
    //         resourcePoints = resourcesSection.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')).map(line => line.trim());
    
    //         // Split the string by comma and then trim each part to remove any extra whitespace
    //         if(resourcePoints != undefined) {
    //             resourceArray = resourcesSection.split(/(?=\d\.)/).map(point => point.trim());
    
    //             for(i = 0; i < resourceArray.length; i++) {
    //                 // what are our options here?
    //                 // option 1: store the resources in a map and then access the resources by the index of the analysisArray 
    //                 // option 2: store the resources in a map and then access the resources by the key of the html element (e.g. 1, 2, 3)
    //                 tempMap.set(i + 1, resourceArray[i]);
    //                 // console.log("resource map: " + tempMap.get(i + 1));
    //             }
    //             setResourceMap(tempMap);
    //         }
          
    
    //         if(analysisPoints != undefined) {
    //             setOrganizedAnalysisArray(analysisPoints);
    //             // setOrganizedAnalysisArray(analysisSection.split(/(?=\d\.)/).map(point => point.trim()));
    //             // organizedAnalysisArray = analysisSection.split(/(?=\d\.)/).map(point => point.trim());
    //         }
    //     }
    

    // }, [decodeKey]);

    const handleExampleClick = () => {
        console.log("yo")
    }

    return (
        <div className="overflow-hidden bg-gray-900 min-h-screen">
          <NavBar />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 items-start">
              {/* Left Column */}
              {/* <ChatInterface /> */}
    

              {/* <div className="lg:pr-8 lg:pt-4">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-indigo-400">
                    Analysis - you played as {playerColor}
                  </h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Your match with {chessOpponent}
                  </p>
                  <p className="mt-6 text-lg leading-8 text-gray-300">
                    Here is the analysis of your match! Use the carousel below to follow along with the
                    feedback and view the board state at each move.
                  </p> */}
    
                  {/* Carousel Wrapper */}
                  {/* <div className="mt-10">
                    <Carousel
                      className="relative rounded-xl w-full pb-12"
                      leftControl={
                        <button
                          type="button"
                          className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-10"
                          onClick={handleExampleClick}
                        >
                          <HiChevronLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                        </button>
                      }
                      rightControl={
                        <button
                          type="button"
                          onClick={handleExampleClick}
                          className="absolute top-1/2 -right-12 transform -translate-y-1/2 z-10"
                        >
                          <HiChevronRight className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                        </button>
                      }
                    >
                    </Carousel>
                  </div>
                </div>
              </div> */}

              {/* Right Column - Chessboard */}
              <div className="mt-4">
                <ProgressBar whiteChances={whiteChances} />
                <Chessboard
                  className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                  id="BasicBoard"
                  position={fen}
                />
                    {/* Carousel Wrapper */}
                <div className="mt-10">
                    <Pagination gameProbs={locationState ? gameProbs : []} setWhiteChances={setWhiteChances} setFen={setFen} fenMovesList={fenMovesList} updateBoard={updateBoard}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      );


    //   <Carousel
    //   className="relative rounded-xl w-full pb-12"
    //   leftControl={({ onClick, ...props }) => (
    //       <button
    //       type="button"
    //       {...props}
    //       onClick={(e) => {
    //           console.log("left clicked");
    //           onClick && onClick(e);
    //       }}
    //       onMouseDown={(e) => {
    //           console.log("left mouse down");
    //           onClick && onClick(e);
    //         }}
    //       className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-[50] pointer-events-auto"
    //       >
    //       <HiChevronLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
    //       </button>
    //   )}
    //   rightControl={({ onClick, ...props }) => (
    //       <button
    //         type="button"
    //         {...props}
    //         onClick={(e) => {
    //           console.log("right clicked");
    //           // Call the provided onClick only if it exists
    //           if (typeof onClick === "function") {
    //             onClick(e);
    //           }
    //         }}
    //         className="absolute top-1/2 -right-12 transform -translate-y-1/2 z-10"
    //       >
    //         <HiChevronRight className="h-6 w-6 text-gray-500 hover:text-gray-700" />
    //       </button>
    //     )}
    //   >
    //   {/* Your slide elements */}
    //   <div>Your Slide Content</div>
    //   <div>Your Second Slide</div>
    //   </Carousel>

    // return (
    //     <div className="overflow-hidden bg-gray-900 h-screen">
    //         <NavBar />
    //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
    //             <div className="mx-auto grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2">
    //                 <div className="lg:pr-8 lg:pt-4">
    //                     <div className=" ">
    //                         <h2 className="text-base font-semibold leading-7 text-indigo-400"> Analysis - you played as {playerColor} </h2>
                          
    //                         <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your match with {chessOpponent}</p>
    //                         <p className="mt-6 text-lg leading-8 text-gray-300">
    //                             Here is the analysis of your match! Use the carousel below follow along with the feedback and view the board state at each move.
    //                         </p>
    //                         {/* <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none"> */}
    //                         {/* <CardCarousel organizedAnalysisArray={organizedAnalysisArray} /> */}
    //                         <Carousel
    //                             className="relative rounded-xl mt-10 w-full pb-12"
    //                             leftControl={
    //                             <button
    //                                 type="button"
    //                                 className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-10"
    //                             >
    //                                 <HiChevronLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
    //                             </button>
    //                             }
    //                             rightControl={
    //                             <button
    //                                 type="button"
    //                                 className="absolute top-1/2 -right-12 transform -translate-y-1/2 z-10"
    //                             >
    //                                 <HiChevronRight className="h-6 w-6 text-gray-500 hover:text-gray-700" />
    //                             </button>
    //                             }
    //                         >
    //                         {organizedAnalysisArray
    //                         .filter((item, idx) => !item.includes("Analysis"))
    //                         .map((item, index) => {
    //                             const newVariable = index; // or your logic to create newVariable
                            
    //                             return (
    //                             <TextCard
    //                                 key={newVariable} // Provide a unique key
    //                                 textData={item}
    //                                 index={newVariable}
    //                                 open={open}
    //                                 setOpen={setOpen}
    //                                 resources={resources}
    //                                 resourceMap={resourceMap}
    //                                 setResourcePopUpText={setResourcePopupText}
    //                                 resourcePopUpText={resourcePopupText}
    //                                 setTitlePopupText={setTitlePopupText}
    //                                 titlePopupText={titlePopupText}
    //                                 setMoveStateArray={setMoveStateArray}
    //                                 setFen={setFen}
    //                                 moveStateArray={moveStateArray}
    //                                 setBoardState={setBoardState}
    //                                 parsedMoveMap={parsedMoveMap}
    //                             />
    //                             );
    //                         })}
    //                         </Carousel>
    //                         {/* </dl> */}
    //                         {/* <Pagination /> */}
    //                     </div>
    //                 </div>
    //                 <Chessboard class="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" id="BasicBoard" position={fen} />
    //             </div>
    //         </div>
    //     </div>
    // )
}

export default function DarkModeAnalysis(currentGame) {
    const [open, setOpen] = useState(true)
    const { key } = useParams();
    const [decodeKey, setDecodeKey] = useState("");
    const [chessAnalysis, setChessAnalysis] = useState("")
    const [chessOpponent, setChessOpponent] = useState("")
    const [gameProbs, setGameProbs] = useState([])
    const [locationState, setLocationState] = useState(null);
    const [fen, setFen] = useState('start');
    const [currentMoveRound, setCurrentMoveRound] = useState(0);
    const [fenMovesList, setFenMovesList] = useState([]);
    var gameMoves = [];
    const location = useLocation();
    // const gameMap = location.state?.gameMap
    // deserialize the gameMap
    const cachedMap = localStorage.getItem('gameMap');
    const gameMap = new Map(JSON.parse(cachedMap));

    useEffect(() => {
        if (gameMap.size > 0 && location.state != null) {
            console.log("cached game map")
            console.log(gameMap)
            console.log(gameMap.get(location.state.key))
            console.log(location.state.key)
            setDecodeKey(location.state.key);
            setLocationState(location.state);
            setGameProbs(gameMap.get(location.state.key).probabilitiesList)
            gameMoves = gameMap.get(location.state.key).lanMovesList;
            setFenMovesList(gameMap.get(location.state.key).fenValuesList);
            console.log("yooo");
            console.log(gameMap.get(location.state.key).fenValuesList);
            // setChessAnalysis(gameMap.get(location.state.key).Analysis);
            // setChessOpponent(gameMap.get(location.state.key).Opponent);
        }

    }, []);
    const [whiteChances, setWhiteChances] = useState("57.5%");

    const updateBoard = (index) => {
        // console.log("logging move state board")
        // console.log(moveStateArray[0][index]);
        // console.log(moveStateArray)
        // console.log(index)
        // setBoardState(moveStateArray[0][index]);
        setFen(fenMovesList[index]);
    }

    return (
        //py-24 sm:py-32

        // <ThreeColumn />
        <div>
            <NavBar />
            <ThreeColumnLayout
             whiteChances={whiteChances}
              fenMovesList={fenMovesList} 
              updateBoard={updateBoard} 
              fen={fen} 
              gameProbs={gameProbs} 
              locationState={locationState} 
              setFen={setFen} 
              setFenMovesList={setFenMovesList} 
              setWhiteChances={setWhiteChances} 
              />
        </div>

        // <LeftSide
        //     game={currentGame}
        //     decodeKey={decodeKey}
        //     chessAnalysis={chessAnalysis}
        //     chessOpponent={chessOpponent}
        //     setChessAnalysis={setChessAnalysis}
        //     setChessOpponent={setChessOpponent}
        //     gameProbs={gameProbs}
        //     locationState={locationState}
        //     fenMovesList={fenMovesList}
        // />
        // <div className="overflow-hidden bg-gray-900 ">
        //     <NavBar />
        //     <div className="mx-auto max-w-7xl px-6 lg:px-8">
        //         <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        //             <div className="lg:pr-8 lg:pt-4">
        //                 <div className="lg:max-w-lg">
        //                     <h2 className="text-base font-semibold leading-7 text-indigo-400">Deploy faster</h2>
        //                     <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">A better workflow</p>
        //                     <p className="mt-6 text-lg leading-8 text-gray-300">
        //                         Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque,
        //                         iste dolor cupiditate blanditiis ratione.
        //                     </p>
        //                     <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
        //                         {features.map((feature) => (
        //                             <div key={feature.name} className="relative pl-9">
        //                                 <dt className="inline font-semibold text-white">
        //                                     <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-500" aria-hidden="true" />
        //                                     {feature.name}
        //                                 </dt>{' '}
        //                                 <dd className="inline">{feature.description}</dd>
        //                             </div>
        //                         ))}
        //                     </dl>

        //                     <Pagination />
        //                 </div>
        //             </div>
        //             <Chessboard class="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" id="BasicBoard" />
        //             {/* <img
        //                 src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
        //                 alt="Product screenshot"
        //                 className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
        //                 width={2432}
        //                 height={1442}
        //             /> */}
        //         </div>
        //     </div>
        // </div>
    )
}