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

    TEST_ANNN() {
        console.log("salut !");

        console.log(JSON.stringify(this._Chip8.CPU));




    }

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

    testToLaunch = [
        this.TEST_ANNN
    ]

}