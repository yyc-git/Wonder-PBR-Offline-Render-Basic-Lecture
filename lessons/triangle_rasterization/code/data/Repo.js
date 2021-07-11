import { data } from "./Data.js";

export let getConfig = () => {
    return data.config;
}

export let setConfig = (config) => {
    data.config = config;
}

export let getScene = () => {
    return data.scene;
}

export let setScene = (scene) => {
    data.scene = scene;
}

export let getWebGPU = () => {
    return data.webgpu;
}

export let setWebGPU = (webgpu) => {
    data.webgpu = webgpu;
}

export let getRasterizationPass = () => {
    return data.rasterizationPass;
}

export let setRasterizationPass = (rasterizationPass) => {
    data.rasterizationPass = rasterizationPass;
}