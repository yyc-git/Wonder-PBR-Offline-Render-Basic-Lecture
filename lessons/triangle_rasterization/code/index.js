import path from "path";
import THREE from "three";
import { log } from "./log/Log.js";
import { createTriangle } from "./scene/Primitive.js";
import { setConfig, setScene } from "./data/Repo.js";
import { exec as init } from "./pipeline/InitPipeline.js";
import { exec as render } from "./pipeline/RenderPipeline.js";

let _buildScene = () => {
    let scene = new THREE.Scene();

    scene.add(createTriangle());

    return scene;
}

let _main = async () => {
    setConfig({ width: 640, height: 480 });

    let scene = _buildScene();

    scene.updateMatrixWorld();

    setScene({
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