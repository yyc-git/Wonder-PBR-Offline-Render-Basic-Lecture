import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getWebGPU, getPass, getCamera, setRayTracingPass } from "../../../data/Repo.js"
import { setFromVertices } from "../../../math/AABB.js";
import { scene, gameObject as gameObjectConverter, geometry as geometryConverter, transform as transformConverter, brdfMaterial as brdfMaterialConverter, areaLight as areaLightConverter } from "../../../scene/SceneGraphConverter.js";
import { applyMatrix4 } from "../utils/Vector4Utils.js";

let _convertVerticesFromLocalToWorld = (vertices, index, localToWorldMatrix) => {
    let result = applyMatrix4(
        [vertices[index * 3], vertices[index * 3 + 1], vertices[index * 3 + 2], 1.0], localToWorldMatrix
    );

    result.pop();

    return result;
}

let _buildSceneAccelerationStructureBufferData = (device) => {
    let allRenderGeometryData = gameObjectConverter.getAllGameObjectGeometrieData(scene.getScene());

    let bufferDataArr = allRenderGeometryData.reduce((bufferDataArr, [gameObject, geometry], geometryIndex) => {
        let vertices = geometryConverter.getVertices(geometry);
        let indices = geometryConverter.getIndices(geometry);

        let localToWorldMatrix = transformConverter.getLocalToWorldMatrix(gameObjectConverter.getTransform(gameObject));

        // console.log(
        //     vertices, indices
        // )

        for (let i = 0; i < indices.length; i += 3) {
            let index0 = indices[i];
            let index1 = indices[i + 1];
            let index2 = indices[i + 2];

            // console.log(
            //     index0, index1, index2
            // )

            let worldVertices0 = _convertVerticesFromLocalToWorld(vertices, index0, localToWorldMatrix);
            let worldVertices1 = _convertVerticesFromLocalToWorld(vertices, index1, localToWorldMatrix);
            let worldVertices2 = _convertVerticesFromLocalToWorld(vertices, index2, localToWorldMatrix);

            let { min, max } = setFromVertices(
                worldVertices0.concat(worldVertices1, worldVertices2)
            );

            // console.log("worldVertices0:", worldVertices0);

            bufferDataArr.push(
                min[0],
                min[1],
                min[2],
                0.0
            );
            bufferDataArr.push(
                max[0],
                max[1],
                max[2],
                0.0
            );

            bufferDataArr.push(
                worldVertices0[0],
                worldVertices0[1],
                worldVertices0[2],
                0.0
            );

            bufferDataArr.push(
                worldVertices1[0],
                worldVertices1[1],
                worldVertices1[2],
                0.0
            );

            bufferDataArr.push(
                worldVertices2[0],
                worldVertices2[1],
                worldVertices2[2],
                0.0
            );

            // console.log(geometryIndex);

            bufferDataArr.push(geometryIndex, 0.0, 0.0, 0.0);
        }

        return bufferDataArr;
    }, []);

    let bufferData = new Float32Array(bufferDataArr);

    // console.log(bufferData)

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_DST

    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferSize];
}

let _findIndex = (component, components) => {
    return components.reduce((result, c, index) => {
        if (c === component) {
            result = index;
        }

        return result;
    }, -1);
};

let _buildSceneDescBufferData = (device) => {
    let allRenderGameObjects = gameObjectConverter.getAllGeometryGameObjects(scene.getScene());
    let allRenderBRDFMaterials = gameObjectConverter.getAllGameObjectBRDFMaterials(scene.getScene());

    let bufferDataArr = allRenderGameObjects.reduce((bufferDataArr, gameObject) => {
        bufferDataArr.push(
            _findIndex(gameObjectConverter.getBRDFMaterial(gameObject), allRenderBRDFMaterials),
            0.0,
            0.0,
            0.0
        );

        return bufferDataArr;
    }, []);

    let bufferData = new Float32Array(bufferDataArr);

    // console.log(bufferData)

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_DST

    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferSize];
}

let _convertBoolToFloat = boolValue => boolValue ? 1.0 : 0.0;

let _buildBRDFMaterialBufferData = (device) => {
    let allRenderBRDFMaterials = gameObjectConverter.getAllGameObjectBRDFMaterials(scene.getScene());

    let bufferDataArr = allRenderBRDFMaterials.reduce((bufferDataArr, material) => {
        let color = brdfMaterialConverter.getDiffuseColor(material);

        bufferDataArr.push(
            color[0],
            color[1],
            color[2],
        );
        bufferDataArr.push(
            _convertBoolToFloat(brdfMaterialConverter.isRectAreaLight(material))
        );

        return bufferDataArr;
    }, []);

    let bufferData = new Float32Array(bufferDataArr);

    // console.log(bufferData);

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_DST

    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferSize];
}

let _buildRectAreaLightBufferData = device => {
    let light = areaLightConverter.getRectAreaLight(scene.getScene())

    let bufferData = null;
    if (!light) {
        bufferData = new Float32Array([
            0, 0, 0, 0
        ]);
    }
    else {
        bufferData = new Float32Array(areaLightConverter.getLemit(light).concat([0]));
    }

    // console.log(bufferData)

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.UNIFORM | WebGPU.GPUBufferUsage.COPY_DST
    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferData];
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
                type: "storage-buffer"
            },
            {
                binding: 3,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 4,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 5,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 6,
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

    let [sceneDescBuffer, sceneDescBufferSize] = _buildSceneDescBufferData(device);
    let [brdfMaterialBuffer, brdfMaterialBufferSize] = _buildBRDFMaterialBufferData(device);

    let [rectAreaLightBuffer, rectAreaLightBufferData] = _buildRectAreaLightBufferData(device)

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
                buffer: sceneDescBuffer,
                size: sceneDescBufferSize
            },
            {
                binding: 2,
                buffer: brdfMaterialBuffer,
                size: brdfMaterialBufferSize
            },
            {
                binding: 3,
                buffer: rectAreaLightBuffer,
                size: rectAreaLightBufferData.byteLength
            },
            {
                binding: 4,
                buffer: pixelBuffer,
                size: pixelBufferSize
            },
            {
                binding: 5,
                buffer: cameraBuffer,
                size: cameraData.byteLength
            },
            {
                binding: 6,
                buffer: resolutionBuffer,
                size: resolutionData.byteLength
            }
        ]
    });

    let dirname = path.join(process.cwd(), "lessons/coner_box/code/shader/");
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