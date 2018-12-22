class Chip8Instance {
  constructor(MonitorElement) {
    if (!MonitorElement) {
      console.error("Cannot instantiate 'Chip8Instance' without the 'MonitorElement' argument");
      return;
    }
    this.mainThreadSwitch = true;
    this.FPS = 60;
    this.timeBetweenFrame = 1 / this.FPS * 1000;
    this.opPerCycle = 4;
    //time 1000 to get second as miliseconds
    this.decrementInterval = 1 / 60 * 1000;
    this.memory = new Uint8Array(4096);
    this.CPU = this.generateCPU();
    this.operationTable = this.generateOpcodeTable();
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
  injectOpCode(id) {
    switch (id) {
    case 0:
      {
        this.memory[this.CPU.programCounter] = 0x00;
        this.memory[this.CPU.programCounter + 1] = 0xE0;
        break;
      }
    default:
      {
        console.warn("not implemented !");
      }
    }
  }
  testOpCode() {
    let testCase = 1;
    for (var i = 0; i < testCase; i++) {
      injectOpCode(i);
    }
  }
  /**
  * [get an opcode by reading the memory]
  *[behavior: since the memory is segmented in block of 8 bits and an opcode 16 bits
  * we do need to take 2 value from the memory instead of just one]
  * @return {[Number]} [return technically an unsinedInt in 16 bits but we're in javascript soooo ;)]
  */
  getOpcode() {
    return (this.memory[this.CPU.programCounter] << 8) + this.memory[this.CPU.programCounter + 1];
  }
  getOperationFromOpcode(opcode) {
    for (let i = this.opCodeAmount; i-- > 0;) {
      if ((this.operationTable.mask[i] & opcode) === this.operationTable.id[i]) {
        return i;
      }
    }
  }
  doOperation(opcode) {
    let opCodeId, b3, b2, b1;
    b3 = (opcode & 0x0F00) >> 8;
    b2 = (opcode & 0x00F0) >> 4;
    b1 = (opcode & 0x000F);
    opCodeId = this.getOperationFromOpcode(opcode);
    //console.log("opCodeId: ", opCodeId);
    switch (opCodeId) {
    case 0:
      {
        console.warn("opcode at the id 0 isn't implemented yet");
        break;
      }
    case 1:
      {
        console.log("00E0 : resetScreen");
        let x, y;
        for (x = 0; x < this.monitorRes.height; x++) {
          for (y = 0; y < this.monitorRes.width; y++) {
            this.twoDimentionalMonitorArrayBuffer[x][y] = this.defaultColor[0];;
          }
        }
        break;
      }
    case 2:
      {
        console.log("00EE : returns from a function");
        break;
      }
    case 3:
      {
        console.log("1NNN : jumps to the NNN adresse; NNN: ", this.prettyPrintOpCode(opcode & 0x0FFF));
        break;
      }
    case 4:
      {
        console.log("2NNN : calls a function at the NNN adresse; NNN: ", this.prettyPrintOpCode(opcode & 0x0FFF));
        break;
      }
    case 5:
      {
        console.log("3XNN : skips the next instruction if VX === NN; VX: ", this.prettyPrintOpCode(opcode & 0x0F00), " NN: ", this.prettyPrintOpCode(opcode & 0x00FF));
        break;
      }
    case 6:
      {
        console.log("4XNN : skips the next instruction if VX !== NN; VX: ", this.prettyPrintOpCode(opcode & 0x0F00), " NN: ", this.prettyPrintOpCode(opcode & 0x00FF));
        break;
      }
    case 7:
      {
        console.log("5XY0 : skips the next instruction if VX === VY; VX: ", this.prettyPrintOpCode(opcode & 0x0F00), " VY: ", this.prettyPrintOpCode(opcode & 0x00F0));
        break;
      }
    case 8:
      {
        console.log("6XNN : sets VX to NN; VX: ", this.prettyPrintOpCode(opcode & 0x0F00), " NN: ", this.prettyPrintOpCode(opcode & 0x00FF));
        break;
      }
    case 9:
      {
        console.log("7XNN : adds NN to VX: VX += NN if overflow the carryflag isn't changed!: ");

        break;
      }
    case 10:
      {
        console.log("8XY0 : sets VX to VY (VX = VY)");
        break;
      }
    case 11:
      {
        console.log("8XY1 : sets VX to VX or VY (bitwise VX = VX|VY)");
        break;
      }
    case 12:
      {
        console.log("8XY2 : sets VX to VX and VY (bitwise VX = VX&VY)");
        break;
      }
    case 13:
      {
        console.log("8XY3 : sets VX to VX xor VY; (bitwise VX = VX^VY); VX: ", this.prettyPrintOpCode(this.CPU.register[opcode & 0x0F00]),
          " VY: ", this.prettyPrintOpCode(this.CPU.register[opcode & 0x0F00]), " VX^VY = ",
          this.prettyPrintOpCode(this.CPU.register[opcode & 0x0F00] ^ this.CPU.register[opcode & 0x00F0]));
          this.CPU.register[opcode & 0x0F00] = this.CPU.register[opcode & 0x0F00] ^ this.CPU.register[opcode & 0x00F0];
        break;
      }
    case 14:
      {
        console.log("8XY4 : adds VY to VX if overflow of the 8bit capacity the carry flag at VF is set to 1 otherwise 0; VX ", this.CPU.register[0], " VY ", this.CPU.register[0]);
        break;
      }
    case 15:
      {
        console.log("8XY5 : substracts VY to VX, VX -= VY: if there is a borrow VF is set to 0 otherwise 1");
        break;
      }
    case 16:
      {
        console.log("8XY6 : Stores the LSB (least significant bit) of VX in VF then right shift VX by 1");
        break;
      }
    case 17:
      {
        console.log("8XY7 : sets VX to VY minus VX. VF is set to 0 when there is a borrow otherwise 1");
        break;
      }
    case 18:
      {
        console.log("8XYE : Stores the MSB (most significant bit) of VX in VF then left shift VX by 1");
        break;
      }
    case 19:
      {
        console.log("9XY0 : skip the next instruction if VX !== VY");
        break;
      }
    case 20:
      {
        console.log("ANNN : set the registerCounter to the adresse NNN; registerCounter: ", this.CPU.registerCounter, " NNN: ", this.prettyPrintOpCode(opcode & 0x0FFF));
        this.CPU.registerCounter = opcode & 0x0FFF;
        break;
      }
    case 21:
      {
        console.log("BNNN : jumps to the adresse NNN + V0; V0: ", this.CPU.register[0], "NNN: ", this.prettyPrintOpCode(opcode & 0x0FFF), " result: ", (opcode & 0x0FFF) + this.CPU.register[0]);
        this.CPU.programCounter = (opcode & 0x0FFF) + this.CPU.register[0];
        break;
      }
    case 22:
      {
        console.log("CXNN : sets VX to the result of a bitwise an operation on a random number and NN (VX = random() & NN )");
        break;
      }
    case 23:
      {
        console.log("DXYN : draws a sprite at the coordinate VX and VY with a fixed width of 8 pixel and the height is define by N b1: ", b1, " b2: ", b2, " b3: ", b3);
        break;
      }
    case 24:
      {
        console.log("EX9E : Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)");
        break;
      }
    case 25:
      {
        console.log("EXA1 : Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)");
        break;
      }
    case 26:
      {
        console.log("FX07 : Sets VX to the value of the delay timer");
        break;
      }
    case 27:
      {
        console.log("FX0A : waits a key press event then stores it in VX, as long any key isn't pressed every operation are blocked (kind of a pause until key pressed)");
        break;
      }
    case 28:
      {
        console.log("FX15 : sets the delay timer to VX");
        break;
      }
    case 29:
      {
        console.log("FX18 : sets the sound timer to VX");
        break;
      }
    case 30:
      {
        console.log("FX1E : adds value in the register adresse x to the register current index\n x", b3, " register array: ", this.CPU.register);
        /*if ((cpu.I + cpu.V[b3]) > 0xFFF) {
          cpu.V[0xF] = 1;
        } else {
          cpu.V[0xF] = 0;
        }
        cpu.I += cpu.V[b3];*/
        break;
      }
    case 31:
      {
        console.log("FX29 : sets i to the location of the sprite for the characteer in VX");
        break;
      }
    case 32:
      {
        console.log("FX33 : ");
        break;
      }
    case 33:
      {
        console.log("FX55 : Stores V0 to VX (including VX) in memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified. ");
        break;
      }
    case 34:
      {
        console.log("FX65 : Fills V0 to VX (including VX) with values from memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified. ");
        break;
      }
    default:
      {
        if (opCodeId) {
          console.warn("opcode not implemented yet ! opCodeId: ", opCodeId, " opcode: ", this.prettyPrintOpCode(opcode));
        } else {
          console.warn("opcodeId is undefined for the opcode: ", this.prettyPrintOpCode(opcode));
        }
      }
    }
    this.CPU.programCounter += 2;
    if ((this.CPU.programCounter + 1) > this.memory.length) {
      throw "overflowOfMemory due to the counter going beyond the memory adresses"
    }
  }
  prettyPrintOpCode(opcode){
    return opcode.toString(16).toUpperCase();
  }
  generateOpcodeTable() {
    this.opcodeTable = ["0NNN", "00E0", "00EE", "1NNN", "2NNN", "3XNN", "4XNN", "5XY0", "6XNN",
    "7XNN", "8XY0", "8XY1", "8XY2", "8XY3", "8XY4", "8XY5", "8XY6", "8XY7",
    "8XYE", "9XY0", "ANNN", "BNNN", "CXNN", "DXYN", "EX9E", "EXA1", "FX07",
    "FX0A", "FX15", "FX18", "FX1E", "FX29", "FX33", "FX55", "FX65"];
    this.opCodeAmount = this.opcodeTable.length;
    let mask = new Array(this.opCodeAmount);
    let id = new Array(this.opCodeAmount);
    mask[0]  =  0x0000;   id[0]  =  0x0FFF;    /* 0NNN */
    mask[1]  =  0xFFFF;   id[1]  =  0x00E0;    /* 00E0 */
    mask[2]  =  0xFFFF;   id[2]  =  0x00EE;    /* 00EE */
    mask[3]  =  0xF000;   id[3]  =  0x1000;    /* 1NNN */
    mask[4]  =  0xF000;   id[4]  =  0x2000;    /* 2NNN */
    mask[5]  =  0xF000;   id[5]  =  0x3000;    /* 3XNN */
    mask[6]  =  0xF000;   id[6]  =  0x4000;    /* 4XNN */
    mask[7]  =  0xF00F;   id[7]  =  0x5000;    /* 5XY0 */
    mask[8]  =  0xF000;   id[8]  =  0x6000;    /* 6XNN */
    mask[9]  =  0xF000;   id[9]  =  0x7000;    /* 7XNN */
    mask[10] =  0xF00F;   id[10] =  0x8000;    /* 8XY0 */
    mask[11] =  0xF00F;   id[11] =  0x8001;    /* 8XY1 */
    mask[12] =  0xF00F;   id[12] =  0x8002;    /* 8XY2 */
    mask[13] =  0xF00F;   id[13] =  0x8003;    /* BXY3 */
    mask[14] =  0xF00F;   id[14] =  0x8004;    /* 8XY4 */
    mask[15] =  0xF00F;   id[15] =  0x8005;    /* 8XY5 */
    mask[16] =  0xF00F;   id[16] =  0x8006;    /* 8XY6 */
    mask[17] =  0xF00F;   id[17] =  0x8007;    /* 8XY7 */
    mask[18] =  0xF00F;   id[18] =  0x800E;    /* 8XYE */
    mask[19] =  0xF00F;   id[19] =  0x9000;    /* 9XY0 */
    mask[20] =  0xF000;   id[20] =  0xA000;    /* ANNN */
    mask[21] =  0xF000;   id[21] =  0xB000;    /* BNNN */
    mask[22] =  0xF000;   id[22] =  0xC000;    /* CXNN */
    mask[23] =  0xF000;   id[23] =  0xD000;    /* DXYN */
    mask[24] =  0xF0FF;   id[24] =  0xE09E;    /* EX9E */
    mask[25] =  0xF0FF;   id[25] =  0xE0A1;    /* EXA1 */
    mask[26] =  0xF0FF;   id[26] =  0xF007;    /* FX07 */
    mask[27] =  0xF0FF;   id[27] =  0xF00A;    /* FX0A */
    mask[28] =  0xF0FF;   id[28] =  0xF015;    /* FX15 */
    mask[29] =  0xF0FF;   id[29] =  0xF018;    /* FX18 */
    mask[30] =  0xF0FF;   id[30] =  0xF01E;    /* FX1E */
    mask[31] =  0xF0FF;   id[31] =  0xF029;    /* FX29 */
    mask[32] =  0xF0FF;   id[32] =  0xF033;    /* FX33 */
    mask[33] =  0xF0FF;   id[33] =  0xF055;    /* FX55 */
    mask[34] =  0xF0FF;   id[34] =  0xF065;    /* FX65 */
    return {
      mask: mask,
      id: id
    }
  }
  generateCPU() {
    return {
      //16 bit counter to iterate through the memory array
      programCounter: 512,
      //array representing the register which is 8bit data register and 16 bloc of 8bit long
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
    return await new Promise(resolve => {
      setTimeout(() => {
        //console.error("time to wait: ", t);
        resolve();
      }, t);
    });
  }
  async start(programUrl) {
    await this.loadProgram(programUrl);
    this.mainLoop();
    return;
  }
  async mainLoop() {
    let t1, t2, t3, opcode;
    while (this.mainThreadSwitch) {
      t1 = performance.now();
      opcode = this.getOpcode();
      //console.log("opcode: ", opcode.toString(16).toUpperCase());
      this.doOperation(opcode);
      this.updateScreen();
      this.counterDecrement();
      t2 = performance.now();
      await this.wait(this.timeBetweenFrame - (t2 - t1) + 100);
      t3 = performance.now();
      //console.error("lol", (t3 - t2), "ms");
    }
  }
  stopMainThread() {
    this.mainThreadSwitch = false;
  }
  mainThreadSwitchTrigger() {
    this.mainThreadSwitch = !this.mainThreadSwitch;
  }
  async loadProgram(programUrl) {
    const programBlob = await this.getBlob(programUrl);
    this.programCode = await this.getByteArrayFromBlob(programBlob);
    console.error("this.programCode: ", this.programCode);
    for (let i = this.CPU.programCounter; i < this.memory.length; i++) {
      this.memory[i] = this.programCode[i - this.CPU.programCounter];
    }
    console.log("this.memory: ", this.memory);
  }
  async getByteArrayFromBlob(blob) {
    return await new Promise(resolve => {
      let reader = new FileReader();
      reader.addEventListener("loadend", () => {
        resolve(new Uint8Array(reader.result));
      });
      reader.readAsArrayBuffer(blob);
    });
  }
  async getBlob(blobUrl) {
    return await new Promise(resolve => {
      let oReq = new XMLHttpRequest();
      oReq.open("GET", blobUrl);
      oReq.responseType = "blob";
      oReq.onload = function () {
        resolve(oReq.response);
      };
      oReq.send();
    });
  }
};
let test = null;
function StartChip8() {
  let Monitor = document.getElementsByTagName("monitor")[0];
  let chip8 = new Chip8Instance(Monitor);
  return chip8;
}

function start() {
  let t1 = performance.now();
  let currentInstance = StartChip8();
  test = currentInstance;
  console.log("currentInstance: ", currentInstance);
  let t2 = performance.now();
  console.log("generating context took: ", t2 - t1, " ms");
  testFunction(currentInstance);
  currentInstance.start("./program/lol.ch8");
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
