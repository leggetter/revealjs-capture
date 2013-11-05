console.log( 'in capture.js' );

var page = require('webpage').create();

page.viewportSize = { width: 1600, height: 1200 };

var pageToLoad = 'http://leggetter.github.io/talks/realtime-tech-stack/';

console.log( 'opening page: ', pageToLoad );

var captureCount = 0;
page.onLoadFinished = function() {

  console.log( 'loadFinished' );

  console.log( 'waiting 10 seconds after intial load' );
  setTimeout( capturePage, 10000 );
};

page.onResourceRequested = function() {
  console.log( 'resourceRequested' );
  printArgs.apply( this, arguments );
}

page.onUrlChanged = function() {
  if( captureCount > 0 ) {
    setTimeout( capturePage, 5000 );
  }
};

page.open( pageToLoad, function () {
  console.log( 'loaded: ', pageToLoad );
} );

function capturePage() {
  console.log( 'capturing page' );
  var slideIndices = page.evaluate( function() {
    return Reveal.getIndices();
  } );
  page.render('slide-' + slideIndices.h + '-' + slideIndices.v + '.png');

  ++captureCount;

  console.log( 'captured ', captureCount, ' pages' );

  var isLastSlide = page.evaluate( function() {
    return Reveal.isLastSlide();
  } );

  console.log( 'last slide? ', isLastSlide );

  if( !isLastSlide ) {
    page.evaluate( function() {
      Reveal.next();
    } );
  }
  else {
    phantom.exit();
  }
}

function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
    console.log("");
}