import { getRasterizationPass, getWebGPU } from "../../../data/Repo.js";

export let exec = () => {
    let { swapChain, device, queue } = getWebGPU();
    let {
        indexCount,
        vertexBuffer,
        indexBuffer,
        pipeline
    } = getRasterizationPass();

    let backBufferView = swapChain.getCurrentTextureView();
    let commandEncoder = device.createCommandEncoder({});
    let renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            clearColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
            attachment: backBufferView
        }]
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer, 0);
    renderPass.setIndexBuffer(indexBuffer);
    renderPass.drawIndexed(indexCount, 1, 0, 0, 0);
    renderPass.endPass();

    let commandBuffer = commandEncoder.finish();
    queue.submit([commandBuffer]);
}