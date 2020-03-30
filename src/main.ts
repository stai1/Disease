import Chart from 'chart.js';
import { Disease } from './disease';

var ctx = (<HTMLCanvasElement> document.getElementById('chart')).getContext('2d');
var chart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Total Cases',
        backgroundColor: 'rgba(255,0,0,0.1)',
        borderColor: 'rgba(255,0,0)',
        data: [
        ],
        borderWidth: 1,
      },
      {
        label: 'New Cases',
        backgroundColor: 'rgba(0,255,0,0.1)',
        borderColor: 'rgba(0,255,0)',
        data: [
        ],
        borderWidth: 1,
      },
      {
        label: 'Contagious Cases',
        backgroundColor: 'rgba(0,0,255,0.1)',
        borderColor: 'rgba(0,0,255)',
        data: [
        ],
        borderWidth: 1,
      },
    ]
  },
  options: {
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    elements: {
      line: {
        tension: 0,
      },
    },
    hover: {
      animationDuration: 0,
    },
    responsiveAnimationDuration: 0,
    scales: {
      xAxes: [
        {
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: "Time",
          },
          position: 'bottom',
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      ],
      yAxes: [
        {
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: "Cases",
          },
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        title: function(tooltipItem, data) {
          return "Time " + tooltipItem[0]['index'];
        }
      },
      intersect: false
    },
  },
});


let population = 10000;
let rate = 5;

var disease;
create();

function create() {
  let population = parseInt((<HTMLInputElement>document.getElementById("population")).value);
  let rate = parseFloat((<HTMLInputElement>document.getElementById("rate")).value);
  let socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value);
  let recovery = parseInt((<HTMLInputElement>document.getElementById("recovery")).value);
  disease = new Disease(population, rate, socialDistance, recovery);
  disease.run();
  updateView();
}

function updateView() {
  chart.data.datasets[0].data = disease.allData.map(step => { return { x: step.time, y: step.total } });
  chart.data.datasets[1].data = disease.allData.map(step => { return { x: step.time, y: step.new } });
  chart.data.datasets[2].data = disease.allData.map(step => { return { x: step.time, y: step.current } });
  chart.update();
  document.getElementById("new").innerHTML = disease.stepData.new.toString();
  document.getElementById("sick").innerHTML = disease.stepData.current.toString();
  document.getElementById("total").innerHTML = disease.stepData.total.toString();
  document.getElementById("time").innerHTML = disease.stepData.time.toString();
}

document.getElementById("start").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.reset();
    updateView();
  }
)

document.getElementById("end").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.run();
    updateView();
  }
)

document.getElementById("prev").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.previous();
    updateView();
  }
)

document.getElementById("next").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.step();
    updateView();
  }
)

document.getElementById("create").addEventListener("click",
  create
)