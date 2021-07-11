import { getWebGPU, getConfig } from "../../../data/Repo.js";

export let exec = () => {
    let { swapChain, window } = getWebGPU();
    let { isRender } = getConfig();

    if (isRender) {
        swapChain.present();
        window.pollEvents();
    }
}