﻿async function start_video(src) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById(src);
            if (`srcObject` in video) {
                video.srcObject = stream;
            } else {
                video.src = window.URL.createObjectURL(stream);
            }
            video.onloadedmetadata = _ => video.play();

            video.style.visibility = `hidden`;

        } catch (err) {
            console.log(err)
        }
    }
}

function stop_video(src) {
    const video = document.getElementById(src);
    const stream = video.srcObject;

    if (stream) {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            track.stop();
        }

        video.srcObject = null;
    }
}
