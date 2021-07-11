import { fatal } from "../log/Log.js";
import { getScene } from "../data/Repo.js";

let _hasAttribute = (bufferGeometry, attributeName) => {
    return bufferGeometry.getAttribute(attributeName) !== undefined;
};

let _isGeometryHasVertexData = (bufferGeometry) => {
    let attribute = bufferGeometry.getAttribute("position");

    return attribute !== undefined && attribute.count > 0;
}

let _getExistPoints = (bufferGeometry, attributeName) => {
    if (_hasAttribute(bufferGeometry, attributeName)) {
        let result = bufferGeometry.getAttribute(attributeName).array;
        return result;
    }

    fatal(`${attributeName} should exist!`);
}

let _hasIndices = (bufferGeometry) => {
    return bufferGeometry.index !== null;
}

let _getExistIndices = (bufferGeometry) => {
    if (_hasIndices(bufferGeometry)) {
        return bufferGeometry.index.array;
    }

    fatal("geometry should has indices!");
}

let _getFromMatrix4 = (mat4) => {
    return mat4.elements;
}

export let scene = {
    getScene: () => getScene().scene,
    getActiveCamera: () => getScene().camera
}

export let gameObject = {
    getBasicCameraView: (gameObject) => {
        return gameObject;
    },
    getPerspectiveCameraProjection: (gameObject) => {
        return gameObject;
    },
    getAllGameObjectGeometries: (scene) => {
        let result = [];

        scene.traverse((object) => {
            if (!object.geometry) {
                return;
            }

            let geometry = object.geometry;

            if (_isGeometryHasVertexData(geometry)) {
                result.push(geometry);
            }
        });

        return result;
    },
}

export let basicCameraView = {
    getGameObject: (cameraView) => {
        return cameraView;
    },
    getViewWorldToCameraMatrix: (cameraView) => {
        let result = _getFromMatrix4(cameraView.matrixWorldInverse);

        return result;
    },
    getActiveBasicCameraView: (activeCamera) => {
        return activeCamera;
    }

}

export let perspectiveCameraProjection = {
    getPMatrix: (cameraProjection) => {
        let result = _getFromMatrix4(cameraProjection.projectionMatrix);

        return result;
    },
    getFovy: (cameraProjection) => {
        let result = cameraProjection.fov;

        return result;
    },
    getAspect: (cameraProjection) => {
        let result = cameraProjection.aspect;

        return result;
    },
    getNear: (cameraProjection) => {
        let result = cameraProjection.near;

        return result;
    },
    getFar: (cameraProjection) => {
        let result = cameraProjection.far;

        return result;
    },

}

export let geometry = {
    getVertices: (geometry) => {
        return _getExistPoints(geometry, "position");
    },
    getIndices: (geometry) => {
        let result = _getExistIndices(geometry);

        return result;
    }
}