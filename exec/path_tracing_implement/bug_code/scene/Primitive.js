import THREE from "three";
import { createBRDFMaterial } from "./BRDFMaterial.js";
import { convertDegToRad } from "./utils/TransformUtils.js";

export let createSphere = ({ localPosition, localEulerAngles, radius, color }) => {
    localEulerAngles = convertDegToRad(localEulerAngles);
    // let widthSegments = 20;
    // let heightSegments = 20;
    let widthSegments = 10;
    let heightSegments = 10;

    let material = createBRDFMaterial(color);
    let geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(localPosition[0], localPosition[1], localPosition[2]);
    mesh.rotation.set(localEulerAngles[0], localEulerAngles[1], localEulerAngles[2]);

    // console.log(geometry.getAttribute("position").array.length)

    return mesh;
}

export let createPlane = ({ localPosition, localEulerAngles, width, height, color }) => {
    localEulerAngles = convertDegToRad(localEulerAngles);
    let material = createBRDFMaterial(color);
    let geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(localPosition[0], localPosition[1], localPosition[2]);
    mesh.rotation.set(localEulerAngles[0], localEulerAngles[1], localEulerAngles[2]);

    return mesh;
}