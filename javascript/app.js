class Chip8Instance {
  constructor(MonitorElement) {
    if (!MonitorElement) {
      console.error("Cannot instantiate 'Chip8Instance' without the 'MonitorElement' argument");
      return;
    }
    this.decrementInterval = 1 / 60;
    this.memory = new Uint8Array(4096);
    this.generateCPU();
    this.instructionSetArchitecture = {};
    this.monitorRes = { width: 64, height: 32 };
    this.monitorPixelReferences = [];
    this.monitor = null;
    this.monitor = MonitorElement;
    this.generateMonitor();
  }
  generateCPU() {
    this.CPU = {
      //16 bit counter to iterate through the memory array
      programCounter: 0,
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
      for (let j = 0; j < this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + "_cell_" + j + "_pixelID_" + pixelID;
        cell.className = "cell rowCell_" + j + " cellID_" + pixelID;
        this.monitorPixelReferences.push(cell);
        row.appendChild(cell);
        pixelID++;
      }
      //domFragment.appendChild(row);
      this.monitor.appendChild(row);
    }
  }
  initCPU() {}
  decompter() {
    if (this.cpu.compteurJeu > 0) { this.cpu.compteurJeu-- };
    if (this.cpu.compteurSon > 0) { this.cpu.compteurSon-- };
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
}
start();
