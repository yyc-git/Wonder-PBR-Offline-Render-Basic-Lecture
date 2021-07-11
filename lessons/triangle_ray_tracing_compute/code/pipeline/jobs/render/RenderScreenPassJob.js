import { getScreenPass, getWebGPU } from "../../../data/Repo.js";

export let exec = () => {
    let { swapChain, device, queue } = getWebGPU();
    let {
        bindGroup,
        pipeline
    } = getScreenPass();

    let backBufferView = swapChain.getCurrentTextureView();
    let commandEncoder = device.createCommandEncoder({});
    let passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            clearColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
            attachment: backBufferView
        }]
    });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();
    queue.submit([commandEncoder.finish()]);
}