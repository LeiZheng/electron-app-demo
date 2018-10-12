// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var width = 320;    // We will scale the photo width to this
var height = 0;     // This will be computed based on the input stream

var streaming = false;

var video = null;
var canvas = null;
var photo = null;
var startbutton = null;
var output = null;
var clearbutton = null;
var loadfromcarema = null;
let loadfromurl = null;
let btnSave = null;
let btnRecord = null;
let localStream;
let recorder;
let recordChunk = [];
let recordurl ;
const { remote: { dialog } } = require('electron');
const fs = require('fs');
let processor = null;
DidComponentReady();

function loadFromURL(){
    video.src = "http://vjs.zencdn.net/v/oceans.mp4";
    recordurl = video.src;
    video.play();

}


function loadFromCamera(){
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) {
            video.srcObject = stream;
            localStream = stream;
            video.play();
        }).catch(function() {
        alert('could not connect stream');
    });
}

function initListeners() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    output = document.getElementById('output');
    clearbutton = document.getElementById('clearbutton');
    loadfromcarema = document.getElementById('loadfromcarema');
    loadfromurl = document.getElementById('loadfromurl');
    btnRecord = document.getElementById('btnRecord');
    btnSave = document.getElementById('btnSave');

    video.addEventListener('canplay', function(ev){
        localStream = video.srcObject;
        processor.doLoad();
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth/width);

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    startbutton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false);
    clearbutton.addEventListener('click', function(ev){
        clearphoto();
        ev.preventDefault();
    }, false);

    loadfromcarema.addEventListener('click', function(ev){
        loadFromCamera();
        ev.preventDefault();
    }, false);
    loadfromurl.addEventListener('click', function(ev){
        loadFromURL();
        ev.preventDefault();
    }, false);
    btnRecord.onclick = function() {
        if (this.textContent === 'Record Start') {
            recorder = new MediaRecorder(localStream, {mimeType : 'video/webm;codecs=h264'});
            console.log(recorder.state);
            console.log("recorder started");
            recorder.ondataavailable = function(e)  {
                recordChunk.push(e.data);
            };

            recordChunk = [];
            dlLink.style.display = 'none';
            btnSave.style.display = 'none';
            recorder.start();
            this.textContent = 'Record Stop';
        } else {
            recorder.stop();
            recorder.onstop = function(e) {
                console.log(recorder.state);
                console.log("recorder stop");
                let blob = new Blob(recordChunk, {type:'video/mp4'});
                let dlURL = URL.createObjectURL(blob);
                dlLink.href = dlURL;
                let dt = new Date();
                dlLink.download = `rec_${[dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()].map(val => ('0' + val).slice(-2))}.mp4`;
                dlLink.style.display = '';
                btnSave.style.display = '';
                btnRecord.textContent = 'Record Start';
            }
        }
    };

    btnSave.onclick = _ => {
        const blob = new Blob(recordChunk);
        let fr = new FileReader();
        fr.onload = _ => {
            showSaveDialog(fr.result);
        }
        fr.readAsArrayBuffer(blob);
    }
    processor =  {
        timerCallback: function() {
            if (this.video.paused || this.video.ended) {
                return;
            }
            this.computeFrame();
            var self = this;
            setTimeout(function () {
                self.timerCallback();
            }, 16); // roughly 60 frames per second
        },

        doLoad: function() {
            this.video = document.getElementById("video");
            this.c1 = document.getElementById("canvas2");
            this.ctx1 = this.c1.getContext("2d");
            var self = this;

            this.video.addEventListener("play", function() {
                self.width = self.video.width;
                self.height = self.video.height;
                self.timerCallback();
            }, false);
        },

        computeFrame: function() {
            this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
            var frame = this.ctx1.getImageData(0, 0, this.width, this.height);
            var l = frame.data.length / 4;

            for (var i = 0; i < l; i++) {
                var grey = (frame.data[i * 4 + 0] + frame.data[i * 4 + 1] + frame.data[i * 4 + 2]) / 3;

                frame.data[i * 4 + 0] = grey;
                frame.data[i * 4 + 1] = grey;
                frame.data[i * 4 + 2] = grey;
            }
            this.ctx1.putImageData(frame, 0, 0);
            this.ctx1.fillText("" + this.video.currentTime, 30, 30);
            this.ctx1.fillRect((this.video.currentTime * 10 )%this.video.width, (this.video.currentTime * 10 )%this.video.height, 20, 20);
            return;
        }
    };

}


function DidComponentReady() {

    initListeners();
    loadFromCamera();
    clearphoto();

}
function onStartClick(e){
    alert("start");
}

function onEndClick(e) {
    alert("end");
}

function onTakePhoto(e) {

}

function clearphoto() {
    output.innerHTML = '';
    /*
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
    */
}
function takepicture() {
    let context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        context.fillStyle = 'orange';
        context.fillText(video.currentTime, 20, 20);
        const data = canvas.toDataURL('image/png');
        const photo = document.createElement("IMG");
        photo.setAttribute('src', data);
        output.append(photo);
    } else {
        clearphoto();
    }
}


function showSaveDialog(arrayBuffer) {
    let buffer = new Buffer(arrayBuffer);
    let dt = new Date();
    dialog.showSaveDialog({
        filters: [{
            name: `webm file`,
            extensions: ['webm']
        }]
    }, fileName => {
        if (fileName) {
            fs.writeFile(fileName, buffer, function(err) {
                if (err) {
                    alert("An error ocurred creating the file " + err.message);
                }
            });
        }
    });
}


