//@ts-check

class Test_Chip8Instance {
    /**
     * 
     * @param {Chip8Instance} chip8Instance 
     */
    constructor(chip8Instance) {
        this._Chip8 = chip8Instance;

        this.startTests();
    }

    resetState() {
        this._Chip8.initMemory();
        this._Chip8.initCPU();
        this._Chip8.initScreen();
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
            result = testToStart();
        } catch (error) {
            result = false;
        }

        return result;
    }

    TEST_0NNN(){console.log("TEST_0NNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_00E0(){console.log("TEST_00E0 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_00EE(){console.log("TEST_00EE START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_1NNN(){console.log("TEST_1NNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_2NNN(){console.log("TEST_2NNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_3XNN(){console.log("TEST_3XNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_4XNN(){console.log("TEST_4XNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_5XY0(){console.log("TEST_5XY0 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_6XNN(){console.log("TEST_6XNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_7XNN(){console.log("TEST_7XNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY0(){console.log("TEST_8XY0 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY1(){console.log("TEST_8XY1 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY2(){console.log("TEST_8XY2 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_BXY3(){console.log("TEST_BXY3 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY4(){console.log("TEST_8XY4 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY5(){console.log("TEST_8XY5 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY6(){console.log("TEST_8XY6 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XY7(){console.log("TEST_8XY7 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_8XYE(){console.log("TEST_8XYE START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_9XY0(){console.log("TEST_9XY0 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_ANNN(){console.log("TEST_ANNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_BNNN(){console.log("TEST_BNNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_CXNN(){console.log("TEST_CXNN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_DXYN(){console.log("TEST_DXYN START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_EX9E(){console.log("TEST_EX9E START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_EXA1(){console.log("TEST_EXA1 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX07(){console.log("TEST_FX07 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX0A(){console.log("TEST_FX0A START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX15(){console.log("TEST_FX15 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX18(){console.log("TEST_FX18 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX1E(){console.log("TEST_FX1E START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX29(){console.log("TEST_FX29 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX33(){console.log("TEST_FX33 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX55(){console.log("TEST_FX55 START !"); console.log(JSON.stringify(this._Chip8.CPU));}
    TEST_FX65(){console.log("TEST_FX65 START !"); console.log(JSON.stringify(this._Chip8.CPU));}



    getCPU_State() {
        return JSON.stringify(this._Chip8.CPU);
    }
    printCPU_State() {
        console.log(JSON.stringify(this._Chip8.CPU));
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
                    console.log("did not pass the test");
                }
            }
        }

        if (testErrorCount == 0) {
            console.log("There is no known error GOOD JOB !");
        } else {
            console.log("There is " + testErrorCount + " known errors !");
        }

    }

    instructionAvailable = [
        "0NNN", "00E0", "00EE", "1NNN", "2NNN", "3XNN",
        "4XNN", "5XY0", "6XNN", "7XNN", "8XY0", "8XY1",
        "8XY2", "BXY3", "8XY4", "8XY5", "8XY6", "8XY7",
        "8XYE", "9XY0", "ANNN", "BNNN", "CXNN", "DXYN",
        "EX9E", "EXA1", "FX07", "FX0A", "FX15", "FX18",
        "FX1E", "FX29", "FX33", "FX55", "FX65"
    ];
    testToLaunch = this.instructionAvailable.map((x) => this["TEST_" + x]);

}