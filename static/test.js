//@ts-check

class Test_Chip8Instance {
    SHOW_CPU_STATE = false;
    /**
     * 
     * @param {Chip8Instance} chip8Instance 
     */
    constructor(chip8Instance) {
        this._Chip8 = chip8Instance;

        this.init();
    }

    init() {
        this.initTestToLaunch();
    }


    resetState() {
        this._Chip8.initMemory();
        this._Chip8.initCPU();
        this._Chip8.initScreen();
        this._Chip8.generateMonitor();
    }

    /**
     * [TEST_NAME]:MESSAGE: String
     */
    testReportMap = {};

    /**
     * 
     * @param {String} testName 
     * @param {String} message 
     * @returns 
     */
    addReportingToTest(testName, message) {
        if (this.testReportMap[testName]) {
            this.testReportMap[testName] += "\n    " + message;
        } else {
            this.testReportMap[testName] = "[" + testName + "]:\n    " + message;
        }
        return true;
    }


    /**
     * 
     * @param {Function} testToStart 
     */
    launchTest(testToStart) {
        this.resetState();

        console.log("TESTING: " + testToStart.name);
        let result = false;

        try {
            result = testToStart.apply(this);
        } catch (error) {
            result = false;
        }

        return result;
    }

    TEST_0NNN() { console.log("TEST_0NNN START !"); this.printCPU_State(); }
    TEST_00E0() {
        console.log("TEST_00E0 START !");
        this.printCPU_State();
        let result = true;

        this._Chip8.doOperation(0x00E0);

        for (let x = this._Chip8.monitorRes.height; x-- > 0;) {
            for (let y = this._Chip8.monitorRes.width; y-- > 0;) {
                if (this._Chip8.twoDimentionalMonitorArrayBuffer[x][y] !== "black") {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }
    TEST_00EE() { console.log("TEST_00EE START !"); this.printCPU_State(); }
    TEST_1NNN() { console.log("TEST_1NNN START !"); this.printCPU_State(); }
    TEST_2NNN() { console.log("TEST_2NNN START !"); this.printCPU_State(); }
    TEST_3XNN() { console.log("TEST_3XNN START !"); this.printCPU_State(); }
    TEST_4XNN() { console.log("TEST_4XNN START !"); this.printCPU_State(); }
    TEST_5XY0() { console.log("TEST_5XY0 START !"); this.printCPU_State(); }
    TEST_6XNN() { console.log("TEST_6XNN START !"); this.printCPU_State(); }
    TEST_7XNN() { console.log("TEST_7XNN START !"); this.printCPU_State(); }
    TEST_8XY0() {
        console.log("TEST_8XY0 START !");
        this.printCPU_State();
        let result = false;

        /** 0X8A70 */
        let X = 0xA;
        let Y = 0x7;

        /** basic overflowTest */
        this._Chip8.CPU.register[Y] = 666;
        /** Check if overflow is managed */
        if (this._Chip8.CPU.register[Y] !== (666 - 256 - 256)) {
            const message = "overflow not properly handled got: " + this._Chip8.CPU.register[Y];
            this.addReportingToTest("TEST_8XY0", message);
            return false;
        }



        let opcode = this.createOpCode(0x8, X, Y, 0x0);
        this._Chip8.doOperation(opcode);

        let VX = this._Chip8.CPU.register[X];
        let VY = this._Chip8.CPU.register[Y];

        if (VX === VY) {
            result = true;
        }



        this.printCPU_State();

        return result;
    }
    TEST_8XY1() { console.log("TEST_8XY1 START !"); this.printCPU_State(); }
    TEST_8XY2() { console.log("TEST_8XY2 START !"); this.printCPU_State(); }
    TEST_BXY3() { console.log("TEST_BXY3 START !"); this.printCPU_State(); }
    TEST_8XY4() { console.log("TEST_8XY4 START !"); this.printCPU_State(); }
    TEST_8XY5() { console.log("TEST_8XY5 START !"); this.printCPU_State(); }
    TEST_8XY6() { console.log("TEST_8XY6 START !"); this.printCPU_State(); }
    TEST_8XY7() { console.log("TEST_8XY7 START !"); this.printCPU_State(); }
    TEST_8XYE() { console.log("TEST_8XYE START !"); this.printCPU_State(); }
    TEST_9XY0() { console.log("TEST_9XY0 START !"); this.printCPU_State(); }
    TEST_ANNN() { console.log("TEST_ANNN START !"); this.printCPU_State(); }
    TEST_BNNN() { console.log("TEST_BNNN START !"); this.printCPU_State(); }
    TEST_CXNN() { console.log("TEST_CXNN START !"); this.printCPU_State(); }
    TEST_DXYN() { console.log("TEST_DXYN START !"); this.printCPU_State(); }
    TEST_EX9E() { console.log("TEST_EX9E START !"); this.printCPU_State(); }
    TEST_EXA1() { console.log("TEST_EXA1 START !"); this.printCPU_State(); }
    TEST_FX07() { console.log("TEST_FX07 START !"); this.printCPU_State(); }
    TEST_FX0A() { console.log("TEST_FX0A START !"); this.printCPU_State(); }
    TEST_FX15() { console.log("TEST_FX15 START !"); this.printCPU_State(); }
    TEST_FX18() { console.log("TEST_FX18 START !"); this.printCPU_State(); }
    TEST_FX1E() { console.log("TEST_FX1E START !"); this.printCPU_State(); }
    TEST_FX29() { console.log("TEST_FX29 START !"); this.printCPU_State(); }
    TEST_FX33() { console.log("TEST_FX33 START !"); this.printCPU_State(); }
    TEST_FX55() { console.log("TEST_FX55 START !"); this.printCPU_State(); }
    TEST_FX65() { console.log("TEST_FX65 START !"); this.printCPU_State(); }


    /**
     * TODO: Find a better name for the arguments lol
     * @param {Number} A first 4bit
     * @param {Number} B second 4bit
     * @param {Number} C third 4bit
     * @param {Number} D last 4bit
     * @returns {Number}
     */
    createOpCode(A, B, C, D) {
        return ((A << 12) + (B << 8) + (C << 4) + (D));
    }


    getCPU_State() {
        return JSON.stringify(this._Chip8.CPU);
    }
    printCPU_State() {
        if (this.SHOW_CPU_STATE) {
            console.log(this.getCPU_State());
        }
    }

    startTests() {

        const testResultsMap = {};

        console.log("Launching test !");
        for (const currentTest of this.testToLaunch) {
            testResultsMap[currentTest.name] = this.launchTest(currentTest);
        }

        console.log("!!!!!!All Test Completed!!!!!!");

        let testErrorCount = 0;
        for (const testName in testResultsMap) {
            if (Object.hasOwnProperty.call(testResultsMap, testName)) {
                const testResult = testResultsMap[testName];
                if (!testResult) {
                    testErrorCount++;
                    console.log(testName + " did not pass the test");
                    if (this.testReportMap[testName]) {
                        console.error(this.testReportMap[testName]);
                    }
                }
            }
        }

        if (testErrorCount == 0) {
            console.log("There is no known error GOOD JOB !");
        } else {
            console.log("There is " + testErrorCount + " known errors !");
        }

    }

    /*
     * "0NNN", "00E0", "00EE", "1NNN", "2NNN", "3XNN",
     * "4XNN", "5XY0", "6XNN", "7XNN", "8XY0", "8XY1",
     * "8XY2", "BXY3", "8XY4", "8XY5", "8XY6", "8XY7",
     * "8XYE", "9XY0", "ANNN", "BNNN", "CXNN", "DXYN",
     * "EX9E", "EXA1", "FX07", "FX0A", "FX15", "FX18",
     * "FX1E", "FX29", "FX33", "FX55", "FX65"
     */

    instructionAvailable = [
        "00E0", "8XY0"
    ];

    /** @type {Function[]} */
    testToLaunch = [];

    initTestToLaunch() {
        this.testToLaunch = this.instructionAvailable.map((x) => this["TEST_" + x]);
    }



}