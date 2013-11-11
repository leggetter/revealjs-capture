#!/usr/bin/env node

var path = require( 'path' );
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var program = require( 'commander' );

program
  .version( '0.0.2' )
  .option( '-s, --slides <url>', 'The url to the RevealJS slides' )
  .option( '-m, --max-captures [number]', 'The maximum number of slides to capture', -1 )
  .option( '-T, --slide-transition-wait [milliseconds]', 'The time to wait after a slide transition before capturing an image', 0 )
  .parse( process.argv );

var captureArgs = {
                    slides: program.slides,
                    maxCaptures: program.maxCaptures,
                    slideTransitionWait: program.slideTransitionWait
                  };
var captureArgsJson = JSON.stringify( captureArgs );
var childArgs = [
  path.join( __dirname, 'lib/revealjs-capture.js' ),
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
