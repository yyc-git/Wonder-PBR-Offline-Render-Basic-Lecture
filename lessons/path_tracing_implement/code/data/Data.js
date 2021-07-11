export let data = {
    config: {
        width: null,
        height: null,
        isRender: true
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
        frameIndex: null,
        commonDataBufferData: null,
        pixelBufferData: null,
        resolutionBufferData: null
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