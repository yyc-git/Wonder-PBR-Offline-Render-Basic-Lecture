import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getWebGPU, setRasterizationPass } from "../../../data/Repo.js"
import { scene, gameObject, geometry } from "../../../scene/SceneGraphConverter.js";

export let exec = () => {
    let { device, swapChainFormat } = getWebGPU();

    let triangleGeometry = gameObject.getAllGameObjectGeometries(scene.getScene())[0];

    let triangleVertices = geometry.getVertices(triangleGeometry);
    let vertexBuffer = device.createBuffer({
        size: triangleVertices.byteLength,
        usage: WebGPU.GPUBufferUsage.VERTEX | WebGPU.GPUBufferUsage.COPY_DST
    });
    vertexBuffer.setSubData(0, triangleVertices);

    let triangleIndices = geometry.getIndices(triangleGeometry);
    let indexBuffer = device.createBuffer({
        size: triangleIndices.byteLength,
        usage: WebGPU.GPUBufferUsage.INDEX | WebGPU.GPUBufferUsage.COPY_DST
    });
    indexBuffer.setSubData(0, triangleIndices);

    let layout = device.createPipelineLayout({
        bindGroupLayouts: []
    });

    let vertexShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(process.cwd(), "lessons/triangle_rasterization/code/shader/scene.vert"), "utf-8") });
    let fragmentShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(process.cwd(), "lessons/triangle_rasterization/code/shader/scene.frag"), "utf-8") });

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

    setRasterizationPass({
        indexCount: triangleIndices.length,
        vertexBuffer,
        indexBuffer,
        pipeline
    });
}