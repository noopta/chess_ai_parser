import logo from './logo.svg';
import './App.css';
import './landingComponents/landingForm';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    heroSection()
    // landingForm()
  );
}

function landingForm() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      {/* <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"> */}
      <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action="#" method="POST">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Analyze Games
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Got a suggestion?{' '}
          <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Submit any bugs here
          </a>
        </p>
      </div>
      {/* {Grid()}
      </div> */}
    </>
  )
}

const Grid = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Replace the divs below with your content for each cell */}
      <div className="p-4">{gameCard()}</div>
      <div className="p-4">{gameCard()}</div>
      <div className="p-4">{gameCard()}</div>
      <div className="p-4">{gameCard()}</div>
      <div className="p-4">{gameCard()}</div>
      <div className="p-4">{gameCard()}</div>
    </div>
  );
};

function chessGameGrid() {
  return (
    <>
      <div class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:mx-0">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">From the blog</h2>
            <p class="mt-2 text-lg leading-8 text-gray-600">Learn how to grow your business with our expert advice.</p>
          </div>
          <div class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <article class="flex max-w-xl flex-col items-start justify-between">
              <div class="flex items-center gap-x-4 text-xs">
                <time datetime="2020-03-16" class="text-gray-500">Mar 16, 2020</time>
                <a href="#" class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">Marketing</a>
              </div>
              <div class="group relative">
                <h3 class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <a href="#">
                    <span class="absolute inset-0"></span>
                    Boost your conversion rate
                  </a>
                </h3>
                <p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.</p>
              </div>
              <div class="relative mt-8 flex items-center gap-x-4">
                <img src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" class="h-10 w-10 rounded-full bg-gray-50" />
                <div class="text-sm leading-6">
                  <p class="font-semibold text-gray-900">
                    <a href="#">
                      <span class="absolute inset-0"></span>
                      Michael Foster
                    </a>
                  </p>
                  <p class="text-gray-600">Co-Founder / CTO</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}

function gameCard() {
  var whiteKnight = "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/512x512/chess_piece_knight_white.png"
  var blackKnight = "https://img.freepik.com/free-icon/strategy_318-302817.jpg?t=st=1689738547~exp=1689739147~hmac=40c7bf99944a8259d71ce85d01caed61863e4a7facc32d784cb8a2ce917271db"
  return (
    <>
      <div class="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
        <div class="flex justify-center md:justify-end -mt-16">
          <img class="w-20 h-20 object-cover rounded-full border-2 border-indigo-500" src={blackKnight} />
        </div>
        <div>
          <h2 class="text-gray-800 text-3xl font-semibold">noopdogg07</h2>
          <p class="mt-2 text-gray-600">Seems like you played well here, but couldn't quite get the win!</p>
        </div>
        <div class="flex justify-end mt-4">
          <a href="#" class="text-xl font-medium text-indigo-500">View Game</a>
        </div>
      </div>
    </>
  )
}

function heroSection() {
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
          {/* <!-- Mobile menu, show/hide based on menu open state. --> */}
          <div class="lg:hidden" role="dialog" aria-modal="true">
            {/* <!-- Background backdrop, show/hide based on slide-over state. --> */}
            <div class="fixed inset-0 z-50"></div>
            <div class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div class="flex items-center justify-between">
                <a href="#" class="-m-1.5 p-1.5">
                  <span class="sr-only">Your Company</span>
                  <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="" />
                </a>
                <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700">
                  <span class="sr-only">Close menu</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="mt-6 flow-root">
                <div class="-my-6 divide-y divide-gray-500/10">
                  <div class="space-y-2 py-6">
                    <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Product</a>
                    <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Features</a>
                    <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Marketplace</a>
                    <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Company</a>
                  </div>
                  <div class="py-6">
                    <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Log in</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="relative isolate px-6 lg:px-8">
          {/* <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={polygonStyle}></div>
          </div> */}
          {/* class below has sm:py-48 for more spacing */}
          <div class="mx-auto max-w-2xl py-32">
            {/* <div class="hidden sm:mb-8 sm:flex sm:justify-center">
              <div class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Announcing our next round of funding. <a href="#" class="font-semibold text-indigo-600"><span class="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
              </div>
            </div> */}
            <div class="text-center">
              <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Chess analysis with AI, tailored for your skill set.</h1>
              <p class="mt-6 text-lg leading-8 text-gray-600">Get started by entering a Chess.com username to get feedback on your recent games.</p>
              <div class="mt-10 flex items-center justify-center gap-x-6">
                {/* <a href="#" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get started</a> */}
                {/* {inputForm()} */}
                {landingForm()}
                {/* <a href="#" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get started</a> */}

                {/* <a href="#" class="text-sm font-semibold leading-6 text-gray-900">Learn more <span aria-hidden="true">→</span></a> */}
              </div>
            </div>
          </div>
          {/* <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={polygonStyle}></div>
          </div> */}
        </div>
      </div>

      {Grid()}
    </>
  )
}

function inputForm() {
  return (
    <>
      <div>
        {/* <label for="price" class="block text-sm font-medium leading-6 text-gray-900">Username</label> */}
        <div class="relative mt-2 rounded-md shadow-sm">
          {/* <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div> */}
          <input type="text" name="price" id="price" class="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="0.00" />
          <div class="absolute inset-y-0 right-0 flex items-center">
            <label for="currency" class="sr-only">Chess Platform</label>
            <select id="currency" name="currency" class="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
              <option>Chess.com</option>
              <option>Lichess</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;
