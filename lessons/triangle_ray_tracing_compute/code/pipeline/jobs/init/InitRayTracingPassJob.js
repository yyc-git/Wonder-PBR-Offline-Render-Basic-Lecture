import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getWebGPU, getPass, getCamera, setRayTracingPass } from "../../../data/Repo.js"
import { setFromVertices } from "../../../math/AABB.js";
import { scene, gameObject, geometry } from "../../../scene/SceneGraphConverter.js";

let _convertVerticesFromLocalToWorld = (vertices) => {
    return vertices;
}

let _buildSceneAccelerationStructureBufferData = (device) => {
    let triangleGeometry = gameObject.getAllGameObjectGeometries(scene.getScene())[0];

    let triangleWorldVertices = _convertVerticesFromLocalToWorld(geometry.getVertices(triangleGeometry));

    let { min, max } = setFromVertices(triangleWorldVertices);

    let bufferData = new Float32Array(4 * 5 * 1);

    bufferData.set(min, 0);
    bufferData.set(max, 4);

    bufferData[8] = triangleWorldVertices[0];
    bufferData[9] = triangleWorldVertices[1];
    bufferData[10] = triangleWorldVertices[2];

    bufferData[12] = triangleWorldVertices[3];
    bufferData[13] = triangleWorldVertices[4];
    bufferData[14] = triangleWorldVertices[5];

    bufferData[16] = triangleWorldVertices[6];
    bufferData[17] = triangleWorldVertices[7];
    bufferData[18] = triangleWorldVertices[8];

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_DST

    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferSize];
}

export let exec = () => {
    let { device } = getWebGPU();

    let bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 1,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 2,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 3,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            }
        ]
    });

    let { pixelBufferData, resolutionBufferData } = getPass();
    let [pixelBuffer, pixelBufferSize] = pixelBufferData;
    let [resolutionBuffer, resolutionData] = resolutionBufferData;

    let { cameraBufferData } = getCamera();
    let [cameraBuffer, cameraData] = cameraBufferData;

    let [sceneAccelerationStructureBuffer, sceneAccelerationStructureBufferSize] = _buildSceneAccelerationStructureBufferData(device);

    let bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                buffer: sceneAccelerationStructureBuffer,
                size: sceneAccelerationStructureBufferSize
            },
            {
                binding: 1,
                buffer: pixelBuffer,
                size: pixelBufferSize
            },
            {
                binding: 2,
                buffer: cameraBuffer,
                size: cameraData.byteLength
            },
            {
                binding: 3,
                buffer: resolutionBuffer,
                size: resolutionData.byteLength
            }
        ]
    });

    let dirname = path.join(process.cwd(), "lessons/triangle_ray_tracing_compute/code/shader/");
    let shaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "ray-tracing.comp"), "utf-8") });

    let pipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),
        computeStage: {
            module: shaderModule,
            entryPoint: "main"
        }
    });

    setRayTracingPass({
        bindGroup,
        pipeline
    });
}