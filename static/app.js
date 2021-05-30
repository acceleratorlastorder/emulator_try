//@ts-check

class Chip8Instance {
  /*
   ***************************************************** DECIMAL *****************************************************
   * |  0 | |  1 | | 2  | | 3  | | 4  | | 5  | | 6  | | 7  | |  8 | |  9 | | A  | |  B | |  C | |  D | |  E | | F  | *
   ***************************************************** BINARY ******************************************************
   * |1111| |1000| |1111| |1111| |1001| |1111| |1111| |1111| |1111| |1111| |1111| |1110| |1111| |1110| |1111| |1111| *
   * |1001| |1100| |1000| |1000| |1001| |1000| |1000| |1000| |1001| |1001| |1001| |1001| |1000| |1001| |1000| |1000| *
   * |1001| |1000| |1111| |1111| |1111| |1111| |1000| |1111| |1111| |1111| |1111| |1110| |1000| |1001| |1111| |1111| *
   * |1001| |1000| |1000| |1000| |1000| |1000| |1001| |1000| |1001| |1000| |1001| |1001| |1000| |1001| |1000| |1000| *
   * |1111| |1110| |1111| |1111| |1000| |1111| |1111| |1000| |1111| |1111| |1001| |1110| |1111| |1110| |1111| |1000| *
   *******************************************************************************************************************/
  DEFAULT_FONT = [
    0xF0, 0x90, 0x90, 0x90, 0xF0,   /** 0 */
    0x20, 0x60, 0x20, 0x20, 0x70,   /** 1 */
    0xF0, 0x10, 0xF0, 0x80, 0xF0,   /** 2 */
    0xF0, 0x10, 0xF0, 0x10, 0xF0,   /** 3 */
    0x90, 0x90, 0xF0, 0x10, 0x10,   /** 4 */
    0xF0, 0x80, 0xF0, 0x10, 0xF0,   /** 5 */
    0xF0, 0x80, 0x20, 0x90, 0xF0,   /** 6 */
    0xF0, 0x10, 0xF0, 0x40, 0x40,   /** 7 */
    0xF0, 0x90, 0xF0, 0x90, 0xF0,   /** 8 */
    0xF0, 0x90, 0xF0, 0x10, 0xF0,   /** 9 */
    0xF0, 0x90, 0xF0, 0x90, 0x90,   /** A */
    0xE0, 0x90, 0xE0, 0x90, 0xE0,   /** B */
    0xF0, 0x80, 0x80, 0x80, 0xF0,   /** C */
    0xE0, 0x90, 0x90, 0x90, 0xE0,   /** D */
    0xF0, 0x80, 0xF0, 0x80, 0xF0,   /** E */
    0xF0, 0x80, 0xF0, 0x80, 0x80    /** F */
  ];


  CARRY_FLAG = 0xF;
  constructor(MonitorElement) {
    if (!MonitorElement) {
      console.error("Cannot instantiate 'Chip8Instance' without the 'MonitorElement' argument");
      return;
    }
    this.DEBUG = { activated: true, level: 0 };
    this.mainThreadSwitch = true;
    this.FPS = 60;
    this.timeBetweenFrame = 1 / this.FPS * 1000;
    this.opPerCycle = 4;
    this.currentKeysPressed = [];
    //time 1000 to get second as miliseconds
    this.decrementInterval = 1 / this.FPS * 1000;
    this.initMemory();
    this.initCPU();
    this.initFont();
    this.operationTable = this.generateOpcodeTable();
    this.monitorRes = { width: 64, height: 32 };
    this.defaultColor = ["black", "white"];
    this.monitorPixelReferences = [];

    this.monitor = null;
    this.monitor = MonitorElement;
    this.initScreen();
  }

  initFont() {
    /** from the DEFAULT_FONT variable place the values in memory from address 50*/
    for (let index = 0; index < this.DEFAULT_FONT.length; index++) {
      const fontLine = this.DEFAULT_FONT[index];
      this.memory[50 + index] = fontLine;
    }
  }

  initCPU() {
    this.CPU = this.generateCPU();
  }
  initMemory() {
    /**
     * The use of an Uint8Array makes the overflow possible in JS ex 255 + 1 = 256 in normal condition,
     *  but here it will be 0
     */
    this.memory = new Uint8Array(4096);
  }
  initScreen() {
    /** 2D HTMLCollection */
    this.twoDimentionalMonitorArrayView = [[]];
    this.twoDimentionalMonitorArrayBuffer = Array.from(Array(this.monitorRes.height), () => new Array(this.monitorRes.width));
    this.generateMonitor();
    this.setAllPixelToColor(this.defaultColor[1]);
  }

  injectOpCode(id) {
    if (id === 0) {
      this.memory[this.CPU.programCounter] = 0x00;
      this.memory[this.CPU.programCounter + 1] = 0xE0;
    } else {
      console.warn("not implemented !");
    }
  }
  testOpCode() {
    let testCase = 1;
    for (var i = 0; i < testCase; i++) {
      this.injectOpCode(i);
    }
  }

  /**
  * [get an opcode by reading the memory]
  * [behavior: since the memory is segmented in block of 8 bits and an opcode 16 bits
  * we do need to take 2 value from the memory instead of just one]
  * @return {Number} [return technically an unsinedInt in 16 bits but we're in javascript soooo ;)]
  */
  getOpcode() {
    return (this.memory[this.CPU.programCounter] << 8) + this.memory[this.CPU.programCounter + 1];
  }


  getOperationFromOpcode(opcode) {
    /**
     * TODO:
     * Maybe try to rearange the operationTable to place most used opcode conveniently at the beginning of the loop
     */
    for (let i = this.opCodeAmount; i-- > 0;) {
      if ((this.operationTable.mask[i] & opcode) === this.operationTable.id[i]) {
        return i;
      }
    }
  }

  /**
   * Exectute an opcode
   * @param {Number} opcode 
   */
  async doOperation(opcode) {
    let opCodeId = this.getOperationFromOpcode(opcode);
    /**
     * Position [0100] second sequence of 4bit
     */
    let b3 = (opcode & 0x0F00) >> 8;
    /**
     * Position [0010] third sequence of 4bit
     */
    let b2 = (opcode & 0x00F0) >> 4;
    /**
     * LSB last one of the opcode [0001]
     */
    let b1 = (opcode & 0x000F);
    /**
     * Maybe move it in the opcode using it instead of running it for every opcode
     * Define a random variable holding a random value for the current cycle
     */
    const randomCycleValue = window.crypto.getRandomValues(new Uint8Array(1))[0];

    switch (opCodeId) {
      case 0:
        {
          console.warn("opcode at the id 0 isn't implemented yet");
          break;
        }
      case 1:
        {
          console.log("DONE! 00E0 : resetScreen");
          let x, y;
          for (x = 0; x < this.monitorRes.height; x++) {
            for (y = 0; y < this.monitorRes.width; y++) {
              this.twoDimentionalMonitorArrayBuffer[x][y] = this.defaultColor[0];
            }
          }
          break;
        }
      case 2:
        {
          console.log("MAYBE! 00EE : returns from a function");
          if (this.CPU.stackJumpCounter > 0) {
            /** return to previous stack index(should be valued with the calee address right ?? :) who knows lol) */
            this.CPU.stackJumpCounter--;
          }
          this.CPU.programCounter = this.CPU.stackJumpCounter;
          break;
        }
      case 3:
        {
          const NNN = opcode & 0x0FFF;
          this.logger("MAYBE! 1NNN : jumps to the NNN adresse; NNN: ", this.prettyPrintOpCode(NNN));
          /*since "this.CPU.programCounter += 2;" is done later on we need to remove 2 to the counter*/
          this.CPU.programCounter = NNN - 2;
          break;
        }
      case 4:
        {
          const NNN = opcode & 0x0FFF;
          this.logger("MAYBE! 2NNN : calls a function at the NNN adresse; NNN: ", this.prettyPrintOpCode(opcode & 0x0FFF));
          /*Saves the current position of the program counter before going to the function adress, used to define the return point when the function is done*/
          this.CPU.stack[this.CPU.stackJumpCounter] = this.CPU.programCounter;

          if (this.CPU.stackJumpCounter < 15) {
            this.CPU.stackJumpCounter++;
          }
          /*since "this.CPU.programCounter += 2;" is done later in the function, we need to remove 2 to the counter*/
          this.CPU.programCounter = NNN - 2;
          break;
        }
      case 5:
        {
          const VX = this.CPU.register[b3];
          const NN = opcode & 0x00FF;
          this.logger("MAYBE! 3XNN : skips the next instruction if VX === NN; VX: ", this.prettyPrintOpCode(VX), " NN: ", this.prettyPrintOpCode(NN));

          if (VX === NN) {
            /** jump 2 8bit chunk to the next opcode (to the moon as they says) */
            this.CPU.programCounter += 2;
          }

          break;
        }
      case 6:
        {
          const VX = this.CPU.register[b3];
          const NN = opcode & 0x00FF;
          this.logger("MAYBE! 4XNN : skips the next instruction if VX !== NN; VX: ", this.prettyPrintOpCode(VX), " NN: ", this.prettyPrintOpCode(NN));
          if (VX !== NN) {
            /** jump 2 8bit chunk to the next opcode (to the moon as they says) */
            this.CPU.programCounter += 2;
          }
          break;
        }
      case 7:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          this.logger("MAYBE! 5XY0 : skips the next instruction if VX === VY; VX: ", this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY));
          if (VX === VY) {
            /** jump 2 8bit chunk to the next opcode (to the moon as they says) */
            this.CPU.programCounter += 2;
          }
          break;
        }
      case 8:
        {
          const VXAddress = b3;
          const NN = opcode & 0x00FF;
          this.logger("MAYBE! 6XNN : sets VX to NN; VX: ", this.prettyPrintOpCode(this.CPU.register[VXAddress]), " NN: ", this.prettyPrintOpCode(NN));
          this.CPU.register[VXAddress] = NN;
          break;
        }
      case 9:
        {
          const VXAddress = b3;
          const NN = opcode & 0x00FF;
          this.logger("MAYBE! 7XNN : adds NN to VX: VX += NN if overflow the carryflag isn't changed!; VX: ",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " NN: ", this.prettyPrintOpCode(NN),
            " VX += NN = ", this.prettyPrintOpCode(this.CPU.register[VXAddress] + NN));
          this.CPU.register[VXAddress] += NN;
          break;
        }
      case 10:
        {
          const VXAddress = b3;
          const VY = this.CPU.register[b2];
          this.logger("DONE! 8XY0 : sets VX to VY (VX = VY)");

          this.CPU.register[VXAddress] = VY;
          break;
        }
      case 11:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          const registerNewValue = VX | VY;
          this.logger("MAYBE! 8XY1 : sets VX to VX or VY (bitwise VX = VX|VY); VX:",
            this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY),
            " VX|VY = ", registerNewValue);

          this.CPU.register[VXAddress] = registerNewValue;
          break;
        }
      case 12:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          const registerNewValue = VX & VY;
          this.logger("MAYBE! 8XY2 : sets VX to VX and VY (bitwise VX = VX&VY); VX:",
            this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY),
            " VX&VY = ", registerNewValue);

          this.CPU.register[VXAddress] = registerNewValue;
          break;
        }
      case 13:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          const registerNewValue = VX ^ VY;
          this.logger("MAYBE! 8XY3 : sets VX to VX xor VY; (bitwise VX = VX^VY); VX:",
            this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY),
            " VX^VY = ", this.prettyPrintOpCode(registerNewValue));

          this.CPU.register[VXAddress] = registerNewValue;
          break;
        }
      case 14:
        {
          const VXAddress = b3;
          const VYAddress = b2;
          const result = this.CPU.register[VXAddress] + this.CPU.register[VYAddress];
          this.logger("TODO! 8XY4 : adds VY to VX if overflow of the 8bit capacity the carry flag at VF is set to 1 otherwise 0; VX",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " VY ", this.prettyPrintOpCode(this.CPU.register[VYAddress]),
            " VX + VY =", this.prettyPrintOpCode(result));
          break;
        }
      case 15:
        {
          const VXAddress = b3;
          const VYAddress = b2;
          const result = this.CPU.register[VXAddress] - this.CPU.register[VYAddress];
          this.logger("MAYBE! 8XY5 : substracts VY to VX, VX -= VY: if there is a borrow VF is set to 0 otherwise 1; VX:",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " VY:", this.prettyPrintOpCode(this.CPU.register[VYAddress]),
            "VX -= VY:", result);

          if (result < 0) {
            /** Set VF to 0 since the value is inf to 0 (Remember thanks to JS the result variable might be = -666 
              *    once we will insert this value into the 8bit register it will be converted into 102)
              */
            this.CPU.register[0xF] = 0;
          } else {
            this.CPU.register[0xF] = 1;
          }

          this.CPU.register[VXAddress] = result;
          break;
        }
      case 16:
        {
          this.logger("TODO! 8XY6 : Stores the LSB (least significant bit) of VX in VF then right shift VX by 1");
          break;
        }
      case 17:
        {
          this.logger("TODO! 8XY7 : sets VX to VY minus VX. VF is set to 0 when there is a borrow otherwise 1");
          break;
        }
      case 18:
        {
          this.logger("TODO! 8XYE : Stores the MSB (most significant bit) of VX in VF then left shift VX by 1");
          break;
        }
      case 19:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          this.logger("MAYBE! 9XY0 : skip the next instruction if VX !== VY; VX:", this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY));
          if (VX !== VY) {
            /** jump 2 8bit chunk to the next opcode (to the moon as they says) */
            this.CPU.programCounter += 2;
          }
          break;
        }
      case 20:
        {
          const NNN = opcode & 0x0FFF;
          this.logger("DONE! ANNN : set the registerCounter to the adresse NNN; registerCounter: ", this.CPU.registerCounter, " NNN: ", this.prettyPrintOpCode(NNN));
          this.CPU.registerCounter = NNN;
          break;
        }
      case 21:
        {
          const NNN = opcode & 0x0FFF;
          const result = NNN + this.CPU.register[0];
          this.logger("DONE! BNNN : jumps to the adresse NNN + V0; V0: ", this.CPU.register[0], "NNN: ", this.prettyPrintOpCode(NNN), " result: ", result);
          this.CPU.programCounter = result;
          break;
        }
      case 22:
        {
          const VXAddress = b3;
          const NN = opcode & 0x00FF;
          const result = randomCycleValue & NN;
          this.logger("MAYBE! CXNN : sets VX to the result of a bitwise an operation on a random number and NN (VX = random() & NN ); VX:",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " NN:", this.prettyPrintOpCode(NN), " rand():",
            this.prettyPrintOpCode(randomCycleValue), " VX = random() & NN =", this.prettyPrintOpCode(result));

          this.CPU.register[VXAddress] = result;
          /*randomCycleValue*/

          break;
        }
      case 23:
        {
          const VX = this.CPU.register[b3];
          const VY = this.CPU.register[b2];
          const N = b1;
          this.logger("MAYBE! DXYN : draws a sprite at the coordinate VX and VY with a fixed width of 8 pixel and the height is define by N N: ",
            this.prettyPrintOpCode(N), " VX: ", this.prettyPrintOpCode(VX), " VY: ", this.prettyPrintOpCode(VY));
          this.draw(VX, VY, 8, N);



          break;
        }
      case 24:
        {
          this.logger("TODO! EX9E : Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)");
          break;
        }
      case 25:
        {
          this.logger("TODO! EXA1 : Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)");
          break;
        }
      case 26:
        {
          const VXAddress = b3;
          this.logger("MAYBE! FX07 : Sets VX to the value of the delay timer; VX: ",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " delayTimer:", this.CPU.delayTimer);

          this.CPU.register[VXAddress] = this.CPU.delayTimer;
          break;
        }
      case 27:
        {
          this.logger("TODO! FX0A : Waits a key press event then stores it in VX, as long any key isn't pressed every operation are blocked (kind of a pause until key pressed)");

          await await new Promise(async resolve => {
            /*wait key press*/
            if (this.currentKeysPressed.length > 0 || true) {
              /** TODO REMOVE THE ||TRUE once controller are implemented*/
              resolve();
            } else {
              await this.wait(timeBetweenFrame);
            }
          });

          break;
        }
      case 28:
        {
          const VXAddress = b3;
          this.logger("MAYBE! FX15 : sets the delay timer to VX; VX: ",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " delayTimer:", this.CPU.delayTimer);

          this.CPU.delayTimer = this.CPU.register[VXAddress];
          break;
        }
      case 29:
        {
          const VXAddress = b3;
          this.logger("MAYBE! FX18 : sets the sound timer to VX; VX: ",
            this.prettyPrintOpCode(this.CPU.register[VXAddress]), " soundTimer:", this.CPU.soundTimer);

          this.CPU.soundTimer = this.CPU.register[VXAddress];
          break;
        }
      case 30:
        {
          const VX = this.CPU.register[b3];
          let result = this.CPU.registerCounter + VX;
          this.logger("TODO! FX1E : Adds VX to I(registerCounter). VF is not affected; VX:",
            VX, " I =", this.CPU.registerCounter, " VX + I = ", result);
          /** 
           * To know more about the carry flag behavior here:
           * https://en.wikipedia.org/wiki/CHIP-8#cite_note-18 
           */
          if (result > 0xFFFF) {
            let overFlowFixArray = new Uint16Array(1);
            overFlowFixArray[0] = result;
            result = overFlowFixArray[0];
          }

          this.CPU.registerCounter = result;
          break;
        }
      case 31:
        {
          this.logger("TODO! FX29 : Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.");
          break;
        }
      case 32:
        {
          this.logger("TODO! FX33 : Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.) ");
          break;
        }
      case 33:
        {
          this.logger("TODO! FX55 : Stores V0 to VX (including VX) in memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified. ");
          break;
        }
      case 34:
        {
          this.logger("TODO! FX65 : Fills V0 to VX (including VX) with values from memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified. ");
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
    /*increment by 2 due to the 16bit length in an 8 bit chunk memory, more info in -> this.getOpcode()*/
    this.CPU.programCounter += 2;
    if ((this.CPU.programCounter + 1) > this.memory.length) {
      throw "overflowOfMemory due to the counter going beyond the memory adresses"
    }
  }
  /**
   * variable arguments length, simply gives them to console.log if the DEBUG flag is set true
   */
  logger(text) {
    if (this.DEBUG.activated) {
      console.log.apply(null, arguments);
      if (this.DEBUG.level === 1) {
        /*Wrote that in the devtool console too lazy to indent lol, basically it format the text in a way to get the JS line of the caller*/
        (new Error()).stack.split("at ").map((function (getFlag) { var gotPrev = false; return function (x) { if (gotPrev) { gotPrev = false; return x.trim(); } if (x.indexOf(getFlag) !== -1) { gotPrev = true; } } })("Chip8Instance.logger")).filter(x => x);
      } else if (this.DEBUG.level === 2) {
        /*Just print the stack*/
        (new Error()).stack;
      }
    }
  }
  /**
   * Print an opcode in HEX representation easier to read
   * @param {Number} opcode 
   */
  prettyPrintOpCode(opcode) {
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
    mask[0] = 0x0000; id[0] = 0x0FFF;    /* 0NNN */
    mask[1] = 0xFFFF; id[1] = 0x00E0;    /* 00E0 */
    mask[2] = 0xFFFF; id[2] = 0x00EE;    /* 00EE */
    mask[3] = 0xF000; id[3] = 0x1000;    /* 1NNN */
    mask[4] = 0xF000; id[4] = 0x2000;    /* 2NNN */
    mask[5] = 0xF000; id[5] = 0x3000;    /* 3XNN */
    mask[6] = 0xF000; id[6] = 0x4000;    /* 4XNN */
    mask[7] = 0xF00F; id[7] = 0x5000;    /* 5XY0 */
    mask[8] = 0xF000; id[8] = 0x6000;    /* 6XNN */
    mask[9] = 0xF000; id[9] = 0x7000;    /* 7XNN */
    mask[10] = 0xF00F; id[10] = 0x8000;    /* 8XY0 */
    mask[11] = 0xF00F; id[11] = 0x8001;    /* 8XY1 */
    mask[12] = 0xF00F; id[12] = 0x8002;    /* 8XY2 */
    mask[13] = 0xF00F; id[13] = 0x8003;    /* BXY3 */
    mask[14] = 0xF00F; id[14] = 0x8004;    /* 8XY4 */
    mask[15] = 0xF00F; id[15] = 0x8005;    /* 8XY5 */
    mask[16] = 0xF00F; id[16] = 0x8006;    /* 8XY6 */
    mask[17] = 0xF00F; id[17] = 0x8007;    /* 8XY7 */
    mask[18] = 0xF00F; id[18] = 0x800E;    /* 8XYE */
    mask[19] = 0xF00F; id[19] = 0x9000;    /* 9XY0 */
    mask[20] = 0xF000; id[20] = 0xA000;    /* ANNN */
    mask[21] = 0xF000; id[21] = 0xB000;    /* BNNN */
    mask[22] = 0xF000; id[22] = 0xC000;    /* CXNN */
    mask[23] = 0xF000; id[23] = 0xD000;    /* DXYN */
    mask[24] = 0xF0FF; id[24] = 0xE09E;    /* EX9E */
    mask[25] = 0xF0FF; id[25] = 0xE0A1;    /* EXA1 */
    mask[26] = 0xF0FF; id[26] = 0xF007;    /* FX07 */
    mask[27] = 0xF0FF; id[27] = 0xF00A;    /* FX0A */
    mask[28] = 0xF0FF; id[28] = 0xF015;    /* FX15 */
    mask[29] = 0xF0FF; id[29] = 0xF018;    /* FX18 */
    mask[30] = 0xF0FF; id[30] = 0xF01E;    /* FX1E */
    mask[31] = 0xF0FF; id[31] = 0xF029;    /* FX29 */
    mask[32] = 0xF0FF; id[32] = 0xF033;    /* FX33 */
    mask[33] = 0xF0FF; id[33] = 0xF055;    /* FX55 */
    mask[34] = 0xF0FF; id[34] = 0xF065;    /* FX65 */
    return {
      mask: mask,
      id: id
    }
  }
  /**
   * Create the CPU instance
   */
  generateCPU() {
    return {
      /** 16 bit counter to iterate through the memory array */
      programCounter: 512,
      /** array representing the register which is 8bit data register and 16 bloc of 8bit long */
      register: new Uint8Array(16),
      /** 16 bit counter to iterate through the register array */
      registerCounter: 0,
      //array representing the stack
      stack: new Uint16Array(16),
      /** stack jump counter to iterate through the stack array must not go past 15 since the stack is 16 indexes long*/
      stackJumpCounter: 0,
      /** */
      delayTimer: 0,
      /** */
      soundTimer: 0
    }
  }
  generateMonitor() {
    /*console.log("this.monitor: ", this.monitor);*/
    let row = null;
    let cell = null;
    let pixelID = 0;
    for (let i = 0; i < this.monitorRes.height; i++) {
      row = document.createElement("section");
      row.className = "row row_" + i;
      this.twoDimentionalMonitorArrayView[i] = new Array(this.monitorRes.width);
      this.twoDimentionalMonitorArrayBuffer[i] = new Array(this.monitorRes.width);
      for (let j = 0; j < this.monitorRes.width; j++) {
        cell = document.createElement("section");
        cell.name = "row_" + i + " cell_" + j + " pixelID_" + pixelID;
        cell.className = "cell";
        this.monitorPixelReferences.push(cell);
        this.twoDimentionalMonitorArrayView[i][j] = cell;
        this.twoDimentionalMonitorArrayBuffer[i][j] = "";
        row.appendChild(cell);
        pixelID++;
      }
      this.monitor.appendChild(row);
    }
  }

  /**
   * Get the carry flag
   * @returns {Number} returns the carryState
   */
  getCarryFlag() {
    return this.getRegister(this.CARRY_FLAG);
  }

  /**
   * Set the carry flag to a given value
   * @param {Number} value 
   * @returns {Number} returns the carryState
   */
  setCarryFlag(value) {
    return this.setRegister(this.CARRY_FLAG, value);
  }

  /**
   * 
   * @param {Number} register 16 addresses
   * @returns {Number} return the value contained in register [register]
   */
  getRegister(register) {
    return this.CPU.register[register];
  }

  /**
   * 
   * @param {Number} register 16 addresses
   * @param {Number} value Uint8
   * @returns {Number} return the current value of the register
   */
  setRegister(register, value) {
    return this.CPU.register[register] = value;
  }

  setAllPixelToColor(color) {
    for (let i = this.monitorPixelReferences.length; i-- > 0;) {
      this.monitorPixelReferences[i].className = "cell " + color;
    }
  }

  draw(x, y, width, height) {
    let startingIndex = x + (this.monitorRes.width * y);
    let color = this.defaultColor[0];

    let coordX = x;
    let coordY = y;

    /*
    if (currentColor != color) {

      this.setCarryFlag(1);
    }
    */

    /**
     * TODO: WTF ? that's overcomplicated for no reason just use: 
     *  this.twoDimentionalMonitorArrayBuffer[coordX][coordY] = color;
     *  with an iterator lol
     * monitorPixelReferences is actually nice since it target directly the pixel whatever 
     *  is put there will be directly with no other requirement displayed in the screen
     *  maybe use it only for thing that should be there only one frame (which never really happen lol)
     */
    let heightLeft = height;
    for (; heightLeft !== 0; heightLeft--) {
      coordX = (height - heightLeft);
      let newIndex = startingIndex + coordX;
      let widthLeft = width;
      for (; widthLeft !== 0; widthLeft--) {
        coordY = (width - widthLeft);
        newIndex = startingIndex + coordY;
        const element = this.monitorPixelReferences[newIndex];
        element.className = "cell " + color;
        this.twoDimentionalMonitorArrayBuffer[coordX][coordY] = color;
      }
    }
  }

  updateScreen() {
    for (var i = this.twoDimentionalMonitorArrayView.length; i-- > 0;) {
      for (var j = this.twoDimentionalMonitorArrayView[i].length; j-- > 0;) {
        this.twoDimentionalMonitorArrayView[i][j].className = "cell " + this.twoDimentionalMonitorArrayBuffer[i][j];
      }
    }
  }

  counterDecrement() {
    if (this.CPU.delayTimer > 0) { this.CPU.delayTimer-- }
    if (this.CPU.soundTimer > 0) { this.CPU.soundTimer-- }
  }

  async testScreen(loop) {
    let timing = 10;
    let t1, t2;


    t1 = performance.now();
    for (var i = timing; i-- > 0;) {
      this.testPixelInverted();
    }
    t2 = performance.now();
    console.log("testPixelInverted took: ", t2 - t1, " ms");




    await this.wait(timing);
    this.blackScreen();

    await this.wait(timing);
    t1 = performance.now();
    for (var i = timing; i-- > 0;) {
      this.testPixel();
    }
    t2 = performance.now();
    console.log("testPixel took: ", t2 - t1, " ms");

    await this.wait(timing);
    this.whiteScreen();

    /*
    await this.wait(timing);
    await this.slowFill();

    await this.wait(timing);
    await this.slowFill(true);
    */
    if (loop) {
      await this.wait(timing);
      this.testScreen();
    }
  }

  testPixelInverted() {
    let x = this.monitorRes.height;
    let y = this.monitorRes.width;
    let result;
    for (; x-- > 0;) {
      for (; y-- > 0;) {
        result = this.defaultColor[1];
        if (y % (x + 1) === 0) {
          result = this.defaultColor[0];
        }
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
      }
    }
    this.updateScreen();
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

  blackScreen() {
    let x = 0;
    let y = 0;
    let result;
    for (x = 0; x < this.monitorRes.height; x++) {
      for (y = 0; y < this.monitorRes.width; y++) {
        result = this.defaultColor[0];
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
        /*this.twoDimentionalMonitorArrayBuffer[x][y] = result;*/
      }
    }
    this.updateScreen();
  }

  async slowFill(whiteFill) {
    const timing = 0.1;
    let x = 0;
    let y = 0;
    let result;
    let colorIndex = 0;
    if (whiteFill) {
      colorIndex = 1;
    }
    for (x = 0; x < this.monitorRes.height; x++) {
      for (y = 0; y < this.monitorRes.width; y++) {
        result = this.defaultColor[colorIndex];
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
        this.updateScreen();
        await this.wait(timing);
      }
    }
  }

  whiteScreen() {
    let x = 0;
    let y = 0;
    let result;
    for (x = 0; x < this.monitorRes.height; x++) {
      for (y = 0; y < this.monitorRes.width; y++) {
        result = this.defaultColor[1];
        this.twoDimentionalMonitorArrayBuffer[x][y] = result;
      }
    }
    this.updateScreen();
  }

  async wait(t) {
    return new Promise(resolve => {
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

  async makeCycle(opcode) {
    opcode = opcode || this.getOpcode();
    //console.log("opcode: ", opcode.toString(16).toUpperCase());
    await this.doOperation(opcode);
    this.updateScreen();
    this.counterDecrement();
  }

  async mainLoop() {
    let t1, t2, t3;
    while (this.mainThreadSwitch) {
      t1 = performance.now();
      await this.makeCycle();
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
    return new Promise(resolve => {
      let reader = new FileReader();
      reader.addEventListener("loadend", () => {
        resolve(new Uint8Array(reader.result));
      });
      reader.readAsArrayBuffer(blob);
    });
  }

  async getBlob(blobUrl) {
    return new Promise(resolve => {
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

async function start() {
  let t1 = performance.now();
  let currentInstance = StartChip8();
  test = currentInstance;
  console.log("currentInstance: ", currentInstance);
  let t2 = performance.now();
  console.log("generating context took: ", t2 - t1, " ms");
  /*await testFunction(currentInstance);*/
  currentInstance.start("./program/lol.ch8");
}

async function startTest() {
  let currentInstance = StartChip8();


  const testInstance = new Test_Chip8Instance(currentInstance);
  testInstance.startTests();
}

async function testFunction(chip8Instance) {
  let lastStep = "start";
  let t1 = null;
  let t2 = null;
  try {
    lastStep = "testScreen";
    t1 = performance.now();
    await chip8Instance.testScreen();
    t2 = performance.now();
    console.log("testScreen took: ", t2 - t1, " ms");
  } catch (e) {
    console.error("failed on step : [", lastStep, "] got stack: ", e);
  }
}
start();

/*startTest();*/
