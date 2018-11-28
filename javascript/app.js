class  Chip8Instance {
  constructor(MonitorElement) {
    this.instructionSetArchitecture = {};
    this.monitorRes = { width: 64, height: 32 };
    this.monitor = null;
    this.monitor = MonitorElement;
    this.generateMonitor();
  }

  generateMonitor() {
    console.error("this.monitor: ", this.monitor);
    let row = null;
    let cell = null;
    let pixelID = 0;
    let domFragment = document.createDocumentFragment();
    for (let i = 0; i < this.monitorRes.height; i++) {
      row = document.createElement("section");
      row.className = "row row_" + i;
      for (let j = 0; j <  this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + "_cell_" + j + "_pixelID_" + pixelID;
        cell.className = "cell rowCell_" + j + "cellID_" + pixelID;
        row.appendChild(cell);
        pixelID++;
      }
      domFragment.appendChild(row);
    }
    this.monitor.appendChild(domFragment);
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
  console.error("currentInstance: ", currentInstance);
  let t2 = performance.now();
  console.log("generating context took: ", t2 - t1, " ms");
}

start();
