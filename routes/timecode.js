
const express = require('express');
const timecodeRouter = express.Router();
const Timecode = require('smpte-timecode');
const Promise = require('bluebird');

/**
 * GET /timecodevalue 
 * Returns the timecodevalues
 * @param {string | integer} timeCodeValue 
 * @param {integer} frameRate 
 */
var returnTimeCode = (timeCodeValue, frameRate, oldOutputMessages) => {
  let errorMessage  = 'Please enter a numerical value or proper timecode e.g \'00:00:00:00\'';
  let outputMessages = [];
  console.log('oldOutputMessages: ', oldOutputMessages );
  if(oldOutputMessages) {
    oldOutputMessages.forEach(oldMessage => {
      outputMessages.push(oldMessage);
    });
  }

  if (!timeCodeValue || !frameRate ) {
    throw new Error('No timecode or framerate Entered');
  }
  else {

    let intFrameRate = parseInt(frameRate);
    let intTimeCodeValue = parseInt(timeCodeValue);

    let timeCodeIsNumeric = (Number.isInteger(intTimeCodeValue));
    
    let frameRateIsNotNumeric = (Number.isInteger(intFrameRate));
    let outputMessage = {}
    outputMessage.input = timeCodeValue;

    if (frameRateIsNotNumeric) { 
      if (timeCodeIsNumeric && (intTimeCodeValue !== 0)) {
        let timeCodeObject = new Timecode(intTimeCodeValue, intFrameRate, false);
        
        outputMessage.output = timeCodeObject.toString();
        outputMessages.push(outputMessage);
      }
      else {
        let timeCodeObject = new Timecode(timeCodeValue, intFrameRate, false);
        let matchedValues = timeCodeValue.match(/:/g);

        //if the timeCode was properly entered
        if ( matchedValues.length === 3 ) {
          outputMessage.output = timeCodeObject.frameCount;
          outputMessages.push(outputMessage);
        }
        else {
          //throw an error
          throw new Error(errorMessage);
        }
      }
    } else {
      throw new Error('FrameRate is Not Numeric');
    }
  }
  return outputMessages;
}

/**
 * POST /timecode 
 * Returns the Output Page with printed output
 */
timecodeRouter.post('/', function(req, res, next) {
  
  let timeCodeValue = req.body.timecodeValue;
  let frameRateValue = req.body.frameRate;
  let oldOutputMessagesArray = JSON.parse('[' + req.body.timeCodes + ']');
  let oldOutputMessages = oldOutputMessagesArray[0];
  
  Promise.all([returnTimeCode(timeCodeValue, frameRateValue, oldOutputMessages)]).spread((timeCodes) => {
    res.render('timecode', { 
      title: 'Timecode Outputs',
      timeCodes: timeCodes
    });
  });
});

/**
 * GET /timecode 
 * Returns the Output with form input
 */
timecodeRouter.get('/', function(req, res, next) {
  res.render('timecode', { 
    title: 'Timecode Outputs',
    timeCodes: null
  });
});
module.exports = timecodeRouter;