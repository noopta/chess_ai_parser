import { ChatBubbleOvalLeftEllipsisIcon, CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid';
import { Chessboard } from "react-chessboard";
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { useParams, useLocation } from 'react-router-dom';
import { gameMap } from '../App.js';
import { Chess } from 'chess.js';

const features = [
    {
        name: '1.',
        description:
            'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.',
        icon: ChatBubbleOvalLeftEllipsisIcon,
    },
    {
        name: '2.',
        description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
        icon: ChatBubbleOvalLeftEllipsisIcon,
    },
    {
        name: '3.',
        description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.',
        icon: ChatBubbleOvalLeftEllipsisIcon,
    },
]

const navigation = [
    { name: 'Analysis', href: '#', current: true },
    { name: 'About', href: '#', current: false },
    { name: 'Contact', href: '#', current: false }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function NavBar() {
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
                                <div className="flex flex-shrink-0 items-center">
                                    <img
                                        className="h-8 w-auto"
                                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                        alt="Your Company"
                                    />
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <a
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
                                <button
                                    type="button"
                                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>

                                {/* Profile dropdown */}
                                <Menu as="div" className="relative ml-3">
                                    <div>
                                        <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                            <span className="absolute -inset-1.5" />
                                            <span className="sr-only">Open user menu</span>
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt=""
                                            />
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                    >
                                                        Your Profile
                                                    </a>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                    >
                                                        Settings
                                                    </a>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                    >
                                                        Sign out
                                                    </a>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
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
            if (splitStrings[i].length == 0 || splitStrings[i] == "Analysis:") {
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
    const [boardState, setBoardState] = useState(new Chess());
    const [moveStateArray, setMoveStateArray] = useState([]);

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


                    // set the chess game to the move state array 

                    moveMap.set(whiteMoves[j], blackMoves[j]);
                }

                chessMovesArray.push(chess);
            }
        }

        console.log(chessMovesArray);
        if (chessMovesArray != null && chessMovesArray.length > 0) {
            setMoveStateArray(moveStateArray => [...moveStateArray, chessMovesArray]);
        }

    }, [decodeKey]);

    function Pagination() {

        const logInnerHtml = (e) => {
            console.log(e.target.innerHTML);

            if (moveStateArray.length > 0) {
                console.log(typeof e.target.innerHTML)
                if (parseInt(e.target.innerHTML == 1)) {
                    console.log("string");
                }

                var index = parseInt(e.target.innerHTML) - 1;
                console.log(moveStateArray)
                setBoardState(moveStateArray[0][index]);
                setFen(moveStateArray[0][index].fen());
            }
        }

        let itemList = analysisArrayState.map((item, index) => {
            return <a onClick={logInnerHtml} href="#" class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">{index + 1}</a>
        })

        return (
            <nav className="flex items-center justify-between border-gray-200 px-4 sm:px-6 py-10">
                <div className="-mt-px flex w-0 flex-1">
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Previous
                    </a>
                </div>
                <div className="hidden md:-mt-px md:flex">

                    {itemList}
                    {/* <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        1
                    </a>
                    {/* Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" */}
                    {/* <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-indigo-500 px-4 pt-4 text-sm font-medium text-indigo-600"
                        aria-current="page"
                    >
                        2
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        3
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        8
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        9
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        10
                    </a>  */}
                </div>
                <div className="-mt-px flex w-0 flex-1 justify-end">
                    <a
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        Next
                        <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </a>
                </div>
            </nav>
        )
    }

    let parsedFirstTextList = parsedFirstText.map((item, index) => {
        return <p mt-6 text-xl leading-8 text-gray-700>{item}<br /></p>
    });

    return (
        <div className="overflow-hidden bg-gray-900 ">
            <NavBar />
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="lg:pr-8 lg:pt-4">
                        <div className="lg:max-w-lg">
                            <h2 className="text-base font-semibold leading-7 text-indigo-400">Deploy faster</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your match with {chessOpponent}</p>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                {/* Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque,
                                iste dolor cupiditate blanditiis ratione. */}
                                {/* {parsedFirstTextList} */}
                                Here is the analysis of your match! Use the pagination below to use the board to follow along with the feedback.
                            </p>
                            <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                                {/* {features.map((feature) => (
                                    <div key={feature.name} className="relative pl-9">
                                        <dt className="inline font-semibold text-white">
                                            <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-500" aria-hidden="true" />
                                            {feature.name}
                                        </dt>{' '}
                                        <dd className="inline">{feature.description}</dd>
                                    </div>
                                ))} */}

                                {parsedFirstText.map((item, index) => (

                                    <div key={index} className="relative pl-9">
                                        <dt className="inline font-semibold text-white">
                                            <ChatBubbleOvalLeftEllipsisIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-500" aria-hidden="true" />
                                        </dt>{' '}
                                        <dd className="inline">{item}</dd>
                                    </div>
                                ))}
                            </dl>

                            <Pagination />
                        </div>
                    </div>
                    <Chessboard class="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" id="BasicBoard" position={fen} />
                    {/* <img
                        src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                        alt="Product screenshot"
                        className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                        width={2432}
                        height={1442}
                    /> */}
                </div>
            </div>
        </div>
    )
}

export default function DarkModeAnalysis(currentGame) {
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
        //py-24 sm:py-32

        <LeftSide
            game={currentGame}
            decodeKey={decodeKey}
            chessAnalysis={chessAnalysis}
            chessOpponent={chessOpponent}
            setChessAnalysis={setChessAnalysis}
            setChessOpponent={setChessOpponent}
        />
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