class  Chip8Instance {
  constructor(MonitorElement) {
    this.instructionSetArchitecture = {};
    this.monitorRes = { width: 64, height: 32 };
    this.monitor = null;
    this.monitor = MonitorElement;
    this.generateMonitor();
  }

  generateMonitor() {
    this.monitor = document.getElementsByTagName("monitor")[0];
    console.error("this.monitor: ", this.monitor);
    let row = null;
    let cell = null;
    let pixelID = 0;
    for (let i = 0; i < this.monitorRes.height; i++) {
      row = document.createElement("section");
      row.className = "row_" + i;
      for (let j = 0; j <  this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + "_cell_" + j + "_pixelID_" + pixelID;
        cell.className = "rowCell_" + j + "cellID_" + pixelID;
        row.appendChild(cell);
        pixelID++;
      }
      this.monitor.appendChild(row);
    }
  }
};

function StartChip8() {
  let Monitor = document.getElementsByTagName("monitor")[0];
  let chip8 = new Chip8Instance(Monitor);
  return chip8;
}

function start() {
  let currentInstance = StartChip8();
  console.error("currentInstance: ", currentInstance);
}

start();
