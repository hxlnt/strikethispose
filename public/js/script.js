const socket = io();
let targetimgurl = './public/img/1.jpg';
let targetFace = [];
let targetEmotion = [];
let incomingfaceurl = '';
let incomingFace = [];
let incomingEmotion = [];
let score = 0;
let yawdiff = 0;
let rolldiff = 0;
let neutraldiff = 0;

// Analyze the head position and emotion of the initial image
socket.emit('targetface', targetimgurl);
socket.emit('targetemotion', targetimgurl);

// When the results are returned, store them
socket.on('targetfaceresults', function (response) {
    if (response == '') {
        alert('Error! Make sure your image has at least one face and is less than 4 MB.');
    }
    else { targetFace = response; }
});
socket.on('targetemotionresults', function (response) {
    if (response == '') {
        alert('Error! Make sure your image has at least one face and is less than 4 MB.');
    }
    else { targetEmotion = response; }
});

// When the webcam photo results are returned, store them
socket.on('incomingemotionresults', function (response) {
    if (response == '') {
        alert("Oops! I couldn't find your face. Try again?");
    }
    else { incomingEmotion = response; }
});
socket.on('incomingfaceresults', function (response) {
    if (response == '') {
        alert("Oops! I couldn't find your face. Try again?");
    }
    else { incomingFace = response; }
});

// When all webcam photos are returned, get and display the score
socket.on('incomingallresults', function () {
    getScore();
    $('#badge').css( "opacity", "1" );
    $('#score').css( "opacity", "1" );
});

$('body').on('click', "#placeholder", function () {
    document.getElementById('videocontainer').innerHTML = '<div class="flex-item" style="overflow:hidden;display:block;"><video id="video" autoplay style="transform: scaleX(-1);"></video><canvas id="canvas"></canvas></div><div class="flex-item" style="background-image:url(./img/1.jpg); transform: scaleX(-1);background-size: cover;"></div> <div class="flex-caption">Use your face...</div><div class="flex-caption">...to match this face!</div>'
    let video = document.getElementById('video');
    let videoh = $('.flex-item').height();
    let videow = $('.flex-item').width();
    
    // Get access to the camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, height: {max: videoh}, width: {min: videow} }).then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            $('.buttoncontainer').css( "display", "block" );
        });
    }
});

$('body').on('click', '#snap', function () {
    let video = document.getElementById('video');
    let videow = $('#video').width();
    document.getElementById('videocontainer').innerHTML = '<div class="flex-item" id="placeholder" style="overflow:hidden; display:block;"><canvas id="canvas" style="transform: scaleX(-1); padding:0;"></canvas></div><div class="flex-item" style="background-image:url(./img/1.jpg); transform: scaleX(-1);background-size: cover;"></div> <div class="flex-caption">Use your face...</div><div class="flex-caption">...to match this face!</div>'
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.height = $('.flex-item').height();
    canvas.width = $('.flex-item').width();
    let offset = parseInt(canvas.width) - parseInt(videow);
    context.drawImage(video, offset, 0);
    incomingfaceurl = canvas.toDataURL("image/jpg", 0.7);
    socket.emit('incomingface', incomingfaceurl);
    socket.emit('incomingemotion', incomingfaceurl);
});

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
    if (rolldiff <= 3) { score = score + 2 }
    else if (rolldiff > 3 && rolldiff <= 6) { score = score + 1.5 }
    else if (rolldiff > 6 && rolldiff <= 9) { score = score + 1 }
    else if (rolldiff > 9 && rolldiff <= 15) { score = score + 0.5 }
    console.log(`rolldiff: ${rolldiff}. Score so far: ${score}`);
    if (yawdiff <= 3) { score = score + 2 }
    else if (yawdiff > 3 && yawdiff <= 6) { score = score + 1.5 }
    else if (yawdiff > 6 && yawdiff <= 9) { score = score + 1 }
    else if (yawdiff > 9 && yawdiff <= 15) { score = score + 0.5 }
console.log(`yawdiff: ${yawdiff}. Score so far: ${score}`);
    if (happinessdiff <= .05) { score = score + 2 }
    else if (happinessdiff > .05 && happinessdiff <= .1) {score = score + 1.5}
    else if (happinessdiff > .1 && happinessdiff <= .15) {score = score + 1}
    else if (happinessdiff > .15 && happinessdiff < .2) {score = score + 0.5}
    console.log(`happinessdiff: ${happinessdiff}. Score so far: ${score}`);
    if (neutraldiff <= .05) { score = score + 1 }
    else if (neutraldiff > .05 && neutraldiff <= .1) {score = score + .75}
    else if (neutraldiff > .1 && neutraldiff <= .15) {score = score + .5}
    else if (neutraldiff > .15 && neutraldiff < .2) {score = score + .25} console.log(`neutraldiff: ${neutraldiff}. Score so far: ${score}`);

    score = Math.round(score / 7 * 100);

    console.log(`Original: ${JSON.stringify(poiTarget)}. Incoming: ${JSON.stringify(poiIncoming)}`);
    console.log(`Score: ${score}`);

    if (score <= 45) { message = 'Not even close.' }
    else if (score > 45 && score <= 65) { message = '*Squints* Uhh...' }
    else if (score > 65 && score <= 84) { message = 'Wow, nicely done!' }
    else if (score > 84 && score <= 95) { message = 'Amazing match!' }
    else if (score > 95) { message = 'Whoa, legit.' }

    document.getElementById('score').innerHTML = score + '%<p class="message">' + message + '</p>';

}

function reloadPage() {
    //TODO
}
