import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const ProbabilityChart = ({ gameProbs }) => {
  useEffect(() => {
    const chartConfig = {
      series: [
        {
          name: "Win Probability",
          data: gameProbs.map(prob => prob * 100), // Convert to percentages
        },
      ],
      chart: {
        type: "line",
        height: 240,
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#020617"],
      stroke: {
        lineCap: "round",
        curve: "smooth",
      },
      markers: {
        size: 0,
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: gameProbs.map((_, index) => `Move ${index + 1}`),
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
          formatter: (value) => `${value.toFixed(0)}%`
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    };

    const chart = new ApexCharts(document.querySelector("#probability-chart"), chartConfig);
    chart.render();

    // Cleanup
    return () => {
      chart.destroy();
    };
  }, [gameProbs]);

  return (
    <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
      <div className="relative mx-4 mt-4 flex flex-col gap-4 overflow-hidden rounded-none bg-transparent bg-clip-border text-gray-700 shadow-none md:flex-row md:items-center">
        <div className="w-max rounded-lg bg-gray-900 p-5 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
            />
          </svg>
        </div>
        <div>
          <h6 className="block font-sans text-base font-semibold leading-relaxed tracking-normal text-blue-gray-900 antialiased">
            Win Probability
          </h6>
          <p className="block max-w-sm font-sans text-sm font-normal leading-normal text-gray-700 antialiased">
            Track how your winning chances changed throughout the game
          </p>
        </div>
      </div>
      <div className="pt-6 px-2 pb-0">
        <div id="probability-chart"></div>
      </div>
    </div>
  );
};

export default ProbabilityChart; 