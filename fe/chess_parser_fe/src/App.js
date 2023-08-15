import logo from './logo.svg';
import './App.css';
// import './landingComponents/landingForm';
import Analysis from './analysisComponents/Analysis.js';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';

// Array of JSON objects
var globalGames = [];
export const gameMap = new Map();

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HeroSection />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
    // HeroSection()
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

const LandingForm = (showComponent, setShowComponent) => {

  const handleSubmit = (event) => {
    event.preventDefault(); // This prevents the default behavior of form submission (page refresh)
    // Add your form submission logic here, if needed
    // For example, you can access form data using event.target and perform actions based on it
    console.log("yo")

    // setShowComponent(true)
  }

  const [showModel, setShowModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleModelToggle = () => {
    setShowModel(!showModel);
  };



  return (
    <>
      <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            {/* show spinner if isLoading is true */}
            {isLoading && <LoadingModel />}
            <div className="mt-2">
              <input
                id="text"
                autoComplete="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={() => GetGames(showComponent, setShowComponent, isLoading, setIsLoading, data, setData)}
              // onClick={() => setShowModel(true)}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Analyze Games
            </button>

            {/* // pass in the showComponent state variable and the setShowComponent function as props */}
            {/* <GetGames showComponent={showComponent} setShowComponent={setShowComponent} /> */}
            {/* {showComponent && <GetGames />} Render the GetGames component conditionally */}
            {/* ... (remaining code) */}
          </div>
        </form >

        <p className="mt-10 text-center text-sm text-gray-500">
          Got a suggestion?{' '}
          <a href="#" onClick={handleModelToggle} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Submit any bugs here
            {showModel && <FeedbackForm />}
          </a>
        </p>
      </div >
    </>
  )
}

function extractJSONFromBody(bodyString) {
  // Remove backslashes from the body string
  const unescapedBody = bodyString.replace(/\\/g, '');

  // Find the start and end indices of the actual JSON object
  const startIndex = unescapedBody.indexOf('{');
  const endIndex = unescapedBody.lastIndexOf('}') + 1;

  // Extract the JSON body from the string
  const jsonString = unescapedBody.slice(startIndex, endIndex);

  // Parse the JSON string into a JavaScript object
  try {
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.log(jsonString)
    return null;
  }
}


function extractJSONFromBody2(bodyString) {
  try {
    const jsonObject = JSON.parse(bodyString);
    return jsonObject;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
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

const LoadingModel = () => {
  return (
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                {/* <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                </div> */}
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-centre">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Loading Games</h3>
                  <div class="mt-2 text-centre content-centre">
                    {/* <Spinner /> */}
                    <CubeSpinner />
                    <p class="text-sm text-gray-500">Hold on! We are working our hardest to analyze your games, after all good things take time :p</p>
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

const MakePostRequest = async ({ isLoading, setIsLoading, setData }) => {

  // useEffect(() => {
  // const fetchData = async () => {
  console.log("fetching data")
  // const url = 'https://ol4gm9f3k0.execute-api.us-east-2.amazonaws.com/chess-parser-lambda'
  // const url = 'https://non68do8s4.execute-api.us-east-2.amazonaws.com/prod'
  const url = 'https://4vz6fr5rinuhsspb6rh5alkige0jrcmo.lambda-url.us-east-2.on.aws/'
  try {
    console.log("here")
    setIsLoading(true);
    console.log(isLoading)
    console.log("before fetch")
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Set the appropriate content-type
        // Set the appropriate content-type
      },
      body: JSON.stringify({
        /* Your request data here */
        'username': 'noopdogg07'
      }), // Convert your request data to JSON
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    console.log("here2")
    const responseData = await response.text();
    console.log("loggin response")
    // console.log(responseData)
    // setData(responseData);
    // while awaiting response, the screen should show a loading spinner

    // var jsonBody = extractJSONFromBody(extractJSONFromBody2(responseData))
    var jsonBody = JSON.parse(responseData)

    // var jsonBody = extractJSONFromBody2(responseData)
    // var temp = extractJSONFromBody2(responseData)
    for (var i = 0; i < jsonBody.length; i++) {

      var cleanedWhiteMoves = jsonBody[i]['whiteMoves']
      var cleanedBlackMoves = jsonBody[i]['blackMoves']
      var cleanedOpponentName = jsonBody[i]['opponent']
      var cleanedPlayerColor = jsonBody[i]['playerColor']
      var cleanedMatchBlurb = jsonBody[i]['matchBlurb']
      var cleanedAnalysis = jsonBody[i]['analysis']

      // generate a random hash for each game 
      var matchHash = await generateRandomHash();

      console.log(matchHash)

      var jsonObj = {
        "WhiteMoves": cleanedWhiteMoves,
        "BlackMoves": cleanedBlackMoves,
        "Opponent": cleanedOpponentName,
        "PlayerColor": cleanedPlayerColor,
        "MatchBlurb": cleanedMatchBlurb,
        "Analysis": cleanedAnalysis
      }

      globalGames.push(jsonObj)
      gameMap.set(matchHash, jsonObj)
    }

    if (responseData == "200") {
      // get games from MongoDB
      console.log("200")
    }
    // setResponseData(data); // Handle the response data as needed
  } catch (error) {
    console.error('Error:', error);
    // Handle errors appropriately (e.g., show an error message to the user)
  } finally {
    setIsLoading(false);
  }
  // }
  // fetchData();
  console.log("after fetch")
  // }, []);

  return globalGames.length > 0 ? 200 : 400;
};


const GetGames = async (showComponent, setShowComponent, isLoading, setIsLoading, data, setData) => {
  console.log("get games")
  try {
    var requestResponse = await MakePostRequest({ isLoading, setIsLoading, setData })
  } catch {
    console.log("error")
  } finally {
    console.log("finally")
    if (requestResponse == 200) {
      setShowComponent(true)
    }
  }



  // MakePostRequest()

  // if (isLoading) {
  //   console.log("spinning")
  //   return (
  //     <Spinner />
  //   )
  // }

  if (!data) return (
    <span>Data not available</span>
  )
}


const GenerateGrid = () => {
  // Check if gameObjects is an object and not null


  const jsonArray = Object.values(globalGames)
  var whiteKnight = "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/chess_piece_knight_white.png"
  var blackKnight = "https://img.freepik.com/free-icon/strategy_318-302817.jpg?t=st=1689738547~exp=1689739147~hmac=40c7bf99944a8259d71ce85d01caed61863e4a7facc32d784cb8a2ce917271db"
  // var knightToUse = "";
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* {[...gameMap.values()].map((currentGame, index) => { */}
      {[...gameMap.entries()].map(([key, currentGame]) => {
        const knightToUse = currentGame["PlayerColor"] === "White" ? whiteKnight : blackKnight;
        return (
          <div className="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
            <div className="flex justify-center md:justify-end -mt-16">
              <img className="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src={knightToUse} alt="Knight" />
            </div>
            <div>
              <h2 className="text-gray-800 text-3xl font-semibold">{currentGame["Opponent"]}</h2>
              <p className="mt-2 text-gray-600">{currentGame["MatchBlurb"]}!</p>
            </div>
            <div className="flex justify-end mt-4">
              {/* <Link to={`/analysis/${encodeURIComponent(key)}`}> */}
              <a onClick={() => {
                navigate('/analysis', {
                  state: { key: encodeURIComponent(key) }
                });
              }} href="#" className="text-xl font-medium text-indigo-500">
                View Game
              </a>
              {/* </Link> */}
            </div>
          </div>
        );
      })}
    </div>

    // <div className="grid grid-cols-3 gap-4">
    //   {jsonArray.map((currentGame, index, globalGames) => (
    //     knightToUse = currentGame["PlayerColor"] == "White" ? whiteKnight : blackKnight,
    //     <div key={index} className="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
    //       <div className="flex justify-center md:justify-end -mt-16">
    //         <img className="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src={knightToUse} alt="Knight" />
    //       </div>
    //       <div>
    //         <h2 className="text-gray-800 text-3xl font-semibold">{currentGame["Opponent"]}</h2>
    //         <p className="mt-2 text-gray-600">{currentGame["MatchBlurb"]}!</p>
    //       </div>
    //       <div className="flex justify-end mt-4">
    //         <Link to="/analysis">
    //           <a href="#" className="text-xl font-medium text-indigo-500">View Game</a>
    //         </Link>
    //       </div>
    //     </div>
    //   ))}
    // </div>
  );
}

// const Grid = () => {
//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {/* Replace the divs below with your content for each cell */}
//       <div className="p-4">{gameCard()}</div>
//       <div className="p-4">{gameCard()}</div>
//       <div className="p-4">{gameCard()}</div>
//       <div className="p-4">{gameCard()}</div>
//       <div className="p-4">{gameCard()}</div>
//       <div className="p-4">{gameCard()}</div>
//     </div>
//   );
// };



function GameCard(gameObject) {
  var whiteKnight = "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/chess_piece_knight_white.png"
  var blackKnight = "https://img.freepik.com/free-icon/strategy_318-302817.jpg?t=st=1689738547~exp=1689739147~hmac=40c7bf99944a8259d71ce85d01caed61863e4a7facc32d784cb8a2ce917271db"
  var knightToUse = gameObject.PlayerColor == "White" ? whiteKnight : blackKnight
  console.log("game card")
  console.log(gameObject)
  // console.log(gameObject["PlayerColor"])
  return (
    <>
      <div class="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
        <div class="flex justify-center md:justify-end -mt-16">
          <img class="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src={knightToUse} />
        </div>
        <div>
          <h2 class="text-gray-800 text-3xl font-semibold">{gameObject["Opponent"]}</h2>
          <p class="mt-2 text-gray-600">{gameObject["PlayerColor"]}!</p>
        </div>
        <div class="flex justify-end mt-4">
          <a href="#" class="text-xl font-medium text-indigo-500">View Game</a>
        </div>
      </div>
    </>
  )
}

const HeroSection = (props) => {
  const [showComponent, setShowComponent] = useState(false);

  // const handleButtonClick = () => {
  //   setShowComponent(true);
  // };

  return (
    <>
      <div class="bg-white">
        <header class="absolute inset-x-0 top-0 z-50">
          <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div class="flex lg:flex-1">
              <a href="#" class="-m-1.5 p-1.5">
                <span class="sr-only">Your Company</span>
                <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="" />
              </a>
            </div>
            <div class="flex lg:hidden">
              <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                <span class="sr-only">Open main menu</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
            <div class="hidden lg:flex lg:gap-x-12">
              <a href="#" class="text-sm font-semibold leading-6 text-gray-900">Product</a>
              <a href="#" class="text-sm font-semibold leading-6 text-gray-900">About</a>
              <a href="#" class="text-sm font-semibold leading-6 text-gray-900">Contact</a>
            </div>
            <div class="hidden lg:flex lg:flex-1 lg:justify-end">
              <a href="#" class="text-sm font-semibold leading-6 text-gray-900">Log in <span aria-hidden="true">&rarr;</span></a>
            </div>
          </nav>
        </header>

        <div class="relative isolate px-6 lg:px-8">
          <div class="mx-auto max-w-2xl py-32">
            <div class="text-center">
              <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Chess analysis with AI, tailored for your skill set.</h1>
              <p class="mt-6 text-lg leading-8 text-gray-600">Get started by entering a Chess.com username to get feedback on your recent games.</p>
              <div class="mt-10 flex items-center justify-center gap-x-6">
                {LandingForm(showComponent, setShowComponent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showComponent ? <GenerateGrid /> : null}
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
                {/* <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div> */}
                <InputForm />
                {/* <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Feedback</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">Your critiques or compliments are important! Feel free to let us know about any improvements, things you liked, etc. below.</p>
                  </div>
                </div> */}
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
    console.log("first name = " + firstName);
    console.log("last name = " + lastName);
    console.log("email = " + email);
    console.log("message " + message);
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
            <label for="first-name" class="block text-sm font-semibold leading-6 text-gray-900">First name</label>
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

export default App;