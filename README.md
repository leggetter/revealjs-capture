# Reveal.js Slides Image Capture

The purpose of this is to make it easy to capture each slide from a [reveal.js](https://github.com/hakimel/reveal.js) presentation as an image in an automated way. These images can then be used in any presenatation write-up.

* [Example 1](http://www.leggetter.co.uk/2013/10/28/history-background-benefits-use-cases-realtime.html)
* [Example 2](http://www.leggetter.co.uk/2013/10/31/fundamentals-realtime-web-realtime-web-functionality.html)

Or you can take the images and create a PDF from the output. Here's an example created by [Robin Hawkes](https://twitter.com/robhawkes):

* [ViziCities: Making SimCity for the Real World](http://www.slideshare.net/robhawkes/vizicities-making-simcity-for-the-real-world)

*Note: Robin had to use a [custom version of PhantomJS to support Web Fonts](https://github.com/ariya/phantomjs/issues/10592#issuecomment-34111576)*

## Install

You can install globally using:

    npm install -g revealjs-capture

This adds the `revealjs-capture` executable to your `PATH`.

## Capture

You can then capture an image for each slide in your reveal.js presentation using:

    revealjs-capture -s <slides_url>

Example:

    revealjs-capture -s http://leggetter.github.io/talks/realtime-tech-stack

## Release History

### 0.0.3

* Added `-o, --output` flag to allow the output location of the rendered slide captutes to be configured

### 0.0.2

* Hide navigation elements on slides
* Refactor to be more OO

## Todo

* Add resource load detection for each slide and only capture image when all resources are loaded
* Make it possible to capture only certain slide indices e.g. `revealjs-capture <url> --indices [ [5,5], [10.1] ]` (or something similar)
