export let data = {
    config: {
        width: null,
        height: null
    },
    scene: {
        camera: null,
        scene: null
    },
    webgpu: {
        window: null,
        device: null,
        adapter: null,
        context: null,
        queue: null,
        swapChainFormat: null,
        swapChain: null
    },
    camera: {
        cameraBufferData: null
    },
    pass: {
        pixelBufferData: null
    },
    rayTracingPass: {
        bindGroup: null,
        pipeline: null
    },
    screenPass: {
        bindGroup: null,
        pipeline: null
    }
}