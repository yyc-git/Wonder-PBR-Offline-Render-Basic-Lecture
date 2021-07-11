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
// type sampleN = direction -> array<direction>;
// type pdf = direction -> float;
// type L_e = (position, direction) -> radiance;

// 用f_r表示fr函数的返回值，不需要参数
// 用cosine表示cos(theta i)

// 已知下面的数据：
// N：采样次数
// pixelBuffer



let PathTracePass = (function () {
    let _getBackgroudColor = () => {
        return backgroudColor;
    }

    let _handleRayHit = (p, wo) => {
        //在半球内采样N个方向
        let scatterDirections = sampleN(wo);

        let L_r = scatterDirections.reduce(
            (L, wi) => {
                let result = traceRay(generateSampleRay(p, wi));

                if (isHitEmitInstance(result)) {
                    L += 1 / N * L_e(p, -wi) * f_r * cosine / pdf(wi);
                };

                return L;
            },
            [0.0, 0.0, 0.0],
        );

        return L_e(p, wo) + L_r;
    }

    let _generate = () => {
        getScreenAllPixels().forEach(({ pixelIndex }) => {
            let radiance = [0.0, 0.0, 0.0];
            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, pixelIndex);
            let wo = -cameraToPixelDirection;

            let result = traceRay(generateCameraRay(cameraPosition, cameraToPixelDirection));

            if (result.isHit) {
                radiance = _handleRayHit(result.hitPosition, wo);
            } else {
                radiance = _getBackgroudColor();
            };

            pixelBuffer[pixelIndex] = radiance.push(1.0);
        });
    }

    return {
        execute: _generate
    }
});

let ScreenPass = (function () {
    return {
        execute: () => {
            getScreenAllPixels().forEach(({ pixelIndex }) => {
                render(pixelBuffer[pixelIndex]);
            });
        }
    }
})

let oneFrame = () => {
    PathTracePass.execute();
    ScreenPass.execute();
};

oneFrame();
