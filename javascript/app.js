class Chip8Instance {
  constructor(MonitorElement) {
    if (!MonitorElement) {
      console.error("Cannot instantiate 'Chip8Instance' without the 'MonitorElement' argument");
      return;
    }
    var self = this;
    this.mainThreadSwitch = true;
    this.FPS = 60;
    this.timeBetweenFrame = 1 / this.FPS * 1000;
    this.opPerCycle = 4;
    //time 1000 to get second as miliseconds
    this.decrementInterval = 1 / 60 * 1000;
    this.memory = new Uint8Array(4096);
    this.CPU = this.generateCPU();
    this.instructionSetArchitecture = {};
    this.monitorRes = { width: 64, height: 32 };
    this.defaultColor = ["black", "white"];
    this.monitorPixelReferences = [];
    this.twoDimentionalMonitorArrayView = [];
    this.twoDimentionalMonitorArrayBuffer = [];
    this.monitor = null;
    this.monitor = MonitorElement;
    this.generateMonitor();
    this.setAllPixelToColor(this.defaultColor[0]);
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
  /**
   * [get an opcode by reading the memory]
   * [behavior: since the memory is segmented in block of 8 bits and an opcode 16 bits
   * we do need to take 2 value from the memory instead of just one]
   * @return {[Number]} [return technically an unsinedInt in 16 bits but we're in javascript soooo ;)]
   */
  getOpcode(){
    return (this.memory[this.CPU.programCounter] << 8) + this.memory[this.CPU.programCounter + 1];
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
      this.twoDimentionalMonitorArrayView[i] = [];
      this.twoDimentionalMonitorArrayBuffer[i] = [];
      for (let j = 0; j < this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + " cell_" + j + " pixelID_" + pixelID;
        cell.className = "cell";
        this.monitorPixelReferences.push(cell);
        this.twoDimentionalMonitorArrayView[i].push(cell);
        this.twoDimentionalMonitorArrayBuffer[i].push("");
        row.appendChild(cell);
        pixelID++;
      }
      //domFragment.appendChild(row);
      this.monitor.appendChild(row);
    }
  }
  setAllPixelToColor(color) {
    for (let i = this.monitorPixelReferences.length; i-- > 0;) {
      this.monitorPixelReferences[i].className = "cell " + color;
    }
  }
  updateScreen() {
    for (var i = this.twoDimentionalMonitorArrayView.length; i-- > 0;) {
      for (var j = this.twoDimentionalMonitorArrayView[i].length; j-- > 0;) {
        this.twoDimentionalMonitorArrayView[i][j].className = "cell " + this.twoDimentionalMonitorArrayBuffer[i][j];
      }
    }
  }
  initCPU() {}
  counterDecrement() {
    if (this.CPU.gameCounter > 0) { this.CPU.gameCounter-- };
    if (this.CPU.soundCounter > 0) { this.CPU.soundCounter-- };
  }
  testPixel() {
    let x = 0;
    let y = 0;
    let result;
    for (x = 0; x < this.monitorRes.height; x++) {
      for (y = 0; y < this.monitorRes.width; y++) {
        result = this.defaultColor[1];
        if (y % (x + 1) === 0) {
          result = this.defaultColor[0];
        }
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
      }
    }
    this.updateScreen();
  }
  async wait(t) {
    return await new Promise(function (resolve) {
      setTimeout(() => {
        console.error("time to wait: ", t);
        resolve();
      }, t);
    });
  }
  async start() {
    let t1, t2, t3;
    while (this.mainThreadSwitch) {
      t1 = performance.now();
      //this.updateScreen();
      t2 = performance.now();
      await this.wait(this.timeBetweenFrame - (t2 - t1) + 1000);
      t3 = performance.now();
      console.error("lol", (t3 - t2), "ms");
    }
  }
  stopMainThread() {
    this.mainThreadSwitch = false;
  }
  mainThreadSwitchTrigger() {
    this.mainThreadSwitch = !this.mainThreadSwitch;
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
  currentInstance.start();
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
