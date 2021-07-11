import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getPass, setScreenPass, getWebGPU } from "../../../data/Repo.js";

export let exec = () => {
    let { device, swapChainFormat } = getWebGPU();

    let bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: WebGPU.GPUShaderStage.FRAGMENT,
                type: "storage-buffer"
            },
            {
                binding: 1,
                visibility: WebGPU.GPUShaderStage.FRAGMENT,
                type: "uniform-buffer"
            }
        ]
    });

    let { pixelBufferData, resolutionBufferData } = getPass();
    let [pixelBuffer, pixelBufferSize] = pixelBufferData;
    let [resolutionBuffer, resolutionData] = resolutionBufferData;

    let bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                buffer: pixelBuffer,
                offset: 0,
                size: pixelBufferSize
            },
            {
                binding: 1,
                buffer: resolutionBuffer,
                offset: 0,
                size: resolutionData.byteLength
            }
        ]
    });

    let dirname = path.join(process.cwd(), "lessons/triangle_ray_tracing_compute/code/shader/");
    let vertexShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "screen.vert"), "utf-8") });
    let fragmentShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "screen.frag"), "utf-8") });

    let pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),
        vertexStage: {
            module: vertexShaderModule,
            entryPoint: "main"
        },
        fragmentStage: {
            module: fragmentShaderModule,
            entryPoint: "main"
        },
        primitiveTopology: "triangle-list",
        vertexState: {
            indexFormat: "uint32",
            vertexBuffers: []
        },
        colorStates: [{
            format: swapChainFormat,
            alphaBlend: {},
            colorBlend: {}
        }]
    });

    setScreenPass({
        bindGroup,
        pipeline
    });
}