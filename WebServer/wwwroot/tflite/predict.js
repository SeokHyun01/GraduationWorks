let model_name = "none";
let intervalId;
let FPS = 15;
let frameInterval = 1000 / FPS;

let video;
let canvas;
let flippedCanvas;

let boxes = [];
let kepts = [];

let prev_image_time;
let send_interval = 500;
let isSend = false;

// 좌우 반전 추가한 detect
function detect() {
    video = document.querySelector("video");
    canvas = document.querySelector("canvas");
    flippedCanvas = document.createElement("canvas");
    video.addEventListener("play", predict);
}

function predict() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    flippedCanvas.width = video.videoWidth;
    flippedCanvas.height = video.videoHeight;
    boxes = [];
    kepts = [];
   
    function renderFrame() {
        const flippedCtx = flippedCanvas.getContext("2d", { willReadFrequently: true });
        flippedCtx.scale(-1, 1);
        flippedCtx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(flippedCanvas, 0, 0, canvas.width, canvas.height);

        if (model_name == "face" && boxes.length > 0) draw_blur(ctx, boxes);

        // 이미지 전송하는지 확인
        getSend();

        // 이벤트 토픽 전송
        // if (client != null && client.isConnected()) sendImage(canvas);
        if (isSend && client != null && client.isConnected()) sendEvent(canvas);


        // 현재 시간 표시
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(new Date().toLocaleTimeString(), canvas.width - 140, 30);
        // boxes와 kepts를 그리기
        if (boxes.length > 0) draw_boxes(ctx, boxes);
        if (kepts.length > 0) draw_keypoints(ctx, kepts);

        // 이미지 토픽 전송
        if(isSend && client != null && client.isConnected()) sendImage(canvas);

        const input = tf.tidy(() => { return preprocess_input(canvas); });

        // tflite 224x224x3 70ms -> 14FPS
        // const start = performance.now();
        if (model_name == "coco" || model_name == "fire" || model_name == "face" || model_name == "pose") {
            inference(input, model_name).then(output => {
                // const end = performance.now();

                if (output == null) return;

                const outputArray = output.arraySync()[0].flat();
                if (model_name == "pose") {
                    const boxes_and_kepts = process_output_pose(outputArray, canvas.width, canvas.height);
                    boxes = boxes_and_kepts[0];
                    kepts = boxes_and_kepts[1];
                } else {
                    boxes = process_output(outputArray, canvas.width, canvas.height, model_name);
                }
                output.dispose();
            });

            // motion 감지 할 때
        } else if (model_name == "motion") {
            boxes = motion_detect(input, canvas.width, canvas.height)
        }
    }
    intervalId = setInterval(renderFrame, frameInterval);
}

function getSend(){
    if (prev_image_time == null) prev_image_time = new Date().getTime();

    const now_time = new Date().getTime();
    
    if (now_time - prev_image_time > send_interval) {
        prev_image_time = now_time;
        isSend = true;
    } else {
        isSend = false;
    }
}

function sendImage(canvas) {
    // if (prev_image_time == null) prev_image_time = new Date().getTime();

    // const now_time = new Date().getTime();
    
    // if (now_time - prev_image_time > send_interval) {
    //     prev_image_time = now_time;
    // } else {
    //     return;
    // }

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const data = {};
    data["Image"] = imgData;
    data["Id"] = camera_id;

    send_mqtt(JSON.stringify(data), TOPIC_IMAGE);

    // if ((model_name == "fire" || model_name == "coco") && boxes.length > 0) {
    //     // Id 제거 
    //     delete data["Id"];

    //     data["Date"] = get_date();
    //     data["UserId"] = user_id;
    //     data["CameraId"] = camera_id;
    //     data["Model"] = model_name;

    //     send_mqtt(JSON.stringify(data), TOPIC_EVENT);
    // }
}

function sendEvent(canvas){
    if ((model_name == "fire" || model_name == "coco") && boxes.length > 0) {
        const imgData = canvas.toDataURL("image/jpeg", 0.7);
        const data = {};
        data["Image"] = imgData;
        data["Date"] = get_date();
        data["UserId"] = user_id;
        data["CameraId"] = camera_id;
        data["Model"] = model_name;

        send_mqtt(JSON.stringify(data), TOPIC_EVENT);
        console.log("send event");
    }
}

function unload() {
    if (intervalId) {
        clearTimeout(intervalId);
    }
    disconncet_mqtt();
}

function change_model(name) {
    stop_detect(true);

    model_name = name;
    start_video("video", 'none');
    detect();
    // mqtt(user_id, camera_id);
}

function stop_detect(isChangeModel = false) {
    stop_video("video");
    video.removeEventListener("play", predict);
    if (isChangeModel && intervalId) clearTimeout(intervalId); 
    else unload();
    
    tf.disposeVariables();

    // 캔버스는 내용을 지우고 flipped 캔버스는 삭제
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flippedCanvas.remove();
}

function get_date() {
    //yyyy-MM-ddThh:mm:ss
    const date = new Date();
    const year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();
    if (month.length == 1) month = "0" + month;
    if (day.length == 1) day = "0" + day;
    if (hour.length == 1) hour = "0" + hour;
    if (minute.length == 1) minute = "0" + minute;
    if (second.length == 1) second = "0" + second;

    return year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
}

function start_rtc() {
    stop_detect();
    start_video('video');
}

function stop_rtc() {
    if (model_name == null) {
        model_name = 'none';
    }
    stop_video('video');
    start_video('video', 'none');
    detect();
    mqtt(user_id, camera_id);
}
