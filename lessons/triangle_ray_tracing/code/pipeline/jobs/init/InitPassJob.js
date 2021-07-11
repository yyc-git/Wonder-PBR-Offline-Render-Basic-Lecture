import WebGPU from "wonder-webgpu";
import { getWebGPU, setPass } from "../../../data/Repo.js"

let _buildPixelBufferData = (window, device) => {
    let bufferSize =
        window.width *
        window.height *
        4 *
        Float32Array.BYTES_PER_ELEMENT;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE
    });

    return [buffer, bufferSize];
}


export let exec = () => {
    let { device, window } = getWebGPU();

    setPass({
        pixelBufferData: _buildPixelBufferData(window, device)
    });
}