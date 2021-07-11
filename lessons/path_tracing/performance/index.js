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
    let _getBackgroudColor = () => {
        return backgroudColor;
    }

    let _handleRayHit = (p, wo) => {
        //在半球内采样1个方向
        let wi = sample1(wo);

        let L_r = null;
        let result = traceRay(generateSampleRay(p, wi));

        if (isHitEmitInstance(result)) {
            L_r = L_e(p, -wi) * f_r * cosine / pdf(wi);
        } else if (isHitObject(result)) {
            L_r = _handleRayHit(result.hitPosition, -wi) * f_r * cosine / pdf(wi);
        } else {
            L_r = _getBackgroudColor() * f_r * cosine / pdf(wi);
        };

        return L_e(p, wo) + L_r;
    }

    let _generate = () => {
        getScreenAllPixels().forEach(({ pixelIndex }) => {
            let radiance = [0.0, 0.0, 0.0];
            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, pixelIndex);
            let wo = -cameraToPixelDirection;

            let result = traceRay(generateCameraRay(cameraPosition, cameraToPixelDirection));

            if (result.isHit) {
                if (isHitEmitInstance(result)) {
                    radiance = L_e(result.hitPosition, wo);
                } else {
                    radiance = _handleRayHit(result.hitPosition, wo);
                }

            } else {
                radiance = _getBackgroudColor();
            };

            pixelBuffer[pixelIndex] = (pixelBuffer[pixelIndex].rgb + radiance).push(1.0);
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
                render(pixelBuffer[pixelIndex] / totalSampleCount);
            });
        }
    }
})

let oneFrame = () => {
    PathTracePass.execute();
    AccumulationPass.execute();
};

oneFrame();
