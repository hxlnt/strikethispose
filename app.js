var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.port || 3002;
var oxford = require('project-oxford');
var client = new oxford.Client(process.env.facekey, 'westus');
var emoclient = new oxford.Client(process.env.emokey, 'westus');


var targetresultsreturned = 0;
var incomingresultsreturned = 0;

server.listen(port);
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    socket.on('targetface', function (targetimgurl) {
        console.log('face url: ' + targetimgurl);
        client.face.detect({
            url: targetimgurl,
            analyzesHeadPose: true
        }).then(function (response) {
            socket.emit('targetfaceresults', response);
            targetresultsreturned++;
            if (targetresultsreturned == 2) { 
                socket.emit('targetallresults'); 
                targetresultsreturned = 0;
                console.log(`Target image analysis complete`);
            }
        });
        emoclient.emotion.analyzeEmotion({ 
            url: targetimgurl
        }).then(function (response) {
            socket.emit('targetemotionresults', response);
            targetresultsreturned++;
            if (targetresultsreturned == 2) { 
                socket.emit('targetallresults'); 
                targetresultsreturned = 0;
                console.log(`Target image analysis complete`);
            }
        });
    });

    socket.on('incomingface', function (incomingfaceurl) {
        client.face.detect({
            data: oxford.makeBuffer(incomingfaceurl),
            analyzesHeadPose: true
        }).then(function (response) {
            socket.emit('incomingfaceresults', response);
            console.log(`Webcam image head pose results returned.`);
            incomingresultsreturned++;
            if (incomingresultsreturned == 2) { 
                socket.emit('incomingallresults'); 
                incomingresultsreturned = 0;
            }
        });
        emoclient.emotion.analyzeEmotion({ 
            data: oxford.makeBuffer(incomingfaceurl) 
        }).then(function (response) {
            socket.emit('incomingemotionresults', response);
            console.log(`Webcam image emotion results returned.`);
            incomingresultsreturned++;
            if (incomingresultsreturned == 2) { 
                socket.emit('incomingallresults'); 
                incomingresultsreturned = 0;
            }
        });
    });
});
