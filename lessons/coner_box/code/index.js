import THREE from "three";
import { log } from "./log/Log.js";
import { createSphere, createPlane } from "./scene/Primitive.js";
import { setConfig, setScene } from "./data/Repo.js";
import { createCamera } from "./scene/Camera.js";
import { exec as init } from "./pipeline/InitPipeline.js";
import { exec as render } from "./pipeline/RenderPipeline.js";
import { createRectAreaLight } from "./scene/AreaLight.js";

let _buildScene = () => {
    let scene = new THREE.Scene();

    let camera = createCamera({
        localPosition: [0.01, 0.01, 11],
        lookAt: [0, 0, 0]
    });

    scene.add(createPlane({
        localPosition: [0, 0, -5],
        localEulerAngles: [0, 0, 0],
        width: 10,
        height: 10,
        color: [0.7,0.7,0.7]
    }));
    scene.add(createPlane({
        localPosition: [0, -5, 0],
        localEulerAngles: [90, 0, 0],
        width: 10,
        height: 10,
        color: [0.7,0.7,0.7]
    }));
    scene.add(createPlane({
        localPosition: [0, 5, 0],
        localEulerAngles: [-90, 0, 0],
        width: 10,
        height: 10,
        color: [0.7,0.7,0.7]
    }));
    scene.add(createPlane({
        localPosition: [-5, 0, 0],
        localEulerAngles: [0, 90, 0],
        width: 10,
        height: 10,
        color: [1.0, 0.0, 0.0]
    }));
    scene.add(createPlane({
        localPosition: [5, 0, 0],
        localEulerAngles: [0, -90, 0],
        width: 10,
        height: 10,
        color: [0.0, 1.0, 0.0]
    }));

    scene.add(createSphere({
        localPosition: [0, -3, 0],
        localEulerAngles: [0, 0, 0],
        radius: 1,
        color: [0.2, 0.5, 0.3]
    }));

    scene.add(createRectAreaLight({
        localPosition: [0, 4.99, 0],
        localEulerAngles: [-90, 0, 0],
        width: 2,
        height: 2,
        lemit: [1.0, 1.0, 1.0]
    }));

    return [camera, scene];
}

let _main = async () => {
    setConfig({ width: 640, height: 480 });

    let [camera, scene] = _buildScene();

    camera.updateMatrixWorld();
    scene.updateMatrixWorld();

    setScene({
        camera,
        scene
    });

    await init();

    while (true) {
        render();
    }
}

_main().then(() => {
    log("finish main");
});