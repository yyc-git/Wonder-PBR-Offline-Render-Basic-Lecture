let _weight = (pixelDiff) => 1;

let _generate = () => {
    getScreenAllPixels().forEach(({ pixelIndex }) => {
        let pixelColor = [0.0, 0.0, 0.0];

        let weightSum = 0;

        for (let j = 0; j < m; j++) {
            let radiance = [0.0, 0.0, 0.0];

            let pixel = getPixel(pixelIndex);
            let sampledPixel = [pixel.x + Math.random(), pixel.y + Math.random()];
            let pixelDiff = sampledPixel - pixel;

            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, sampledPixel);
            let wo = -cameraToPixelDirection;

            let result = traceRay(generateCameraRay(cameraPosition, cameraToPixelDirection));

            if (result.isHit) {
                if (isHitEmitInstance(result)) {
                    radiance = L_e(result.hitPosition, wo);
                } else {
                    radiance = _handleRayHit(p_rr, result.hitPosition, wo);
                }
            } else {
                radiance = _getBackgroudColor();
            };

            pixelColor += _weight(pixelDiff) * radiance;

            weightSum += _weight(pixelDiff);
        }

        pixelColor /= weightSum;

        pixelBuffer[pixelIndex] = (pixelBuffer[pixelIndex].rgb + pixelColor).push(1.0);
    });
}