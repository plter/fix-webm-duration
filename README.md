# fix-webm-duration

`navigator.mediaDevices.getUserMedia` + `MediaRecorder` create WEBM files without duration metadata.

This library appends missing metadata section right to the file blob.

## Usage

The library contains only one script `fix-webm-duration.js` and has no dependencies.

Syntax:

```javascript
ysFixWebmDuration(blob, duration, callback);
```

where
- `blob` is `Blob` object with file contents from `MediaRecorder`
- `duration` is video duration in milliseconds (you should calculate it while recording the video)
- `callback` is callback function that will receive fixed blob

`ysFixWebmDuration` will parse and fix your file asynchronously and will call your callback once the result is ready.

If the original blob already contains duration metadata section and the duration value is not empty, the callback will receive it without any changes made.

Example:

```javascript
var mediaRecorder;
var mediaParts;
var startTime;

function startRecording(stream, options) {
    mediaParts = [];
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.onstop = function() {
        var duration = Date.now() - startTime;
        var buggyBlob = new Blob(mediaParts, { type: 'video/webm' });
        
        ysFixWebmDuration(buggyBlob, duration, function(fixedBlob) {
            displayResult(fixedBlob);
        });
    };
    mediaRecorder.ondataavailable = function(event) {
        var data = event.data;
        if (data && data.size > 0) {
            mediaParts.push(data);
        }
    };
    mediaRecorder.start();
    startTime = Date.now();
}

function stopRecording() {
    mediaRecorder.stop();
}

function displayResult(blob) {
    // ...
}
```

Note: this example **is not** a `MediaRecorder` usage guide.

## With webpack 

```javascript
// Type of webmBytes is Uint8Array or ByteBuffer
let webmfile = new WebmFile(webmBytes);
if (webmfile.fixDuration(duration)) {
    let blobWithDuration = webmfile.toBlob();
}
```

### Full example  

**index.html**  

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Record and play</title>
</head>

<body>
    <video width="480" height="360" controls id="player" autoplay></video>
    <div><button id="btnrecord">Record</button><button id="btnstop">Stop</button>
    </div>
    <script src="dist/main.js"></script>
</body>

</html>
```

**main.js**  

```javascript
import WebmFile from "../../../WebmFile"

(function () {
    let btnRecord = document.querySelector("#btnrecord");
    let btnStop = document.querySelector("#btnstop");
    let player = document.querySelector("#player");

    let videoUrl;
    let recorder;
    let recording = false;
    let recordedBlobs = [];
    let startTime = 0;

    function setRecording(value) {
        recording = value;

        btnStop.disabled = !value;
        btnRecord.disabled = value;
    }

    function ondataavailable_handler(e) {
        recordedBlobs.push(e.data);
    }

    async function recorder_stopHandler(e) {
        let duration = Date.now() - startTime;
        let webmBytes = await (new Blob(recordedBlobs, { type: 'video/webm' })).arrayBuffer();
        let webmfile = new WebmFile(webmBytes);
        if (webmfile.fixDuration(duration)) {
            if (videoUrl) {
                // release the pre url object
                URL.revokeObjectURL(videoUrl);
            }
            videoUrl = player.src = URL.createObjectURL(webmfile.toBlob());
        }
    }

    btnRecord.onclick = async function () {
        recordedBlobs.length = 0;

        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = ondataavailable_handler;
        recorder.onstop = recorder_stopHandler;
        recorder.start();
        startTime = Date.now();
        setRecording(true);
    }

    btnStop.onclick = async function () {
        if (recorder) {
            recorder.stop();
            setRecording(false);
            recorder = undefined;
        }
    }

    setRecording(false);
})();
```

**Use webpack to compile the source code**

```shell
webpack ./main.js
```

You can also checkout the example here [examples/fix-duration](examples/fix-duration)  
