import THREE from "three";

export let createTriangle = () => {
    let geometry = new THREE.BufferGeometry();

    let vertices = new Float32Array([
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
    ]);

    let indices = new THREE.Uint32BufferAttribute([
        0, 1, 2
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    let mesh = new THREE.Mesh(geometry, null);

    return mesh;
}