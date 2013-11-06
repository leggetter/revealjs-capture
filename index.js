var path = require( 'path' );
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var program = require( 'commander' );

program
  .version('0.0.1')
  .option('-s, --slides <url>', 'The url to the RevealJS slides')
  .parse( process.argv );

var captureArgs = {
                    slides: program.slides
                  };
var captureArgsJson = JSON.stringify( captureArgs );
var childArgs = [
  path.join( __dirname, 'capture.js' ),
  captureArgsJson
];

console.log( 'Starting capture child process' );

var child = childProcess.execFile( binPath, childArgs, function( err, stdout, stderr ) {
  if( err ) {
    console.error( err );
  }
  else {
    console.log( 'Capture process complete' );
  }
} );

child.stdout.on('data', function() {
  console.log.apply( console, arguments );
} );
