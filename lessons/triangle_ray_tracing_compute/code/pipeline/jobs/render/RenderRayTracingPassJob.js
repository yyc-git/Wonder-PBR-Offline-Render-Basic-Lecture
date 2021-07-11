import { getRayTracingPass, getWebGPU } from "../../../data/Repo.js";
import { getWindowSize } from "../utils/SizeUtils.js";

export let exec = () => {
    let { window, device, queue } = getWebGPU();
    let {
        bindGroup,
        pipeline
    } = getRayTracingPass();

    let commandEncoder = device.createCommandEncoder({});
    let passEncoder = commandEncoder.beginComputePass({});
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);

    let [width, height] = getWindowSize(window);
    passEncoder.dispatch(
        width, height, 1
    );

    passEncoder.endPass();
    queue.submit([commandEncoder.finish()]);
}