const { crc32 } = require('crc');
const fs = require('fs');

const config = require('./config.json');
const path = config.output.path;

function checkCRC(name) {
    var value;
    const fd = fs.createReadStream(path + name);

    fd.on('data', _buff => {
        value = crc32(_buff, value);
    });
    fd.on('end', () => {
        var crc = value.toString(16).toUpperCase();
        if (crc.length < 8) { crc = '0' + crc };
        console.log('\n' + 'File: ' + name + '\n' + 'CRC: ' + crc);
        
        addCRC(name, crc);
        return;
    });
};

function addCRC(file, crc) {
    if (crc < 8 || file === undefined) { console.log('check your shit'); return; };
    fs.rename(path + file, path + file.split('.')[0] + ' [' + crc + '].' + file.split('.')[1], function(err) {
        if (err) { console.log (err); process.exit(); };
        console.log('Successfully added CRC32.');
        return;
    });
};

fs.readdir(path, function(err, items) {
    if (err) { console.log (err); process.exit(); };
    for (var i = 0; i < items.length; i++) {
        var regex = /\[[A-F0-9]{8}]/;
        if (items[i].match(regex) || !items[i].startsWith(config.output.name.slice(0, 25))) { 
            console.log('One or more files already have CRC32 or are invalid.'); 
            return; 
        };
        checkCRC(items[i]);
    };
});