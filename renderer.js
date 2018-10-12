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
DidComponentReady();

function loadFromURL(){
    video.src = "http://vjs.zencdn.net/v/oceans.mp4";
    video.play();

}


function loadFromCamera(){
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) {
            video.src = URL.createObjectURL(stream);
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
    video.addEventListener('canplay', function(ev){
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
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        context.fillStyle = 'orange';
        context.fillText(video.currentTime, 20, 20);
        var data = canvas.toDataURL('image/png');
        var photo = document.createElement("IMG");
        photo.setAttribute('src', data);
        output.append(photo);
    } else {
        clearphoto();
    }
}