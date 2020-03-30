export interface StepData {
  total: number,
  new: number,
  current: number,
  time: number
}

export interface DiseaseState {
  total: number,
  currentInfectedRotation: number[],
  time: number,
  residual: number,
}

export class Disease {
  private residual: number = 0;
  private time: number = 0;
  private stats: StepData[] = [];
  private history: DiseaseState[] = [];
  private currentInfectedRotation: number[];
  private totalCases: number = 0;

  constructor(
    private population: number,
    private rate: number,
    public socialDistance: number = 1,
    private contagiousTicks: number = 1,
    seed: number = 1,
    ) {
    this.currentInfectedRotation = new Array(contagiousTicks).fill(0);
    this.infect(seed);
    this.pushData()
  }

  private pushData() {
    this.stats.push(
      {
        total: this.totalCases,
        new: this.currentInfectedRotation[0],
        current: this.currentInfected,
        time: this.time,
      }
    );
    this.history.push(
      {
        total: this.totalCases,
        currentInfectedRotation: this.currentInfectedRotation.slice(),
        time: this.time,
        residual: this.residual,
      }
    )
  }

  public infect(n = 1) {
    this.currentInfectedRotation[0] += n;
    this.totalCases += n;
  }

  public reset() {
    this.setState(this.history[0])

    this.stats.splice(1);
    this.history.splice(1);
  }

  private setState(state: DiseaseState) {
    this.totalCases = state.total;
    this.currentInfectedRotation = state.currentInfectedRotation.slice();
    this.residual = state.residual;
    this.time = state.time;
  }

  public previous() {
    if(this.history.length > 1) {
      this.setState(this.history[this.history.length-1])
      this.stats.pop();
      this.history.pop();
    }


  }

  public step() {
    if(this.active) {
      let transmitted = (1-Math.pow(1-(this.rate/this.contagiousTicks/this.socialDistance)/this.population, this.currentInfected))*this.population;
      
      // number of transmissions that weren't already infected
      let newCases = transmitted * (1 - this.totalCases/this.population);
      this.residual += newCases % 1; // decimal part of newCases

      // convert to int and add int part of residual if > 1
      newCases = Math.floor(newCases) + Math.floor(this.residual);
      this.residual = this.residual % 1;

      // rotate out recoveries, rotate in new cases
      this.currentInfectedRotation.pop();
      this.currentInfectedRotation.unshift(newCases);

      this.totalCases += newCases;

      this.pushData();
      ++this.time;
    }
    return this.stepData;
  }

  public run() {
    while(this.active)
      this.step();
    return this.allData;
  }

  public get active(): boolean {
    return this.currentInfected > 0;
  }

  private get currentInfected(): number {
    return this.currentInfectedRotation.reduce((acc, n) => acc+n );
  }

  public get stepData(): StepData {
    return this.stats[this.stats.length-1];
  }

  public get allData(): StepData[] {
    return this.stats;
  }
  
}