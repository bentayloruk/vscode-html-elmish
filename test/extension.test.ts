//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/main';
import * as parser from '../src/parser';

// Defines a Mocha test suite to group tests of similar kind together
suite("Parser Tests", () => {

    // Defines a Mocha unit test
    test("Convert multiple value style attr", () => {
        const elmish = parser.convert("<h1 style='color:blue;text-align:center'></h1>", { indent: { with: " ", size: 4 } });
        assert.equal(elmish, "h1 [ Style [ !!( \"color\", \"blue\" ); !!( \"text-align\", \"center\" ) ] ] [\n    ]");
    });
});