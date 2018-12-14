class Chip8Instance {
  constructor(MonitorElement) {
    if (!MonitorElement) {
      console.error("Cannot instantiate 'Chip8Instance' without the 'MonitorElement' argument");
      return;
    }
    this.decrementInterval = 1 / 60;
    this.memory = new Uint8Array(4096);
    this.CPU = this.generateCPU();
    this.instructionSetArchitecture = {};
    this.monitorRes = { width: 64, height: 32 };
    this.defaultColor = ["black", "white"];
    this.monitorPixelReferences = [];
    this.monitorTwoDimentionalMonitorArrayView = [];
    this.monitor = null;
    this.monitor = MonitorElement;
    this.generateMonitor();
    this.setPixelToColor(this.defaultColor[0]);
  }
  generateCPU() {
    return {
      //16 bit counter to iterate through the memory array
      programCounter: 512,
      //array representing the register
      register: new Uint8Array(16),
      //16 bit counter to iterate through the register array
      registerCounter: 0,
      //array representing the stack
      stack: new Uint8Array(16),
      //16 bit counter to iterate through the stack array
      stackJumpCounter: 0,
      //
      gameCounter: 0,
      //
      soundCounter: 0
    }
  }
  generateMonitor() {
    console.log("this.monitor: ", this.monitor);
    let row = null;
    let cell = null;
    let pixelID = 0;
    //let domFragment = document.createDocumentFragment();
    for (let i = 0; i < this.monitorRes.height; i++) {
      row = document.createElement("section");
      row.className = "row row_" + i;
      this.monitorTwoDimentionalMonitorArrayView[i] = [];
      for (let j = 0; j < this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + " cell_" + j + " pixelID_" + pixelID;
        cell.className = "cell";
        this.monitorPixelReferences.push(cell);
        this.monitorTwoDimentionalMonitorArrayView[i].push(cell);
        row.appendChild(cell);
        pixelID++;
      }
      //domFragment.appendChild(row);
      this.monitor.appendChild(row);
    }
  }
  setPixelToColor(color) {
    for (let i = this.monitorPixelReferences.length; i-- > 0;) {
      this.monitorPixelReferences[i].className = "cell " + color;
    }
  }
  initCPU() {}
  counterDecrement() {
    if (this.CPU.gameCounter > 0) { this.CPU.gameCounter-- };
    if (this.CPU.soundCounter > 0) { this.CPU.soundCounter-- };
  }
  testPixel() {
    let x = 0,
      y = 0;
    for (x = 0; x < this.monitorRes.height; x++) {
      for (y = 0; y < this.monitorRes.width; y++) {
        if (y % (x + 1) === 0) {
          this.monitorTwoDimentionalMonitorArrayView[x][y].className = "cell " + this.defaultColor[0];
        } else {
          this.monitorTwoDimentionalMonitorArrayView[x][y].className = "cell " + this.defaultColor[1];
        }
      }
    }
  }
  start(){


  }
};

function StartChip8() {
  let Monitor = document.getElementsByTagName("monitor")[0];
  let chip8 = new Chip8Instance(Monitor);
  return chip8;
}

function start() {
  let t1 = performance.now();
  let currentInstance = StartChip8();
  console.log("currentInstance: ", currentInstance);
  let t2 = performance.now();
  console.log("generating context took: ", t2 - t1, " ms");
  testFunction(currentInstance);
}

function testFunction(chip8Instance) {
  let lastStep = "start";
  let t1 = null;
  let t2 = null;
  try {
    lastStep = "testPixel";
    t1 = performance.now();
    chip8Instance.testPixel();
    t2 = performance.now();
    console.log("testPixel took: ", t2 - t1, " ms");
  } catch (e) {
    console.error("failed on step : [", lastStep, "] got stack: ", e);
  }
}
start();
