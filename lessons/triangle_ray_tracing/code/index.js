import THREE from "three";
import { log } from "./log/Log.js";
import { createTriangle } from "./scene/Primitive.js";
import { setConfig, setScene } from "./data/Repo.js";
import { createCamera } from "./scene/Camera.js";
import { exec as init } from "./pipeline/InitPipeline.js";
import { exec as render } from "./pipeline/RenderPipeline.js";

let _buildScene = () => {
    let scene = new THREE.Scene();

    let camera = createCamera({
        localPosition: [0, 0, 2],
        lookAt: [0, 0, 0]
    });

    scene.add(createTriangle());

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