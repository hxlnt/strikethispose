const socket = io();
let imgarray = [
    'https://hxlntblob.blob.core.windows.net/strikethispose/scoha1.jpg',
    'https://hxlntblob.blob.core.windows.net/strikethispose/scoha2.jpg',
    'https://hxlntblob.blob.core.windows.net/strikethispose/scoha3.jpg',
    'https://hxlntblob.blob.core.windows.net/strikethispose/scoha4.jpg',
    'https://hxlntblob.blob.core.windows.net/strikethispose/scoha6.jpg',
]
let targetimgurl = imgarray[0];
let targetFace = [];
let targetEmotion = [];
let incomingfaceurl = '';
let incomingFace = [];
let incomingEmotion = [];
var score = 0;
let yawdiff = 0;
let rolldiff = 0;
let neutraldiff = 0;

// Analyze the head position and emotion of the initial image
socket.emit('targetface', targetimgurl);
socket.emit('targetemotion', targetimgurl);

// When the results are returned, store them
socket.on('targetfaceresults', function (response) {
    if (response == '') {
        alert('Error! Make sure the second image has at least one face and is less than 4 MB.');
    }
    else { targetFace = response; }
});
socket.on('targetemotionresults', function (response) {
    if (response == '') {
        alert('Error! Make sure the second image has at least one face and is less than 4 MB.');
    }
    else { targetEmotion = response; }
});

// When the webcam photo results are returned, store them
socket.on('incomingemotionresults', function (response) {
    if (response == '') {
        alert("Oops! I couldn't find your face. Try again?");
        videoinit();
    }
    else { incomingEmotion = response; }
});
socket.on('incomingfaceresults', function (response) {
    if (response == '') {
        alert("Oops! I couldn't find your face. Try again?");
        videoinit();
    }
    else { incomingFace = response; }
});

// When all webcam photos are returned, get and display the score
socket.on('incomingallresults', function () {
    getScore();
});

// When gray square is clicked, initialize video
$('body').on('click', "#placeholder", videoinit);

// When retry button is clicked, reset video
$('body').on('click', '#retry', function(){
    $('.buttoncontainer').html('<button id="snap">Snap photo</button>');
    videoinit();
});

// When Snap photo button is clicked, draw video to canvas and send image to Cognitive Services
$('body').on('click', '#snap', function () {
    let video = document.getElementById('video');
    let videow = $('#video').width();
    let videoh = $('#video').height();
    document.getElementById('videocontainer').innerHTML = '<div class="flex-item" style="overflow:hidden; display:block; transform: scaleX(-1);"><canvas id="canvas" style="padding:0;"></canvas></div><div class="flex-item" style="background-image:url(' + targetimgurl + '); background-size: cover;"></div> <div class="flex-caption">Use your face...</div><div class="flex-caption">...to match this face!</div>'
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.height = $('.flex-item').height();
    canvas.width = $('.flex-item').width();
    context.translate(canvas.width, 0);
    context.scale(-1,1);
    context.drawImage(video, 0, 0, videow, videoh);
    incomingfaceurl = canvas.toDataURL("image/jpg", 0.8);
    context.translate(canvas.width, 0);
    context.scale(-1,1);
    context.drawImage(video, 0, 0, videow, videoh);
    socket.emit('incomingface', incomingfaceurl);
    socket.emit('incomingemotion', incomingfaceurl);
    document.getElementById('score').innerHTML = '<p class="message">Calculating...</p>';
    $('#badge').css( "opacity", "1" );
    $('#score').css( "opacity", "1" );
});

function videoinit () {
    $('#badge').css( "opacity", "0" );
    $('#score').css( "opacity", "0" );
    document.getElementById('videocontainer').innerHTML = '<div class="flex-item" style="overflow:hidden;display:block;transform: scaleX(-1);"><video id="video" autoplay style="min-width:40vw; min-height:40vh;"></video><canvas id="canvas"></canvas></div><div class="flex-item" style="background-image:url(' + targetimgurl + '); background-size: cover;"></div> <div class="flex-caption">Use your face...</div><div class="flex-caption">...to match this face!</div>'
    let video = document.getElementById('video');
    let videoh = $('.flex-item').height();
    let videow = $('.flex-item').width();
    
    // Get access to the camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, height: {min: videoh}}).then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            $('.buttoncontainer').css( "display", "block" );
        });
    }
    else { $('#videocontainer').html('<div class="flex-item" id="placeholder"><i class="fa fa-ban fa-3x" aria-hidden="true"></i><p>Sorry, this browser does not support the use of a webcam. :( Try Edge or Chrome.</p></div><div class="flex-item" style="background-image:url(https://hxlntblob.blob.core.windows.net/strikethispose/scoha1.jpg); background-size: cover;"></div><div class="flex-caption">Use your face...</div><div class="flex-caption">...to match this face!</div>'); }
}

function getScore() {
    var poiTarget = [
        targetFace[0].faceAttributes.headPose.roll,
        targetFace[0].faceAttributes.headPose.yaw,
        targetEmotion[0].scores.happiness,
        targetEmotion[0].scores.neutral
    ]
    var poiIncoming = [
        incomingFace[0].faceAttributes.headPose.roll,
        incomingFace[0].faceAttributes.headPose.yaw,
        incomingEmotion[0].scores.happiness,
        incomingEmotion[0].scores.neutral
    ];
    let rolldiff = Math.abs(poiTarget[0] - poiIncoming[0]);
    let yawdiff = Math.abs(poiTarget[1] - poiIncoming[1]);
    let happinessdiff = Math.abs(poiTarget[2] - poiIncoming[2]);
    let neutraldiff = Math.abs(poiTarget[3] - poiIncoming[3]);
    if (rolldiff <= 5) { score = score + 2 }
    else if (rolldiff > 5 && rolldiff <= 10) { score = score + 1.5 }
    else if (rolldiff > 10 && rolldiff <= 15) { score = score + 1 }
    else if (rolldiff > 15 && rolldiff <= 20) { score = score + 0.5 }
    console.log(`rolldiff: ${rolldiff}. Score so far: ${score}`);
    if (yawdiff <= 5) { score = score + 2 }
    else if (yawdiff > 5 && yawdiff <= 10) { score = score + 1.5 }
    else if (yawdiff > 10 && yawdiff <= 15) { score = score + 1 }
    else if (yawdiff > 15 && yawdiff <= 20) { score = score + 0.5 }
console.log(`yawdiff: ${yawdiff}. Score so far: ${score}`);
    if (happinessdiff <= .05) { score = score + 2 }
    else if (happinessdiff > .05 && happinessdiff <= .1) {score = score + 1.5}
    else if (happinessdiff > .1 && happinessdiff <= .15) {score = score + 1}
    else if (happinessdiff > .15 && happinessdiff < .2) {score = score + 0.5}
    console.log(`happinessdiff: ${happinessdiff}. Score so far: ${score}`);
    if (neutraldiff <= .05) { score = score + 2 }
    else if (neutraldiff > .05 && neutraldiff <= .1) {score = score + 1.5}
    else if (neutraldiff > .1 && neutraldiff <= .15) {score = score + 1}
    else if (neutraldiff > .15 && neutraldiff < .2) {score = score + .5} console.log(`neutraldiff: ${neutraldiff}. Score so far: ${score}`);

    score = Math.round(score / 8 * 100);

    console.log(`Original: ${JSON.stringify(poiTarget)}. Incoming: ${JSON.stringify(poiIncoming)}`);
    console.log(`Score: ${score}`);

    if (score <= 45) { message = 'Not even close.' }
    else if (score > 45 && score <= 65) { message = 'Uhh...' }
    else if (score > 65 && score <= 84) { message = 'Wow, nice!' }
    else if (score > 84 && score <= 95) { message = 'Amazing!' }
    else if (score > 95) { message = 'Whoa, legit.' }

    document.getElementById('score').innerHTML = score + '%<p class="message">' + message + '</p>';
    
    $('.buttoncontainer').html('<button id="retry">Try another?</button>');
    
    score = 0;
    yawdiff = 0;
    rolldiff = 0;
    neutraldiff = 0;

    imgarray.push(imgarray.shift());
    targetimgurl = imgarray[0];
    socket.emit('targetface', targetimgurl);
    socket.emit('targetemotion', targetimgurl);
}

function reloadPage() {
    //TODO
}
