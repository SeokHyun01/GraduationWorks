﻿importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

let busy = false;

onmessage = async event => {
    if (busy) {
        return;
    }

    busy = true;
    const { input, now, image } = event.data;
    const output = await run_model(input);
    postMessage({ output, now, image });
    busy = false;
}

async function run_model(input) {
    const model = await ort.InferenceSession.create('./models/yolov8n.onnx');
    input = new ort.Tensor(Float32Array.from(input), [1, 3, 640, 640]);
    const outputs = await model.run({ images: input });
    return outputs['output0'].data;
}
