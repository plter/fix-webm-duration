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
        document.querySelector("#local-stream-player").srcObject = stream;
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