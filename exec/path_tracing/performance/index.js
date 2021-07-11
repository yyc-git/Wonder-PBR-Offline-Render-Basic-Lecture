// 已知下面的数据类型：
// type ray;
// type position;
// type result = {
//     isHit: bool,
//     hitPosition: position
// }
// type direction;
// type radiance = [float, float, float];

// 已知下面的函数：
// type traceRay = ray -> result;
// type isHitEmitInstance = result -> bool;
// type generateCameraRay = (position, direction) -> ray;
// type generateSampleRay = (position, direction) -> ray;
// type pdf = direction -> float;
// type L_e = (position, direction) -> radiance;

// type isHitObject = result -> bool;

// type sample1 = direction -> direction;


// 用f_r表示fr函数的返回值，不需要参数
// 用cosine表示cos(theta i)

// 已知下面的数据：
// totalSampleCount: 采样次数
// pixelBuffer



let PathTracePass = (function () {
    let _handleRayMiss = () => {
        return backgroudColor;
    }

    let _handleRayHit = (p, wo) => {
        TODO
    }

    let _generate = () => {
        getScreenAllPixels().forEach(({ pixelIndex }) => {
            let radiance = [0.0, 0.0, 0.0];
            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, pixelIndex);
            let wo = -cameraToPixelDirection;

            let result = traceRay(generateCameraRay(cameraPosition, cameraToPixelDirection));

            if (result.isHit) {
                if (isHitEmitInstance(result)) {
                    radiance = L_e(p, wo);
                } else {
                    radiance = _handleRayHit(result.hitPosition, wo);
                }
            } else {
                radiance = _handleRayMiss();
            };

            TODO
        });
    }

    return {
        execute: _generate
    }
});

let AccumulationPass = (function () {
    return {
        execute: () => {
            getScreenAllPixels().forEach(({ pixelIndex }) => {
                TODO
            });
        }
    }
})

let oneFrame = () => {
    PathTracePass.execute();
    AccumulationPass.execute();
};

oneFrame();
