"use strict";

var system = require( 'system' );
var phantom = ( typeof phantom !== 'undefined' ? phantom : null );

if( phantom === null ) {
  throw new Error( 'Script must be run using phantomjs runtime' );
}

var Reveal = null; // simply here to stop jshint complaining

function log() {
  console.log.apply( console, arguments );
}

/**
 * RevealJS capture definition
 */
function RevealJsCapture( options ) {
  this.options = options;
  this.options.maxCaptures = parseInt( this.options.maxCaptures, 10 );
  this.options.slideTransitionWait = parseInt( this.options.slideTransitionWait, 10 );

  if( this.options.output &&
      this.options.output.lastIndexOf( '/' ) !== ( this.options.output.length - 1 ) ) {
    this.options.output += '/';
  }

  log( "Capturing with options", JSON.stringify( this.options ) );

  this.captureCount = 0;
  this.pageResourceCount = 0;
  this.loadFinished = false;

  this._next = null;
  this._isLastSlide = null;
  this._getSlideIndices = null;

  this.page = require('webpage').create();

  this.page.viewportSize = { width: 1600, height: 1200 };

  var self = this;

  this.page.onLoadFinished = function() { self._onLoadFinished.apply( self, arguments ); };
  this.page.onUrlChanged = function() { self._onUrlChanged.apply( self, arguments ); };
  this.page.onResourceRequested = function() { self._onResourceRequested.apply( self, arguments ); };

  if( this.options.slides ) {
    this.open( this.options.slides );
  }
}

RevealJsCapture.prototype._onLoadFinished = function() {  
  if( this.loadFinished ) {
    log( '2nd load detected. Ignoring.');
    return;
  }
  this.loadFinished = true;

  var revealExists = this.page.evaluate( function() {
    return ( typeof Reveal === 'object' );
  } );

  if( !revealExists ) {
    log( 'A Reveal object cannot be detected on', this.options.slides, 'Aborting capture.' );
    phantom.exit();
  }

  log( 'waiting 10 seconds after initial load' );
  // Give assets that load after the actual page load time to load
  // TODO: detect this properly i.e. don't use a setTimeout
  var self = this;
  setTimeout( function() {
    self._startCapture.apply( self, arguments );
  }, 10000 );
};

RevealJsCapture.prototype._startCapture = function() {
  this._configureReveal();

  this._setGlobals();
  
  this._capturePage();
};

RevealJsCapture.prototype._configureReveal = function() {
  // from: http://stefaanlippens.net/phantomjs-revealjs-slide-capture
  this.page.evaluate(function() {
    Reveal.configure({
      'controls': false
    });

    // Apparently setting "transition" and "backgroundTransition" to "none"
    // is enough to disable slide transitions, even if there are per-slide transitions.
    Reveal.configure({
      'transition': 'none',
      'backgroundTransition': 'none'
    });

    // Disable transitions on "fragmented views".
    var fragments = document.getElementsByClassName('fragment');
    for (var f = fragments.length - 1; f >= 0; f--) {
      fragments[f].classList.remove('fragment');
    }
  });
};

RevealJsCapture.prototype._setGlobals = function() {
  this._isLastSlide = function() {
    return this.page.evaluate( function() {
      return Reveal.isLastSlide();
    } );
  };

  this._next = function() {
    return this.page.evaluate(function() {
      return Reveal.next();
    });
  };

  this._getSlideIndices = function() {
    this.page.evaluate( function() {
      return Reveal.getIndices();
    } );
  };
};

RevealJsCapture.prototype._capturePage = function() {
  var slideIndices = this.page.evaluate( function() {
    return Reveal.getIndices();
  } );
  this.page.render(this.options.output + 'slide-' + slideIndices.h + '-' + slideIndices.v + '.png');

  ++this.captureCount;

  log( 'captured ', this.captureCount, ' pages' );

  if( this.options.maxCaptures === this.captureCount ||
      this._isLastSlide() ) {
    phantom.exit();
  }
  else {
    this._next();
  }
};

RevealJsCapture.prototype._onUrlChanged = function() {
  this.pageResourceCount = 0;
  if( this.captureCount > 0 ) {
    var self = this;
    setTimeout( function() {
      self._capturePage.apply( self, arguments );
    }, this.options.slideTransitionWait );
  }
};

RevealJsCapture.prototype.open = function( slides ) {
  this.page.open( slides, function( status ) {
    if( status === 'success' ) {
      log( 'loaded: ', slides );
    }
    else {
      log( 'error loading', slides, 'Exiting.');
      phantom.exit();
    }
  } );
};

RevealJsCapture.prototype._onResourceRequested = function() {
  ++this.pageResourceCount;
};

// Application
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

var capture = new RevealJsCapture( captureArgs );