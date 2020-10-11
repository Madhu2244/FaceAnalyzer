// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 640;
var height = 480;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Audio
var audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();

//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}


function playAudio() {
  audio.play();
}

function pauseAudio() {
  audio.pause();
}
//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
    //var audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    //audio.play();

  }
  log('#logs', "Clicked the start button");
}

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  pauseAudio();
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    pauseAudio();
    detector.stop();
  }
};

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();
    pauseAudio();
    $('#results').html("");
    
  }
};

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
//var audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');
var currentDistractionTime = 0;
var timesPlayed = 0;
var totalDistractionTime = 0;
var timeLastUpdated = 0;
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  $('#results').html("");
  
  var mod = timestamp % 60;
  log('#results', "Timestamp: " + Math.floor(timestamp / 60) + ":" + Math.floor(mod));
  log('#results', "Distraction Time: " + (Math.floor(currentDistractionTime)));
  log('#results', "Times Played: " + timesPlayed);
  log('#results', "Totoal Distraction Time: " + (Math.floor(totalDistractionTime)));
	var currentTime = timestamp;
	
  if (faces.length == 0) 
  {
    if(timestamp-timeLastUpdated > 0.99)
    {
    	currentDistractionTime = currentDistractionTime + 1;
      totalDistractionTime = totalDistractionTime + 1;
      timeLastUpdated = timestamp;
    }
    if(currentDistractionTime == 5)
    {
    	audio.play();
      timesPlayed = timesPlayed +1;
      currentDistractionTime = currentDistractionTime + .0000000001;
    }
    log('#results', "FACE NOT DETECTED");
  }
  if (faces.length > 0) {
  	//totalDistractionTime = totalDistractionTime + currentDistractionTime;
  	currentDistractionTime = 0;
    audio.pause();
    log('#results', "Face Detected!");

    log('#results', JSON.stringify(faces[0].emotions, function(key, val) {
      if (val.sadness < 20)

        return 'Happy!';
      else if (val.sadness < 50)
        return "Meh";
      else
        return "Sad!";
      //return "Mood: " + Math.round(val.joy); 
      //val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      if (val.attention < 20) {
        return "Pay Attention!";
      } else if (val.attention < 50)
        return "Chipper up";
      else
        return "Attentive!";
    }));
  }
});

//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();

  }
}
