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

export let scene = {
    getScene: () => getScene().scene
}

export let gameObject = {
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
    }
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