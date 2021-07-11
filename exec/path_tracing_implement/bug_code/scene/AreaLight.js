import THREE from "three";
import { createBRDFMaterial } from "./BRDFMaterial.js";
import { convertDegToRad } from "./utils/TransformUtils.js";

export let createRectAreaLight = ({ localPosition, localEulerAngles, lemit, width, height }) => {
    localEulerAngles = convertDegToRad(localEulerAngles);
    let material = createBRDFMaterial(null, true);
    let geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(localPosition[0], localPosition[1], localPosition[2]);
    mesh.rotation.set(localEulerAngles[0], localEulerAngles[1], localEulerAngles[2]);

    mesh.lemit = lemit;

    return mesh;
}