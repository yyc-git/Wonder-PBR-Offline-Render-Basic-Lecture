import { getRayTracingPass, getWebGPU } from "../../../data/Repo.js";

export let exec = () => {
    let { window, device, queue } = getWebGPU();
    let {
        bindGroup,
        pipeline
    } = getRayTracingPass();

    let commandEncoder = device.createCommandEncoder({});
    let passEncoder = commandEncoder.beginRayTracingPass({});
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.traceRays(
        0, // sbt ray-generation offset
        1, // sbt ray-hit offset
        2, // sbt ray-miss offset
        window.width,  // query width dimension
        window.height, // query height dimension
        1              // query depth dimension
    );
    passEncoder.endPass();
    queue.submit([commandEncoder.finish()]);
}