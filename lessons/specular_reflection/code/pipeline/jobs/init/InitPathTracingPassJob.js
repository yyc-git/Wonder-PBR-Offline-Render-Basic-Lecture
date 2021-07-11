import WebGPU from "wonder-webgpu";
import fs from "fs";
import path from "path";
import { getWebGPU, getPass, getCamera, setRayTracingPass } from "../../../data/Repo.js"
import { setFromVertices } from "../../../math/AABB.js";
import { scene, gameObject as gameObjectConverter, geometry as geometryConverter, transform as transformConverter, brdfLambertianMaterial as brdfLambertianMaterialConverter, brdfSpecularReflectionMaterial as brdfSpecularReflectionMaterialConverter, areaLight as areaLightConverter } from "../../../scene/SceneGraphConverter.js";
import { applyMatrix4 } from "../utils/Vector4Utils.js";
import { concat } from "../utils/Uint32ArrayUtils.js";

let _convertVerticesFromLocalToWorld = (vertices, index, localToWorldMatrix) => {
    let result = applyMatrix4(
        [vertices[index * 3], vertices[index * 3 + 1], vertices[index * 3 + 2], 1.0], localToWorldMatrix
    );

    result.pop();

    return result;
}

let _buildSceneAccelerationStructureBufferData = (device) => {
    let allRenderGeometryData = gameObjectConverter.getAllGameObjectGeometryData(scene.getScene());

    let bufferDataArr = allRenderGeometryData.reduce((bufferDataArr, [gameObject, geometry], geometryIndex) => {
        let vertices = geometryConverter.getVertices(geometry);
        let indices = geometryConverter.getIndices(geometry);

        let localToWorldMatrix = transformConverter.getLocalToWorldMatrix(gameObjectConverter.getTransform(gameObject));

        // console.log(
        //     vertices, indices
        // )

        let primitiveIndex = 0;

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

            // console.log(primitiveIndex, geometryIndex);

            bufferDataArr.push(primitiveIndex, geometryIndex, 0.0, 0.0);

            primitiveIndex += 1;
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

let _setMat3Data = (bufferDataArr, index, mat3) => {
    bufferDataArr[index] = mat3[0];
    bufferDataArr[index + 1] = mat3[1];
    bufferDataArr[index + 2] = mat3[2];
    bufferDataArr[index + 3] = 0.0;

    bufferDataArr[index + 4] = mat3[3];
    bufferDataArr[index + 5] = mat3[4];
    bufferDataArr[index + 6] = mat3[5];
    bufferDataArr[index + 7] = 0.0;


    bufferDataArr[index + 8] = mat3[6];
    bufferDataArr[index + 9] = mat3[7];
    bufferDataArr[index + 10] = mat3[8];
    bufferDataArr[index + 11] = 0.0;
}

let _buildSceneDescBufferData = (device) => {
    let allRenderGameObjects = gameObjectConverter.getAllGeometryGameObjects(scene.getScene());
    let allRenderGeometries = gameObjectConverter.getAllGameObjectGeometries(scene.getScene());
    let allRenderBRDFLambertianMaterials = gameObjectConverter.getAllGameObjectBRDFLambertianMaterials(scene.getScene());
    let allRenderBRDFSpecularReflectionMaterials = gameObjectConverter.getAllGameObjectBRDFSpecularReflectionMaterials(scene.getScene());

    let bufferDataArr = allRenderGameObjects.reduce((bufferDataArr, gameObject) => {
        let materialType = null;
        let materialIndex = null;
        let material = gameObjectConverter.getBRDFLambertianMaterial(gameObject);

        if (material !== null) {
            materialType = brdfLambertianMaterialConverter.getType(material);
            materialIndex = _findIndex(material, allRenderBRDFLambertianMaterials);
        }
        else {
            material = gameObjectConverter.getBRDFSpecularReflectionMaterial(gameObject);
            materialType = brdfSpecularReflectionMaterialConverter.getType(material);
            materialIndex = _findIndex(material, allRenderBRDFSpecularReflectionMaterials);
        }

        bufferDataArr.push(
            _findIndex(gameObjectConverter.getGeometry(gameObject), allRenderGeometries),
            materialIndex,
            materialType,
            0.0
        );

        // console.log(materialIndex, materialType)

        _setMat3Data(bufferDataArr, bufferDataArr.length, transformConverter.getNormalMatrix(gameObjectConverter.getTransform(gameObject)));

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

let _computeVertexCount = vertices => vertices.length / 3;

let _computeFaceCount = indices => indices.length;

let _buildPointIndexBufferData = (device) => {
    let allRenderGeometries = gameObjectConverter.getAllGameObjectGeometries(scene.getScene());

    let [bufferDataArr, _vertexIndex, _faceIndex] = allRenderGeometries.reduce(([bufferDataArr, vertexIndex, faceIndex], geometry) => {
        bufferDataArr.push(
            vertexIndex,
            faceIndex
        );

        return [
            bufferDataArr,
            vertexIndex + _computeVertexCount(
                geometryConverter.getVertices(geometry)
            ),
            faceIndex + _computeFaceCount(
                geometryConverter.getIndices(geometry)
            )
        ];
    }, [[], 0, 0]);

    let bufferData = new Uint32Array(bufferDataArr);

    // console.log(bufferData)

    let bufferSize = bufferData.byteLength;

    let buffer = device.createBuffer({
        size: bufferSize,
        usage: WebGPU.GPUBufferUsage.STORAGE | WebGPU.GPUBufferUsage.COPY_DST

    });

    buffer.setSubData(0, bufferData);

    return [buffer, bufferSize];
}

let _buildVertexBufferData = (device) => {
    let allRenderGeometries = gameObjectConverter.getAllGameObjectGeometries(scene.getScene());

    let bufferDataArr = allRenderGeometries.reduce((bufferDataArr, geometry) => {
        let normals = geometryConverter.getNormals(geometry);

        for (let i = 0; i < normals.length; i += 3) {
            bufferDataArr.push(
                normals[i],
                normals[i + 1],
                normals[i + 2],
                0.0
            )
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

let _buildIndexBufferData = (device) => {
    let allRenderGeometries = gameObjectConverter.getAllGameObjectGeometries(scene.getScene());

    let bufferDataArr = allRenderGeometries.reduce((bufferDataArr, geometry) => {
        let indices = geometryConverter.getIndices(geometry);

        return concat(bufferDataArr, indices)
    }, []);

    let bufferData = new Uint32Array(bufferDataArr);

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

let _buildBRDFLambertianMaterialBufferData = (device) => {
    let allRenderBRDFLambertianMaterials = gameObjectConverter.getAllGameObjectBRDFLambertianMaterials(scene.getScene());

    let bufferDataArr = allRenderBRDFLambertianMaterials.reduce((bufferDataArr, material) => {
        let diffuseColor = brdfLambertianMaterialConverter.getDiffuseColor(material);

        bufferDataArr.push(
            diffuseColor[0],
            diffuseColor[1],
            diffuseColor[2],
        );
        bufferDataArr.push(
            _convertBoolToFloat(brdfLambertianMaterialConverter.isRectAreaLight(material))
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

let _buildBRDFSpecularReflectionMaterialBufferData = (device) => {
    let allRenderBRDFSpecularReflectionMaterials = gameObjectConverter.getAllGameObjectBRDFSpecularReflectionMaterials(scene.getScene());

    let bufferDataArr = allRenderBRDFSpecularReflectionMaterials.reduce((bufferDataArr, material) => {
        bufferDataArr.push(
            _convertBoolToFloat(brdfSpecularReflectionMaterialConverter.isRectAreaLight(material))
        );

        return bufferDataArr;
    }, []);

    let bufferData = new Float32Array(bufferDataArr);

    // console.log("aa:",bufferData);

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
        bufferData = new Float32Array(4 + 4 + 3 * 4 + 4 * 4);
    }
    else {
        let gameObject = areaLightConverter.getGameObject(light);
        let transform = gameObjectConverter.getTransform(gameObject);

        let bufferDataArr = [];

        bufferDataArr = bufferDataArr.concat(areaLightConverter.getLemit(light));
        bufferDataArr.push(0);

        let [width, height] = areaLightConverter.getSize(light);
        bufferDataArr.push(
            -width / 2,
            width / 2,
            -height / 2,
            height / 2
        );

        _setMat3Data(bufferDataArr, bufferDataArr.length, transformConverter.getNormalMatrix(transform));

        let localToWorldMatrix = transformConverter.getLocalToWorldMatrix(transform);
        bufferDataArr = bufferDataArr.concat(localToWorldMatrix);

        bufferData = new Float32Array(bufferDataArr);
    }

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
                type: "storage-buffer"
            },
            {
                binding: 4,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 5,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 6,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 7,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 8,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "storage-buffer"
            },
            {
                binding: 9,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 10,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            },
            {
                binding: 11,
                visibility: WebGPU.GPUShaderStage.COMPUTE,
                type: "uniform-buffer"
            }
        ]
    });

    let { commonDataBufferData, pixelBufferData, resolutionBufferData } = getPass();
    let [commonDataBuffer, commonDataData] = commonDataBufferData;
    // console.log(commonDataData)
    let [pixelBuffer, pixelBufferSize] = pixelBufferData;
    let [resolutionBuffer, resolutionData] = resolutionBufferData;

    let { cameraBufferData } = getCamera();
    let [cameraBuffer, cameraData] = cameraBufferData;

    let [sceneAccelerationStructureBuffer, sceneAccelerationStructureBufferSize] = _buildSceneAccelerationStructureBufferData(device);

    let [sceneDescBuffer, sceneDescBufferSize] = _buildSceneDescBufferData(device);
    let [pointIndexBuffer, pointIndexBufferSize] = _buildPointIndexBufferData(device);
    let [vertexBuffer, vertexBufferSize] = _buildVertexBufferData(device);
    let [indexBuffer, indexBufferSize] = _buildIndexBufferData(device);
    let [brdfLambertianMaterialBuffer, brdfLambertianMaterialBufferSize] = _buildBRDFLambertianMaterialBufferData(device);
    let [brdfSpecularReflectionMaterialBuffer, brdfSpecularReflectionMaterialBufferSize] = _buildBRDFSpecularReflectionMaterialBufferData(device);

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
                buffer: pointIndexBuffer,
                size: pointIndexBufferSize
            },
            {
                binding: 3,
                buffer: vertexBuffer,
                size: vertexBufferSize
            },
            {
                binding: 4,
                buffer: indexBuffer,
                size: indexBufferSize
            },
            {
                binding: 5,
                buffer: brdfLambertianMaterialBuffer,
                size: brdfLambertianMaterialBufferSize
            },
            {
                binding: 6,
                buffer: brdfSpecularReflectionMaterialBuffer,
                size: brdfSpecularReflectionMaterialBufferSize
            },
            {
                binding: 7,
                buffer: rectAreaLightBuffer,
                size: rectAreaLightBufferData.byteLength
            },
            {
                binding: 8,
                buffer: pixelBuffer,
                size: pixelBufferSize
            },
            {
                binding: 9,
                buffer: cameraBuffer,
                size: cameraData.byteLength
            },
            {
                binding: 10,
                buffer: resolutionBuffer,
                size: resolutionData.byteLength
            },
            {
                binding: 11,
                buffer: commonDataBuffer,
                size: commonDataData.byteLength
            }
        ]
    });

    let dirname = path.join(process.cwd(), "lessons/specular_reflection/code/shader/");
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