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
     * @param {Number} register 
     * @param {Number} register 
     * @returns {Boolean} return true if passed
     */
    testOverflow(register, value) {

        while (value > 256) {
            value -= 256;
        }

        /** Check if overflow is managed */
        return this._Chip8.getRegister(register) === (value);

    }

    /**
     * 
     * @param {String} testName 
     * @param {Number} registerToOverflow 
     * @param {Number} valueOverflow 
     */
    initOverFlowTest(testName, registerToOverflow, valueOverflow) {
        this._Chip8.setRegister(registerToOverflow, valueOverflow);
        const overflowTest = this.testOverflow(registerToOverflow, valueOverflow);
        if (!overflowTest) {
            const message = "overflow not properly handled got: " + this._Chip8.getRegister(registerToOverflow);
            this.addReportingToTest(testName, message);
        }
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

    testInit(opcodeTested) {
        const testName = "TEST_" + opcodeTested;
        console.log(testName + " START !");
        this.printCPU_State();

        return testName;
    }


    TEST_0NNN() { const _testName = this.testInit("0NNN"); }
    TEST_00E0() {
        const _testName = this.testInit("00E0");
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
    TEST_00EE() { const _testName = this.testInit("00EE"); }
    TEST_1NNN() { const _testName = this.testInit("1NNN"); }
    TEST_2NNN() { const _testName = this.testInit("2NNN"); }
    TEST_3XNN() { const _testName = this.testInit("3XNN"); }
    TEST_4XNN() { const _testName = this.testInit("4XNN"); }
    TEST_5XY0() { const _testName = this.testInit("5XY0"); }
    TEST_6XNN() { const _testName = this.testInit("6XNN"); }
    TEST_7XNN() { const _testName = this.testInit("7XNN"); }
    TEST_8XY0() {
        const _testName = this.testInit("8XY0");
        let result = true;

        /****************** 0X8A70 ******************/
        let X = 0xA;
        let Y = 0x7;

        let YRegisterValue = 666;

        /** basic overflowTest */
        const registerToOverflow = Y;
        const valueOverflow = YRegisterValue;
        this.initOverFlowTest(_testName, registerToOverflow, valueOverflow);


        let opcode = this.createOpCode(0x8, X, Y, 0x0);
        this._Chip8.doOperation(opcode);

        let VX = this._Chip8.getRegister(X);
        let VY = this._Chip8.getRegister(Y);

        if (VX !== VY) {
            const message = `failed [VX === VY] test, got VX == ${VX} for VY == ${VX}`;
            this.addReportingToTest(_testName, message);
            result = false;
        }


        /****************** 0X8350 ******************/
        X = 0x3;
        Y = 0x5;
        YRegisterValue = 50;

        this._Chip8.setRegister(Y, YRegisterValue);

        opcode = this.createOpCode(0x8, X, Y, 0x0);
        this._Chip8.doOperation(opcode);

        VX = this._Chip8.getRegister(X);
        VY = this._Chip8.getRegister(Y);
        if (!(VX === VY && VX === YRegisterValue)) {
            let message = `failed [VX === VY && VX === YRegisterValue] test, got VX == ${VX} for VY == ${VY}
             and YRegisterValue == ${YRegisterValue}`;
            this.addReportingToTest(_testName, message);
            result = false;
        }

        this.printCPU_State();

        return result;
    }
    TEST_8XY1() {
        const _testName = this.testInit("8XY1");

    }
    TEST_8XY2() { const _testName = this.testInit("8XY2"); }
    TEST_BXY3() { const _testName = this.testInit("BXY3"); }
    TEST_8XY4() { const _testName = this.testInit("8XY4"); }
    TEST_8XY5() { const _testName = this.testInit("8XY5"); }
    TEST_8XY6() { const _testName = this.testInit("8XY6"); }
    TEST_8XY7() { const _testName = this.testInit("8XY7"); }
    TEST_8XYE() { const _testName = this.testInit("8XYE"); }
    TEST_9XY0() { const _testName = this.testInit("9XY0"); }
    TEST_ANNN() { const _testName = this.testInit("ANNN"); }
    TEST_BNNN() { const _testName = this.testInit("BNNN"); }
    TEST_CXNN() { const _testName = this.testInit("CXNN"); }
    TEST_DXYN() { const _testName = this.testInit("DXYN"); }
    TEST_EX9E() { const _testName = this.testInit("EX9E"); }
    TEST_EXA1() { const _testName = this.testInit("EXA1"); }
    TEST_FX07() { const _testName = this.testInit("FX07"); }
    TEST_FX0A() { const _testName = this.testInit("FX0A"); }
    TEST_FX15() { const _testName = this.testInit("FX15"); }
    TEST_FX18() { const _testName = this.testInit("FX18"); }
    TEST_FX1E() { const _testName = this.testInit("FX1E"); }
    TEST_FX29() { const _testName = this.testInit("FX29"); }
    TEST_FX33() { const _testName = this.testInit("FX33"); }
    TEST_FX55() { const _testName = this.testInit("FX55"); }
    TEST_FX65() { const _testName = this.testInit("FX65"); }

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