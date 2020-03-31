import Chart from 'chart.js';
import { Disease } from './disease';

const DOUBLE_CLICK_MILLIS = 400;
let mouseX: number;
let mouseY: number;
let mouseTime: number;
let ctx = (<HTMLCanvasElement> document.getElementById('chart')).getContext('2d');
let chart = new Chart(ctx, {
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
      mode: 'index',
      intersect: false,
    },
    onClick: function(pointerEvent: PointerEvent, chartElement) {
      pointerEvent.timeStamp
      if(mouseX === pointerEvent.x && mouseY === pointerEvent.y && pointerEvent.timeStamp - mouseTime < DOUBLE_CLICK_MILLIS) { // on double click
        mouseX = null;
        mouseY = null;
        let index = chartElement[0] && chartElement[0]._index;
        if(index) {
          disease.goToTime(index);
          updateView();
        }
      }
      else {
        mouseX = pointerEvent.x;
        mouseY = pointerEvent.y;
      }
      mouseTime = pointerEvent.timeStamp;
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
        },
      },
      mode: 'index',
      intersect: false
    },
  },
});

function handleClick(event: MouseEvent) {
  let activeElement = chart.getElementAtEvent(event);
  console.log(activeElement);
}



let population = 100000;
let rate = 4;
let recovery = 6;
let socialDistance = 2;

let disease: Disease;
create();

function create() {
  disease = new Disease(population, rate, socialDistance, recovery);
  disease.run();
  updateView();
}

function updateView() {
  // update chart
  chart.data.datasets[0].data = disease.allData.map(step => { return { x: step.time, y: step.total } });
  chart.data.datasets[1].data = disease.allData.map(step => { return { x: step.time, y: step.new } });
  chart.data.datasets[2].data = disease.allData.map(step => { return { x: step.time, y: step.current } });
  chart.update();

  // update stats display
  document.getElementById("new").innerHTML = disease.stepData.new.toString();
  document.getElementById("sick").innerHTML = disease.stepData.current.toString();
  document.getElementById("total").innerHTML = disease.stepData.total.toString();
  document.getElementById("time").innerHTML = disease.stepData.time.toString();

  // update button disabled
  (<HTMLButtonElement> document.getElementById("start")).disabled = disease.time === 0;
  (<HTMLButtonElement> document.getElementById("end")).disabled = !disease.active;
  (<HTMLButtonElement> document.getElementById("prev")).disabled = disease.time === 0;
  (<HTMLButtonElement> document.getElementById("next")).disabled = !disease.active;
}

document.getElementById("start").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.reset();
    updateView();
  }
);

document.getElementById("end").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.run();
    updateView();
  }
);

document.getElementById("prev").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.previous();
    updateView();
  }
);

document.getElementById("next").addEventListener("click",
  () => {
    disease.socialDistance = parseFloat((<HTMLInputElement>document.getElementById("social-distance")).value) || disease.socialDistance;
    disease.step();
    updateView();
  }
);

document.getElementById("population").addEventListener("change",
  () => {
    let element = <HTMLInputElement> document.getElementById("population");
    population = isNaN(parseInt(element.value)) ? population : parseInt(element.value);
    population = Math.min(Math.max(population, 100), 10000000000);
    element.value = population.toString();
    create();
  }
);
document.getElementById("rate").addEventListener("change",
  () => {
    let element = <HTMLInputElement> document.getElementById("rate");
    rate = isNaN(parseFloat(element.value)) ? rate : parseFloat(element.value);
    rate = Math.min(Math.max(rate, 1), 1000);
    element.value = rate.toString();
    create();
  }
);
document.getElementById("recovery").addEventListener("change",
  () => {
    let element = <HTMLInputElement> document.getElementById("recovery");
    recovery = isNaN(parseInt(element.value)) ? recovery : parseInt(element.value);
    recovery = Math.min(Math.max(recovery, 1), 20);
    element.value = recovery.toString();
    create();
  }
);

document.getElementById("social-distance").addEventListener("change",
  () => {
    let element = <HTMLInputElement> document.getElementById("social-distance");
    socialDistance = isNaN(parseFloat(element.value)) ? socialDistance : parseFloat(element.value);
    socialDistance = Math.max(socialDistance, 1);
    element.value = socialDistance.toString();
  }
);

document.getElementById("rerun").addEventListener("click",
  create
);