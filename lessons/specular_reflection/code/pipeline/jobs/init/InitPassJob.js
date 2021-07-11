import WebGPU from "wonder-webgpu";
import { getWebGPU, getPass, setPass } from "../../../data/Repo.js"
import { getWindowSize } from "../utils/SizeUtils.js";

let _buildPixelBufferData = (window, device) => {
    let [width, height] = getWindowSize(window);
    let bufferSize =
        width *
        height *
        4 *
        Float32Array.BYTES_PER_ELEMENT;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_SRC
    });

    return [buffer, bufferSize];
}

let _buildResolutionBufferData = (window, device) => {
    let bufferData = new Float32Array([
        window.width,
        window.height
    ]);
    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.UNIFORM | WebGPU.GPUBufferUsage.COPY_DST
    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferData];
}

let _buildCommonDataBufferData = device => {
    let sampleCountPerPixel = 4;
    let totalSampleCount = getPass().frameIndex + 1;

    let bufferData = new Uint32Array([
        sampleCountPerPixel,
        totalSampleCount,
        0,
        0
    ]);
    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.UNIFORM | WebGPU.GPUBufferUsage.COPY_DST
    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferData];
}

export let exec = () => {
    let { device, window } = getWebGPU();

    setPass({
        frameIndex: 0,
        commonDataBufferData: _buildCommonDataBufferData(device),
        pixelBufferData: _buildPixelBufferData(window, device),
        resolutionBufferData: _buildResolutionBufferData(window, device)
    });
}