import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getWebGPU, getPass, getCamera, setRayTracingPass } from "../../../data/Repo.js"
import { scene, gameObject, geometry } from "../../../scene/SceneGraphConverter.js";

let _createShaderBindingTable = device => {
    let dirname = path.join(process.cwd(), "lessons/triangle_ray_tracing/code/shader/");
    let rayGenShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "ray-generation.rgen"), "utf-8") });
    let rayCHitShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "ray-closest-hit.rchit"), "utf-8") });
    let rayMissShaderModule = device.createShaderModule({ code: fs.readFileSync(path.join(dirname, "ray-miss.rmiss"), "utf-8") });

    return device.createRayTracingShaderBindingTable({
        stages: [
            {
                module: rayGenShaderModule,
                stage: WebGPU.GPUShaderStage.RAY_GENERATION
            },
            {
                module: rayCHitShaderModule,
                stage: WebGPU.GPUShaderStage.RAY_CLOSEST_HIT
            },
            {
                module: rayMissShaderModule,
                stage: WebGPU.GPUShaderStage.RAY_MISS
            }
        ],
        groups: [
            // generation group
            {
                type: "general",
                generalIndex: 0, // ray generation shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            },
            // hit group
            {
                type: "triangles-hit-group",
                generalIndex: -1,
                anyHitIndex: -1,
                closestHitIndex: 1, // ray closest-hit shader index
                intersectionIndex: -1
            },
            // miss group
            {
                type: "general",
                generalIndex: 2, // ray miss shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            }
        ]
    });
}

let _buildContainers = (device, queue) => {
    let triangleGeometry = gameObject.getAllGameObjectGeometries(scene.getScene())[0];

    let triangleVertices = geometry.getVertices(triangleGeometry);
    let triangleVertexBuffer = device.createBuffer({
        size: triangleVertices.byteLength,
        usage: WebGPU.GPUBufferUsage.COPY_DST | WebGPU.GPUBufferUsage.RAY_TRACING
    });
    triangleVertexBuffer.setSubData(0, triangleVertices);

    let triangleIndices = geometry.getIndices(triangleGeometry);
    let triangleIndexBuffer = device.createBuffer({
        size: triangleIndices.byteLength,
        usage: WebGPU.GPUBufferUsage.COPY_DST | WebGPU.GPUBufferUsage.RAY_TRACING
    });
    triangleIndexBuffer.setSubData(0, triangleIndices);

    let geometryContainer = device.createRayTracingAccelerationContainer({
        level: "bottom",
        usage: WebGPU.GPURayTracingAccelerationContainerUsage.PREFER_FAST_TRACE,
        geometries: [
            {
                usage: WebGPU.GPURayTracingAccelerationGeometryUsage.OPAQUE,
                type: "triangles",
                vertex: {
                    buffer: triangleVertexBuffer,
                    format: "float3",
                    stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                    count: triangleVertices.length
                },
                index: {
                    buffer: triangleIndexBuffer,
                    format: "uint32",
                    count: triangleIndices.length
                }
            }
        ]
    });

    let instanceContainer = device.createRayTracingAccelerationContainer({
        level: "top",
        usage: WebGPU.GPURayTracingAccelerationContainerUsage.PREFER_FAST_TRACE,
        instances: [
            {
                usage: WebGPU.GPURayTracingAccelerationInstanceUsage.FORCE_OPAQUE,
                transform: {
                    translation: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 1, y: 1, z: 1 }
                },
                geometryContainer: geometryContainer
            }
        ]
    });

    {
        let commandEncoder = device.createCommandEncoder({});
        commandEncoder.buildRayTracingAccelerationContainer(geometryContainer);
        queue.submit([commandEncoder.finish()]);
    }

    {
        let commandEncoder = device.createCommandEncoder({});
        commandEncoder.buildRayTracingAccelerationContainer(instanceContainer);
        queue.submit([commandEncoder.finish()]);
    }

    return instanceContainer;
}

export let exec = () => {
    let { device, queue } = getWebGPU();

    let shaderBindingTable = _createShaderBindingTable(device);
    let instanceContainer = _buildContainers(device, queue);

    let bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: WebGPU.GPUShaderStage.RAY_GENERATION,
                type: "acceleration-container"
            },
            {
                binding: 1,
                visibility: WebGPU.GPUShaderStage.RAY_GENERATION,
                type: "storage-buffer"
            },
            {
                binding: 2,
                visibility: WebGPU.GPUShaderStage.RAY_GENERATION,
                type: "uniform-buffer"
            }
        ]
    });

    let { pixelBufferData } = getPass();
    let [pixelBuffer, pixelBufferSize] = pixelBufferData;

    let { cameraBufferData } = getCamera();
    let [cameraBuffer, cameraData] = cameraBufferData;

    let bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                accelerationContainer: instanceContainer,
                size: 0
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
            }
        ]
    }); 

    let pipeline = device.createRayTracingPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),
        rayTracingState: {
            shaderBindingTable,
            maxPayloadSize: 3 * Float32Array.BYTES_PER_ELEMENT
        }
    });

    setRayTracingPass({
        bindGroup,
        pipeline
    });
}