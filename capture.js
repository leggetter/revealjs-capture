log( 'Capturing...' );

var system = require( 'system' );

var args = system.args;
if( !args[ 1 ] ) {
  log( 'Missing required capture arguments' );
  phantom.exit();
}

var captureArgsJson = args[ 1 ];
log( 'captureArgsJson', captureArgsJson );

var captureArgs = JSON.parse( captureArgsJson );

var slidesUrl = captureArgs.slides;

var page = require('webpage').create();

page.viewportSize = { width: 1600, height: 1200 };

log( 'opening page: ', slidesUrl );

var captureCount = 0;
var pageResourceCount = 0;
page.onLoadFinished = function() {

  log( 'loadFinished' );

  log( 'waiting 10 seconds after initial load' );
  setTimeout( capturePage, 10000 );
};

page.onResourceRequested = function() {
  ++pageResourceCount;
  // log( 'loaded', pageResourceCount, 'resources' );
}

page.onUrlChanged = function() {
  pageResourceCount = 0;
  if( captureCount > 0 ) {
    setTimeout( capturePage, 5000 );
  }
};

page.open( slidesUrl, function () {
  log( 'loaded: ', slidesUrl );
} );

function capturePage() {
  log( 'capturing page' );
  var slideIndices = page.evaluate( function() {
    return Reveal.getIndices();
  } );
  page.render('slide-' + slideIndices.h + '-' + slideIndices.v + '.png');

  ++captureCount;

  log( 'captured ', captureCount, ' pages' );

  var isLastSlide = page.evaluate( function() {
    return Reveal.isLastSlide();
  } );

  if( !isLastSlide ) {
    page.evaluate( function() {
      Reveal.next();
    } );
  }
  else {
    phantom.exit();
  }
}

function log() {
  console.log.apply( console, arguments );
}