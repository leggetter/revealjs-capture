// if (system.args.length === 1) {
//     console.log('Usage: loadspeed.js <some URL>');
//     phantom.exit();
// }
var path = require( 'path' );
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var childArgs = [
  path.join(__dirname, 'capture.js'),
  'some other argument (passed to phantomjs script)'
];

console.log( 'kicking off child process' );

var child = childProcess.execFile( binPath, childArgs, function( err, stdout, stderr ) {
  // handle results
  console.log( arguments );
} );

console.log( child );
