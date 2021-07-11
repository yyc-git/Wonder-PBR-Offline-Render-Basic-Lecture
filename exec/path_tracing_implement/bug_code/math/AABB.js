import { create as createVector3, min as minVector3, max as maxVector3 } from "./Vector3.js"

export let create = (min, max) => { return { min, max } };

export let setFromVertices = (vertices) => {
    let min = createVector3(0, 0, 0);
    let max = createVector3(0, 0, 0);

    for (let i = 0; i < vertices.length; i += 3) {
        let v = createVector3(vertices[i], vertices[i + 1], vertices[i + 2]);

        min = minVector3(min, v);
        max = maxVector3(max, v);
    }

    return create(min, max);
}