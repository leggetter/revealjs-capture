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

if( !captureArgs.slides ) {
  log( 'slide parameter for URL reveal.js slides is required.' );
  phantom.exit();
}

var slidesUrl = captureArgs.slides;

var page = require('webpage').create();
var next = null;
var isLastSlide = null;

page.viewportSize = { width: 1600, height: 1200 };

log( 'opening page: ', slidesUrl );

var captureCount = 0;
var pageResourceCount = 0;
var loadFinished = false;
page.onLoadFinished = function() {

  if( loadFinished ) {
    log( '2nd load detected. Ignoring.');
    return;
  }
  loadFinished = true;

  log( 'loadFinished' );

  var revealExists = page.evaluate( function() {
    return ( typeof Reveal === 'object' );
  } );

  if( !revealExists ) {
    log( 'A Reveal object cannot be detected on', slidesUrl, 'Aborting capture.' );
    phantom.exit();
  }

  log( 'waiting 10 seconds after initial load' );
  // Give assets that load after the actual page load time to load
  // TODO: detect this properly i.e. don't use a setTimeout
  setTimeout( startCapture, 10000 );
};

function startCapture() {
  configureReveal();

  setGlobals();
  
  capturePage();
}

function configureReveal() {
  // from: http://stefaanlippens.net/phantomjs-revealjs-slide-capture
  page.evaluate(function() {
    Reveal.configure({
      'controls': false
    });

    // Apparently setting "transition" and "backgroundTransition" to "none"
    // is enough to disable slide transitions, even if there are per-slide transitions.
    Reveal.configure({
      'transition': 'none',
      'backgroundTransition': 'none'
    });
  });
}

function setGlobals() {
  isLastSlide = function() {
    return page.evaluate(function() {
      return Reveal.isLastSlide();
    });
  };
  next = function() {
    return page.evaluate(function() {
      return Reveal.next();
    });
  };
}

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

  if( !isLastSlide() ) {
    next();
  }
  else {
    phantom.exit();
  }
}

function log() {
  console.log.apply( console, arguments );
}