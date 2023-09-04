import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Chessboard } from "react-chessboard";
import { useParams, useLocation } from 'react-router-dom';
import { gameMap } from '../App.js';
import { Chess } from 'chess.js';

export default function Analysis(currentGame) {
    const [open, setOpen] = useState(true)
    const { key } = useParams();
    const [decodeKey, setDecodeKey] = useState("");
    const [chessAnalysis, setChessAnalysis] = useState("")
    const [chessOpponent, setChessOpponent] = useState("")
    const location = useLocation();

    useEffect(() => {
        if (gameMap.size > 0 && location.state != null) {
            setDecodeKey(location.state.key);
            setChessAnalysis(gameMap.get(location.state.key).Analysis);
            setChessOpponent(gameMap.get(location.state.key).Opponent);
        }

    }, []);

    return (
        // pass in currentGame to LeftSide 
        <LeftSide
            game={currentGame}
            decodeKey={decodeKey}
            chessAnalysis={chessAnalysis}
            chessOpponent={chessOpponent}
            setChessAnalysis={setChessAnalysis}
            setChessOpponent={setChessOpponent}
        />
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
            // update stateText using setStateText function by appending splitStrings[i]
            reformattedResponse.push(splitStrings[i]);
        }

    } else {
        // Resources
    }

    return reformattedResponse;
}

const LeftSide = ({
    decodeKey,
    chessAnalysis,
    setChessAnalysis,
    chessOpponent,
    setChessOpponent
}) => {

    const [fen, setFen] = useState('start');
    // split the string based on the string delimetor "Resources"
    var analysisArray = chessAnalysis.split("Resources");
    var analysis = analysisArray[0];
    // reformatResponse(analysisArray[1], "R");
    var resources = analysisArray[1];
    var analysisArray = [];
    const [analysisArrayState, setAnalysisArrayState] = useState([]);
    const [parsedFirstText, setParsedFirstTextState] = useState([]);
    // get all occurances of "(" in the analysis string
    // get all occurances of ")" in the analysis string and store to a list

    let indexOccurance = analysis.indexOf("(", 0);
    var startingIndices = [];
    var i = 0;
    const chess = new Chess();

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

    useEffect(() => {
        var chess = new Chess();
        var chessMovesArray = [];

        if (analysisArray.length > 0) {
            const whiteMoves = gameMap.get(decodeKey).WhiteMoves;
            const blackMoves = gameMap.get(decodeKey).BlackMoves;


            for (i = 0; i < startingIndices.length; i++) {
                var index = startingIndices[i];
                var endIndex = analysis.indexOf(")", index);
                var substring = analysis.substring(index, endIndex + 1);

                setAnalysisArrayState(analysisArrayState => [...analysisArrayState, substring]);
            }


            // set parsedFirstText to the return response of reformatResponse function
            console.log(analysis)
            setParsedFirstTextState(reformatResponse(analysis, "A"));

            for (let i = 0; i < analysisArray.length; i++) {
                var currentRound = analysisArray[i];
                chess = new Chess();

                // get the move number between the brackets
                var moveNumber = currentRound.substring(currentRound.indexOf("(") + 1, currentRound.indexOf(")"));
                // convert the move number to an integer
                var convertedMoveNumber = parseInt(moveNumber);

                var j = 0;

                var moveMap = new Map();

                for (j = 0; j < convertedMoveNumber; j++) {
                    if (moveMap.has(whiteMoves[j])) {
                        // repeat of moves
                        break;
                    };

                    if (whiteMoves[j] == "1-0" || blackMoves[j] == "1-0") {
                        continue;
                    }

                    chess.move(whiteMoves[j]);
                    chess.move(blackMoves[j]);

                    chessMovesArray.push(chess);
                    moveMap.set(whiteMoves[j], blackMoves[j]);
                }
            }
        }

        setFen(chess.fen());
    }, [decodeKey]);

    const Pagination = () => {

        let itemList = analysisArrayState.map((item, index) => {
            return <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">{index + 1}</a>
        })

        return (
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        <span class="sr-only">Previous</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                    </a>
                    {/* make a loop  to populate a tags*/}
                    <a href="#" aria-current="page" class="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">1</a>
                    {itemList}
                    {/* <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">2</a>
                    <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex">3</a>
                    <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
                    <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex">8</a>
                    <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">9</a>
                    <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">10</a> */}
                    <a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        <span class="sr-only">Next</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </nav>
            </div>
        )
    }

    let parsedFirstTextList = parsedFirstText.map((item, index) => {
        console.log(item);
        return <p mt-6 text-xl leading-8 text-gray-700>{item}<br /></p>
    });

    return (
        <div class="relative isolate overflow-hidden bg-white px-6 py-12 sm:py- lg:overflow-visible lg:px-0">
            <div class="absolute inset-0 -z-10 overflow-hidden">
                <svg class="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
                    <defs>
                        <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                            <path d="M100 200V.5M.5 .5H200" fill="none" />
                        </pattern>
                    </defs>
                    <svg x="50%" y="-1" class="overflow-visible fill-gray-50">
                        <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" stroke-width="0" />
                    </svg>
                    <rect width="100%" height="100%" stroke-width="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
                </svg>
            </div>
            <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                <div class="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                    <div class="lg:pr-4">
                        <div class="lg:max-w-lg">
                            <p class="text-base font-semibold leading-7 text-indigo-600">Deploy faster</p>
                            <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your match with {chessOpponent}</h1>
                            {/* <p class="mt-6 text-xl leading-8 text-gray-700">{temp}</p> */}
                            {parsedFirstTextList}
                        </div>
                    </div>
                </div>
                <div class="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                    {/* <img class="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png" alt="" /> */}
                    <Chessboard class="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" id="BasicBoard" position={fen} />
                    <Pagination analysisArray={analysisArray} />
                </div>
                <div class="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                    <div class="lg:pr-4">
                        <div class="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
                            <p>{resources}</p>
                            <ul role="list" class="mt-8 space-y-8 text-gray-600">
                                <li class="flex gap-x-3">
                                    <svg class="mt-1 h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
                                    </svg>
                                    <span><strong class="font-semibold text-gray-900">Push to deploy.</strong> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.</span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="mt-1 h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                                    </svg>
                                    <span><strong class="font-semibold text-gray-900">SSL certificates.</strong> Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="mt-1 h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" />
                                        <path fill-rule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clip-rule="evenodd" />
                                    </svg>
                                    <span><strong class="font-semibold text-gray-900">Database backups.</strong> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</span>
                                </li>
                            </ul>
                            {/* <p class="mt-8">Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis odio id et. Id blandit molestie auctor fermentum dignissim. Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate et ultrices hac adipiscing egestas. Iaculis convallis ac tempor et ut. Ac lorem vel integer orci.</p>
                            <h2 class="mt-16 text-2xl font-bold tracking-tight text-gray-900">No server? No problem.</h2>
                            <p class="mt-6">Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam consequat in. Convallis arcu ipsum urna nibh. Pharetra, euismod vitae interdum mauris enim, consequat vulputate nibh. Maecenas pellentesque id sed tellus mauris, ultrices mauris. Tincidunt enim cursus ridiculus mi. Pellentesque nam sed nullam sed diam turpis ipsum eu a sed convallis diam.</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}