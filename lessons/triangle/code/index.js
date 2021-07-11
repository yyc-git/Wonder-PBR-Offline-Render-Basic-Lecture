import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";

let _render = ([device, window, swapChain, queue], [vertexBuffer, indexBuffer, triangleIndices, pipeline]) => {
    let backBufferView = swapChain.getCurrentTextureView();
    let commandEncoder = device.createCommandEncoder({});
    let renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            clearColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
            attachment: backBufferView
        }]
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer, 0);
    renderPass.setIndexBuffer(indexBuffer);
    renderPass.drawIndexed(triangleIndices.length, 1, 0, 0, 0);
    renderPass.endPass();

    let commandBuffer = commandEncoder.finish();
    queue.submit([commandBuffer]);

    swapChain.present();
    window.pollEvents();
};

let _main = async () => {
    let window = new WebGPU.WebGPUWindow({
        width: 640,
        height: 480,
        title: "Wonder-RTX-Path-Tracer-Education",
        resizable: false
    });

    let context = window.getContext("webgpu");

    let adapter = await WebGPU.GPU.requestAdapter({ window, preferredBackend: "Vulkan" });

    let device = await adapter.requestDevice({});

    let queue = device.getQueue();

    let swapChainFormat = await context.getSwapChainPreferredFormat(device);

    let swapChain = context.configureSwapChain({
        device: device,
        format: swapChainFormat
    });

    let triangleVertices = new Float32Array([
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ]);
    let vertexBuffer = device.createBuffer({
        size: triangleVertices.byteLength,
        usage: WebGPU.GPUBufferUsage.VERTEX | WebGPU.GPUBufferUsage.COPY_DST
    });
    vertexBuffer.setSubData(0, triangleVertices);

    let triangleIndices = new Uint32Array([
        0, 1, 2
    ]);
    let indexBuffer = device.createBuffer({
        size: triangleIndices.byteLength,
        usage: WebGPU.GPUBufferUsage.INDEX | WebGPU.GPUBufferUsage.COPY_DST
    });
    indexBuffer.setSubData(0, triangleIndices);

    let layout = device.createPipelineLayout({
        bindGroupLayouts: []
    });

    let vertexShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(process.cwd(), "lessons/triangle/code/scene.vert"), "utf-8") });
    let fragmentShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(process.cwd(), "lessons/triangle/code/scene.frag"), "utf-8") });

    let pipeline = device.createRenderPipeline({
        layout,
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
            vertexBuffers: [{
                arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                stepMode: "vertex",
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: "float2"
                }]
            }]
        },
        colorStates: [{
            format: swapChainFormat,
            alphaBlend: {},
            colorBlend: {}
        }]
    });

    while (true) {
        _render([device, window, swapChain, queue], [vertexBuffer, indexBuffer, triangleIndices, pipeline]);
    }
};

_main().then(() => {
    console.log("finish main");
});