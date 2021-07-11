import { getWebGPU } from "../../../data/Repo.js";

export let exec = () => {
    let { swapChain, window } = getWebGPU();

    swapChain.present();
    window.pollEvents();
}