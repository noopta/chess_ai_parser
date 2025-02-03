import './App.css';
import DarkModeAnalysis from './analysisComponents/DarkModeAnalysis';
import React, { Fragment, useState, useEffect, useRef, forwardRef } from 'react';
import { Bars3Icon, BellIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
// import backgroundVideo from './chess_game_ai_2.mp4'
import VideoBackground from './analysisComponents/VideoBackground';
import Layout from './analysisComponents/Layout';
import ChessLoading from './analysisComponents/ChessLoading';
import DropdownMenu from './analysisComponents/DropdownMenu';
import AnimatedPolygon from './analysisComponents/AnimatedPolygon';
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import InfiniteLoading from './analysisComponents/InfiniteLoading';
import grpc from 'grpc-web';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Typography,
  Progress
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import AlertDialog from './analysisComponents/AlertDialog';
import { ChessServiceClient } from './generated/stockfishai_grpc_web_pb';
import { ProfileRequestData } from './generated/stockfishai_pb';

// Array of JSON objects
var globalGames = [];

// const rpcClient = new ChessServiceClient('http://ec2-18-221-162-109.us-east-2.compute.amazonaws.com:50051', null, null);
// export const gameMap = new Map();

const rpcClient = new ChessServiceClient('http://ec2-18-221-162-109.us-east-2.compute.amazonaws.com', {
  transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
});

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
        <Route exact path="/" element={<HeroSection />} />
        <Route path="/analysis" element={<DarkModeAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
}

const Spinner = () => {
  return (
    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  )
}

const LandingForm = (showComponent, setShowComponent, setGameMap) => {
  const handleSubmit = (event) => {
    event.preventDefault(); 
    // This p"I am going to give you two sets of chess moves followed by the color of the player. I want you to write a 15-20 word enthusiastic summary on the players game and if they won or lost. Both move sets are from the same game" revents the default behavior of form submission (page refresh)
    // Add your form submission logic here, if needed
    // For example, you can access form data using event.target and perform actions based on it
    // console.log("yo")

    // setShowComponent(true)
  }

  const [showModel, setShowModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleModelToggle = () => {
    setShowModel(!showModel);
  };


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
      <Disclosure as="nav" className="bg-gray-800 z-20">
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
  return (
    <>
      {/* {LandingInputForm(showComponent, setShowComponent, setGameMap)} */}
      <LandingInputForm showComponent={showComponent} setShowComponent={setShowComponent} setGameMap={setGameMap}/>
    </>
  )
}

const CubeSpinner = () => {
  return (
    <main>
      <svg class="ip" viewBox="0 0 256 128" width="256px" height="128px" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#5ebd3e" />
            <stop offset="33%" stop-color="#ffb900" />
            <stop offset="67%" stop-color="#f78200" />
            <stop offset="100%" stop-color="#e23838" />
          </linearGradient>
          <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stop-color="#e23838" />
            <stop offset="33%" stop-color="#973999" />
            <stop offset="67%" stop-color="#009cdf" />
            <stop offset="100%" stop-color="#5ebd3e" />
          </linearGradient>
        </defs>
        <g fill="none" stroke-linecap="round" stroke-width="16">
          <g class="ip__track" stroke="#ddd">
            <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
            <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
          </g>
          <g stroke-dasharray="180 656">
            <path class="ip__worm1" stroke="url(#grad1)" stroke-dashoffset="0" d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
            <path class="ip__worm2" stroke="url(#grad2)" stroke-dashoffset="358" d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
          </g>
        </g>
      </svg>
    </main>
  )
}

const LoadingModel2 = ({isLoading, setIsLoading, analysisProgress, username, numGames, abortControllers, setAnalysisProgress, resetProgressAsync}) => {
  // console.log("loading model " + isLoading) 
  
  return(
    <Dialog open={isLoading} handler={() => {}} className="p-4">
    <DialogHeader className="relative m-0 block">
      <Typography variant="h4" color="blue-gray">
        Analysis Progress
      </Typography>
      <Typography className="mt-1 font-normal text-gray-600">
        Please wait while we process analysis for your games. Estimated wait time is between 1-2 minutes. You can track the progress below.
      </Typography>
      <IconButton
        size="sm"
        variant="text"
        className="!absolute right-3.5 top-3.5"
        onClick={() => {
          // resetProgressAsync()
          // setAnalysisProgress(0)
          setIsLoading(false)
          abortControllers.current.forEach(controller => controller.abort());
          // Clear the controllers
          abortControllers.current = [];
        }}
      >
        <XMarkIcon className="h-4 w-4 stroke-2" />
      </IconButton>
    </DialogHeader>
    <DialogBody>
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between gap-4">
          <Typography
            color="blue-gray"
            variant="small"
            className="font-semibold"
          >
            Analysing...
          </Typography>
          <Typography
            variant="small"
            className="font-semibold text-gray-600"
          >
            {/* state */}
            {analysisProgress}%
          </Typography>
        </div>
        {/* pass in state */}
        <Progress value={analysisProgress} className="smooth-progress"/>
      </div>
      <div className="mt-6 flex gap-16">
        <div>
          <Typography className="font-normal text-gray-600">
            {/* state */}
            Username
          </Typography>
          <Typography color="blue-gray" className="font-semibold">
            {/* state */}
            {username}
          </Typography>
        </div>
        <div>
          <Typography className="font-normal text-gray-600">
            Number of Games 
          </Typography>
          <Typography color="blue-gray" className="font-semibold">
            {numGames}
          </Typography>
        </div>

      </div>
    </DialogBody>
    <DialogFooter className="flex flex-wrap justify-between gap-4">
      <Typography
        variant="small"
        className="flex gap-2 font-normal text-gray-600 md:items-center"
      >
        <InformationCircleIcon className="h-5 w-5 text-gray-900" />
        Closing this window may interrupt the analysis process.
      </Typography>
      <Button onClick={() => {
            // resetProgressAsync()
            // setAnalysisProgress(0)
            setIsLoading(false)
            abortControllers.current.forEach(controller => controller.abort());
            // Clear the controllers
            abortControllers.current = [];
          }
        } className="w-full lg:max-w-fit">
        cancel analysis
      </Button>
    </DialogFooter>
  </Dialog>
  )
}

const LoadingModel = () => {
  return (
    <div class="relative z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-centre">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Loading Games</h3>
                  <div class="mt-2 text-centre content-centre">
                    {/* <Spinner /> */}
                    {/* <CubeSpinner /> */}
                    {/* {<InfiniteLoading/>} */}
                    {/* <ChessLoading/> */}
                    <AnimatedPolygon/>
                    <p class="text-sm text-gray-500">Hold on a bit! We are working our hardest to analyze your games, after all good things take time.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">Deactivate</button>
              <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

function toHexString(byteArray) {
  return Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

// Generate a random hash using the Crypto API
async function generateRandomHash() {
  const data = new Uint8Array(32); // 32 bytes for a 256-bit hash
  window.crypto.getRandomValues(data); // Fill the array with random values

  const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Generate the hash
  const hashHex = toHexString(new Uint8Array(hashBuffer)); // Convert hash to hex string
  return hashHex;
}

const MakePostRequest = async ({ isLoading, setIsLoading, setData, chessUsername, monthState, yearState, numGames, setAnalysisProgress, analysisProgress, monthToDigitMap, abortControllers, setGameMap, resetProgressAsync, progressRef, setShowAlert, setAlertDialog }) => {
  // useEffect(() => {
  // const fetchData = async () => {
  // console.log("fetching data")
  // const url = 'https://ol4gm9f3k0.execute-api.us-east-2.amazonaws.com/chess-parser-lambda'
  // const url = 'https://non68do8s4.execute-api.us-east-2.amazonaws.com/prod'
  const url = 'https://4vz6fr5rinuhsspb6rh5alkige0jrcmo.lambda-url.us-east-2.on.aws/'

  try {
    // console.log("here")
    setIsLoading(true);
    setAnalysisProgress(0)

    const controller = new AbortController();
    abortControllers.current.push(controller)
    // console.log("abort controllers")
    // console.log(abortControllers.length);
    // console.log(isLoading)
    // console.log("before fetch")
    // console.log("monthState " + monthState)
    // console.log("monthMap val " + monthToDigitMap[monthState])
    // console.log("updating progress " + analysisProgress)
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // Set the appropriate content-type
        // Set the appropriate content-type
      },
      body: JSON.stringify({
        /* Your request data here */
        'username': chessUsername,
        // 'month': monthState,
        'month': monthToDigitMap[monthState],
        'year': yearState,
        'numGames': numGames
      }), // Convert your request data to JSON
    });

    // console.log("here2")
    const responseData = await response.text();

    // console.log("loggin response")

    if (!response.ok) {
      setAlertDialog(responseData)
      setShowAlert(true);

      throw new Error('Network response was not ok.');
    }

    var jsonBody = JSON.parse(responseData)


    var tempMap = new Map();

    for (var i = 0; i < jsonBody.length; i++) {

      var cleanedWhiteMoves = jsonBody[i]['whiteMoves']
      var cleanedBlackMoves = jsonBody[i]['blackMoves']
      var cleanedOpponentName = jsonBody[i]['opponent']
      var cleanedPlayerColor = jsonBody[i]['playerColor']
      var cleanedMatchBlurb = jsonBody[i]['matchBlurb']
      var cleanedAnalysis = jsonBody[i]['analysis']
      var matchPgn = jsonBody[i]['pgn']

      // generate a random hash fmor each game 
      var matchHash = await generateRandomHash();

      // console.log(matchPgn)

      var jsonObj = {
        "WhiteMoves": cleanedWhiteMoves,
        "BlackMoves": cleanedBlackMoves,
        "Opponent": cleanedOpponentName,
        "PlayerColor": cleanedPlayerColor,
        "MatchBlurb": cleanedMatchBlurb,
        "Analysis": cleanedAnalysis
      }

      globalGames.push(jsonObj)
      tempMap.set(matchHash, jsonObj)
    }

    setGameMap(tempMap)
    localStorage.setItem('gameMap', JSON.stringify(Array.from(tempMap.entries())));
    // updateProgress(analysisProgress, 99)
    if (responseData == "200") {
      // updateProgress(100)
      // updateProgress(95, 100)
      // get games from MongoDB
      setAnalysisProgress(0)
      console.log("200")
    }
    // setResponseData(data); // Handle the response data as needed
  } catch (error) {
    // setAnalysisProgress(0)
    setAnalysisProgress(0)
    console.error('Error:', error);
    // Handle errors appropriately (e.g., show an error message to the user)
  } finally {
    // come back here later
    setAnalysisProgress(0)
    // resetProgressAsync()

    // setAnalysisProgress(0)
    setIsLoading(false);
  }
  // }
  // fetchData();
  // console.log("after fetch")
  // }, []);

  return globalGames.length > 0 ? 200 : 400;
};

const GetGames = async (showComponent, setShowComponent, isLoading, setIsLoading, data, setData, chessUsername, monthState, yearState, numGames, setAnalysisProgress, analysisProgress, monthToDigitMap, abortControllers, setGameMap, resetProgressAsync, progressRef, setShowAlert, setAlertDialog) => {
  // console.log("get games")

  if(numGames >= 11 || numGames <= 0) {
    setAlertDialog("Please enter a number of games between 1 and 10")
    setShowAlert(true)
    return;
  }

  // if numGames is not a number
  if (isNaN(numGames)) {
    setAlertDialog("Please enter a valid number of games")
    setShowAlert(true)
    return;
  }

  try {
    // console.log("logging current month")
    // console.log(monthToDigitMap[monthState])
    var requestResponse = await MakePostRequest({ isLoading, setIsLoading, setData, chessUsername, monthState, yearState, numGames, setAnalysisProgress, analysisProgress, monthToDigitMap, abortControllers, setGameMap , resetProgressAsync, progressRef, setShowAlert, setAlertDialog})
  } catch {
    console.log("error")
  } finally {
    // console.log("finally")
    // TODO: uncomment after testing
    if (requestResponse == 200) {
      // setAnalysisProgress(0)
      // resetProgressAsync()
      setShowComponent(true)
    }
  }

  if (!data) return (
    <span>Data not available</span>
  )
}


const HeroSection = (props) => {
  const [showComponent, setShowComponent] = useState(false);
  const listGamesRef = useRef(null);
  const monthToNumMap = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09", 
    "October": "10",
    "November": "11",
    "December": "12"
  }
  const navigation = [
    { name: 'Home', href: '/', current: true }
    // { name: 'About', href: '#', current: false }
  ]

  // const gameMap = new Map();
  const [gameMap, setGameMap] = useState(new Map());
  const location = useLocation();

  useEffect(() => {
    if (showComponent && listGamesRef.current) {
      // Scroll to the ListGames component
      listGamesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showComponent]);

  // deserialization
  useEffect(() => {
    const cachedMap = localStorage.getItem('gameMap');
    if (cachedMap) {
      // console.log("cached mapp")
      var i = 0
      var tempMap = new Map()
      var parsedJsonData = JSON.parse(cachedMap)

      for(i = 0; i < parsedJsonData.length; i++) {
        var parsedData = parsedJsonData[i]

        tempMap.set(parsedData[0], parsedData[1])
      }

      setGameMap(tempMap);
      setShowComponent(true);
    }
  }, [location]);

  // serialization
  // useEffect(() => {
  //   localStorage.setItem('gameMap', JSON.stringify(Array.from(gameMap.entries())));
  // }, [gameMap]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  function NavBar() {
    const navigate = useNavigate();
    return (
      <Disclosure as="nav" className="bg-transparent fixed w-full z-20">
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

  const ListGames = forwardRef(({ gameMap }, ref) => {
    const navigate = useNavigate();

    const gameItems = [];
  
    for (const [key, currentGame] of gameMap.entries()) { 
      // console.log("key: " + key + " value: " + currentGame)
      gameItems.push( 
        <li className="relative flex items-center space-x-4 py-4">
        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-x-3">
            <div className={classNames("text-green-400 bg-green-400/10", 'flex-none rounded-full p-1')}>
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            
            <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
              <a onClick={() => {
                navigate('/analysis', {
                  state: { key: encodeURIComponent(key), gameMap: gameMap }
                });
              }} href="#" className="flex gap-x-2">
                <span className="truncate">{currentGame["Opponent"]}</span>
                <span className="text-gray-400">/</span>
                <span className="whitespace-nowrap">{currentGame["PlayerColor"]}</span>
                <span className="absolute inset-0" />
              </a>
            </h2>
          </div>
          <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
            <p className="truncate">{currentGame["MatchBlurb"]}</p>
            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300">
              <circle cx={1} cy={1} r={1} />
            </svg>
            <p className="whitespace-nowrap">Initiated</p>
          </div>
        </div>
        <div
          className={classNames(
            environments["Production"],
            'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
          )}
        >
          View Game
        </div>
        <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
      </li>
      ); 
    }


    return (
      <div ref={ref}>
      <ul role="list" className="divide-y divide-white/5">
        {gameItems}
      </ul>
      </div>
    )
  });


  return (
    <>
      <html class="h-full">
          <body className="h-full relative">
          {/* Video Background */}
          <div className="fixed inset-0 bg-black opacity-50 h-screen"></div>
          {/* Content */}
          <NavBar />
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-2xl py-32">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Chess analysis with AI, tailored for your skill set.
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-200">
                  Get started by entering a Chess.com username to get feedback on your recent games.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  {LandingForm(showComponent, setShowComponent, setGameMap)}
                </div>
              </div>
            </div>
            {showComponent ? <ListGames ref={listGamesRef} gameMap={gameMap} /> : null}
          </div>
        </body>
      </html>
      {/* {showComponent ? <GenerateGrid /> : null} */}
    </>
  )
}

function FeedbackForm() {

  const [isOpen, setIsOpen] = useState(false)

  const handleOverlayClick = (event) => {
    // Prevent the click event from propagating to underlying elements
    event.stopPropagation();
  };

  const handleCloseModal = () => {
    // Add your code here to handle modal closure
  };

  return (
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" onClick={handleCloseModal}>
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" onClick={(event) => event.stopPropagation()}>
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <InputForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormButtonClick = (event) => {
    // Access the inputValue here and do whatever you want with it
    event.preventDefault();
    // console.log("first name = " + firstName);
    // console.log("last name = " + lastName);
    // console.log("email = " + email);
    // console.log("message " + message);
  };

  return (
    <div class="isolate bg-white px-6 py-24 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Feedback Form</h2>
        <p class="mt-2 text-lg leading-8 text-gray-600">Your critiques and compliments matter! Feel free to fill out the following form and let us know what you loved, or what we can improve on.</p>
      </div>
      <form class="mx-auto mt-16 max-w-xl sm:mt-20" onSubmit={handleFormButtonClick}>
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label for="first-name" class="block text-sm font-semibold leading-6 text-gray-900">First namee</label>
            <div class="mt-2.5">
              <input type="text" value={firstName} onChange={handleFirstNameChange} name="first-name" id="first-name" autocomplete="given-name" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div>
            <label for="last-name" class="block text-sm font-semibold leading-6 text-gray-900">Last name</label>
            <div class="mt-2.5">
              <input type="text" value={lastName} onChange={handleLastNameChange} name="last-name" id="last-name" autocomplete="family-name" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div class="sm:col-span-2">
            <label for="email" class="block text-sm font-semibold leading-6 text-gray-900">Email</label>
            <div class="mt-2.5">
              <input type="email" value={email} onChange={handleEmailChange} name="email" id="email" autocomplete="email" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div class="sm:col-span-2">
            <label for="message" class="block text-sm font-semibold leading-6 text-gray-900">Message</label>
            <div class="mt-2.5">
              <textarea name="message" value={message} onChange={handleMessageChange} id="message" rows="4" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
            </div>
          </div>
        </div>
        <div class="mt-10">
          <button type="submit" class="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Send message</button>
        </div>
      </form>
    </div>

  )
}

function LandingInputForm({showComponent, setShowComponent, setGameMap}) {
  const date = new Date();
  // const defaultMonth = String((date.getMonth() + 1)).padStart(2, '0');
  const defaultMonth = "January";
  const defaultYear = date.getFullYear().toString();

  const [showModel, setShowModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [data, setData] = useState(null);
  const [chessUsername, setChessUsername] = useState("");
  const [monthState, setMonthState] = useState("January");
  const [yearState, setYearState] = useState(defaultYear);
  const [yearTitleState, setYearTitleState] = useState("Select Year");
  const [monthTitleState, setMonthTitleState] = useState("Select Month");
  const [numGames, setNumGames] = useState(0);
  const monthToDigitMap = new Map();
  const [alertDialog, setAlertDialog] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  monthToDigitMap["January"] = "01";
  monthToDigitMap["February"] = "02";
  monthToDigitMap["March"] = "03";
  monthToDigitMap["April"] = "04";
  monthToDigitMap["May"] = "05";
  monthToDigitMap["June"] = "06";
  monthToDigitMap["July"] = "07";
  monthToDigitMap["August"] = "08";
  monthToDigitMap["September"] = "09";
  monthToDigitMap["October"] = "10";
  monthToDigitMap["November"] = "11";
  monthToDigitMap["December"] = "12";

  const handleUsernameChange = (event) => {
    setChessUsername(event.target.value);
  };

  const handleMonthStateChange = (event) => {
    if (event.target.value == "Select Month") {
      setMonthState(defaultMonth);
      return;
    }

    setMonthState(event.target.value);
  };

  const handleYearStateChange = (event) => {
    if (event.target.value == "Select Year") {
      setYearState(defaultYear);
      return;
    }

    setYearState(event.target.value);
  };
  const handleNumGamesChange = (event) => {
    var val = event.target.value;

    // if val is not an integer, set it to 0
    if (isNaN(val)) {
      val = 0;
    } else {
      // set val to an integer currently is a string
      val = parseInt(val);
    }

    setNumGames(val);
  };

  const handleModelToggle = () => {
    setShowModel(!showModel);
  };


  const handleFormButtonClick = (event) => {
    // Access the inputValue here and do whatever you want with it
    event.preventDefault();
    // console.log("chess username = " + chessUsername);
    // console.log("month state = " + monthState);
    // console.log("year state = " + yearState);
    // console.log("num games " + numGames);
  };

  const waitForProgressCompletion = () => {
    return new Promise((resolve) => {
        setAnalysisProgress(0)
    });
  };

  const resetProgressAsync = async () => {
    await waitForProgressCompletion();
    // This code runs after progress reaches 100
    // console.log('Progress complete!');
  };

  const [monthList, setMonthList] = useState(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
  const [yearList, setYearList] = useState(['2024', '2023', '2022', '2021', '2020', '2019']);
  const abortControllers = useRef([]);
  const progressRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      // Start incrementing progress slowly once loading starts
      progressRef.current = setInterval(() => {
        setAnalysisProgress((prevProgress) => {
          const newValue = prevProgress + 1;
          return newValue < 95 ? newValue : 95; // Cap progress at 95% until API finishes
        });
      }, 50); // increment every 50ms, adjust as needed
    } else {
      // If not loading, clear the interval
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isLoading]);


  const callRpcService = async () => {

  }

  const getChessGamesWithRpc = () => {
    const req = new ProfileRequestData();
      // var f, obj = {
      //   username: jspb.Message.getFieldWithDefault(msg, 1, ""),
      //   numberofgames: jspb.Message.getFieldWithDefault(msg, 2, ""),
      //   month: jspb.Message.getFieldWithDefault(msg, 3, ""),
      //   year: jspb.Message.getFieldWithDefault(msg, 4, "")
      // };
    
      req.setUsername("noopdogg07");
      req.setNumberofgames("10");
      req.setMonth("10");
      req.setYear("2024");

      rpcClient.getChessGames(req, {}, (err, response) => {
        if (err) {
          console.log(err)
        } else {
          console.log("logging grpc response");
          console.log(response);
        }
      });
  }

  return (
    <form onSubmit={handleFormButtonClick}>
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-white">
                Username
              </label>
              {/* {isLoading && <LoadingModel2 />} */}
              {<LoadingModel2 isLoading = {isLoading} setIsLoading={setIsLoading} analysisProgress={analysisProgress} username={chessUsername} numGames={numGames} abortControllers={abortControllers} setAnalysisProgress={setAnalysisProgress} resetProgressAsync={console.log("remove this function")}/>}
              <div className="mt-2">
                <input
                  type="text"
                  name="username"
                  id="username"
                  autoComplete="noopdogg07"
                  className="text-center block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  onChange={handleUsernameChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-white">
                Year
              </label>
              <div className="mt-2">
                <DropdownMenu handleStateChange={setYearState} id="year" title = {yearState} listItems={yearList}/>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="region" className="block text-sm font-medium leading-6 text-white">
                Month
              </label>
              <div className="mt-2">
                <DropdownMenu handleStateChange={setMonthState} id="month" title = {monthState} listItems={monthList}/>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-white">
                Num Games
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  autoComplete="text"
                  className="text-center block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  onChange={handleNumGamesChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UpdateProgress({ progress: analysisProgress, end: 95, setAnalysisProgress: setAnalysisProgress, progressRef: progressRef }); */}
      <div>
        <button
          type="submit"
          // onClick={() =>  {GetGames(showComponent, setShowComponent, isLoading, setIsLoading, data, setData, chessUsername, monthState, yearState, numGames, setAnalysisProgress, analysisProgress, monthToDigitMap, abortControllers, setGameMap, resetProgressAsync, progressRef, setShowAlert, setAlertDialog)}}
          onClick={() => {
            getChessGamesWithRpc();
          }}
          // onClick={() => setShowModel(true)}
          className="flex w-full justify-center rounded-md bg-indigo-500  px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Analyze Games
        </button>
      </div>

      <p className="mt-10 text-center text-sm text-gray-400">
        Got a suggestion?{' '}
        <a target="_blank" href="https://chessifai.canny.io/feature-requests" onClick={handleModelToggle} className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
          Submit any bugs here
          {/* {showModel && <FeedbackForm />} */}
        </a>
      </p>

      {showAlert && <AlertDialog showAlert={showAlert} setShowAlert={setShowAlert} alertDescription={alertDialog} />}

    </form>
  )
}



const environments = {
  Preview: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default App;