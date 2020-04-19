#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs');

var createOptionIndex = -1;
var projectFolder = null;
var argv = process.argv;
var argc = argv.length;
var i, arg;

for (i = 0; i < argc; i++) {
    arg = argv[i];

    if (createOptionIndex > -1 && createOptionIndex == i - 1) {
        projectFolder = arg;
    }

    if (arg == 'create') {
        createOptionIndex = i;
    }
}

if (createOptionIndex < 0) {
    console.log(
        'Decixion Engine 0.4.0' + os.EOL +
        os.EOL +
        'Usage:' + os.EOL +
        '  decixion create my-project-name' + os.EOL +
        os.EOL +
        'where:' +
        os.EOL +
        '  create command creates a new project.' + os.EOL +
        '  my-project-name is the name of the project and/or its directory ' +
        'path to create.'
    );
} else {
    if (!projectFolder) {
        console.error('ERROR: project name not specified.');
    } else {
        var copyPath = path.join(__dirname, 'dist');
        var destPath = path.join(process.cwd(), projectFolder);

        if (fs.existsSync(destPath)) {
            console.error('ERROR: directory already exists with supplied name.');
        } else {
            var copyIndexPath = path.join(copyPath, 'index.html');
            var copyDecixionPath = path.join(copyPath, 'decixion.min.js');
            var copyGamePath = path.join(copyPath, 'game.js');

            var destIndexPath = path.join(destPath, 'index.html');
            var destDecixionPath = path.join(destPath, 'decixion.min.js');
            var destGamePath = path.join(destPath, 'game.js');
            var destSoundsPath = path.join(destPath, 'sounds');

            fs.mkdirSync(destPath);

            fs.copyFileSync(copyIndexPath, destIndexPath);
            fs.copyFileSync(copyDecixionPath, destDecixionPath);
            fs.copyFileSync(copyGamePath, destGamePath);
            fs.mkdirSync(destSoundsPath);

            console.log('Project created successfully.');
        }
    }
}
