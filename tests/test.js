#!/usr/bin/env node

const os = require('os');
const decixion = require('../src/decixion');
const dcx = decixion;
const game = require('../src/game');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var clear = false;
var debugMode = false;

decixion.each(process.argv, function (i, arg) {
    switch (arg) {
    case '-c':
    case '--clear':
        clear = true;
        break;
    case '-d':
    case '--debug-mode':
        debugMode = true;
        break;
    }
});

function play (option) {
    if (option == 'exit') {
        readline.close();

        return;
    }

    if (clear || option == 'clear') {
        console.clear();
    }

    if (option) {
        var optionNumber = Number.parseInt(option);

        if (!isNaN(optionNumber)) {
            decixion.select(optionNumber - 1);
        } else {
            if (debugMode && option != '' && option != 'clear') {
                try {
                    eval('console.log(' + option + ');');
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    var options = decixion.options();

    console.log(os.EOL + decixion.text() + os.EOL);

    decixion.each(options, function (i, option) {
        console.log((i + 1) + ' - ' + option);
    });

    var countdown = decixion.countdown();
    var optionText;

    if (countdown == 0) {
        optionText = os.EOL + 'Enter option number: ';
    } else {
        optionText = os.EOL + '(' + countdown + ' secs!) Enter option number: ';
    }

    readline.question(optionText, play);
}

decixion.init(game);
play();
