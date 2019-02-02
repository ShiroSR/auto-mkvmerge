const fs = require('fs');
const { exec } = require('child_process');
const config = require('./config.json');

function zeroInt(int) {
    if (int < 10) {
        return '0' + int;
    } else {
        return int;
    };
};

function getFile(path, name) {
    return new Promise (resolve => {
        fs.readdir(path, function(err, items) {
            if (err) { console.log (err); process.exit(); };
            var file = items.filter(s => s.startsWith(name));
            resolve(file.toString());
        });
    });
};

function merge(params, output, input_1, input_2) {
    return new Promise (resolve => {
        console.log('merging files:\n    file1:  ' + input_1 + '\n    file2:  ' + input_2 + '\n    output: ' + output);
        var options = params.split(', ');
        var mkvmerge = exec('mkvmerge.exe ' + options[0] + ' "' + config.output.path + output + '" ' + options[1] + ' "' + config.input.first.path + input_1 + '" ' + options[2] + ' "' + config.input.second.path + input_2 + '"', function(err) {
            if (err) { console.log(err) };
        });
        mkvmerge.on('exit', code => {
            if (code === 0) {
                resolve(code);
            } else {
                console.log(code);
                process.exit();
            };
        });
    });
};

async function execute() {
    var ep_regex = /\%e/g;
    var tl_regex = /\%t/g;
    for (var i = parseInt(config.settings.first); i <= parseInt(config.settings.episodes); i++) {
        var output_file = config.output.name.replace(ep_regex, zeroInt(i));
        var parameters = config.settings.params.replace(tl_regex, '"' + output_file.slice(0, -4) + '"');
        var file_1 = await getFile(config.input.first.path, config.input.first.name.replace(ep_regex, zeroInt(i)));
        var file_2 = await getFile(config.input.second.path, config.input.second.name.replace(ep_regex, zeroInt(i)));

        await merge(parameters, output_file, file_1, file_2);
        console.log('successfully merged episode ' + zeroInt(i) + '.\n');
    };
    console.log('completed merging all episodes, exiting.');
    process.exit();
};

execute();