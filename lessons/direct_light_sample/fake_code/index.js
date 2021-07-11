let _getBackgroudColor = () => {
    return backgroudColor;
}

let _handleRayHit = (p, wo, throughput) => {
    let samplePoint = sampleRectAreaLight();

    let radiance = (
        L_e_material(p, wo)
        + f_r * L_e_area_light() * v(p, samplePoint) * cosine * lightCosine / (samplePoint - p) * (samplePoint - p) / pdf(samplePoint)
    ) * throughput;

    if (isHitEmitInstance(result)) {
        return [false, radiance, null, null];
    } else {
        //在半球内采样1个方向
        let wi = sample1(wo);

        return [true, radiance, wi, throughput * f_r * cosine / pdf(wi)];
    }
};

let _weight = (pixelDiff) => 1;

let _generate = () => {
    getScreenAllPixels().forEach(({ pixelIndex }) => {
        let pixelColor = [0.0, 0.0, 0.0];

        let weightSum = 0;

        for (let j = 0; j < m; j++) {
            let pixel = getPixel(pixelIndex);
            let sampledPixel = [pixel.x + Math.random(), pixel.y + Math.random()];
            let pixelDiff = sampledPixel - pixel;

            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, sampledPixel);

            let wi = cameraToPixelDirection;

            let radiance = [0.0, 0.0, 0.0];
            let throughput = [1.0, 1.0, 1.0];

            bool isCameraRay = true;

            while (true) {
                let result = traceRay(generateSampleRay(p, wi));

                if (result.isHit) {
                    let wo = -wi;

                    if (isCameraRay && isHitEmitInstance(result)) {
                        radiance = L_e(result.hitPosition, wo);

                        break;
                    } else {
                        let [isContinueBounce, newRadiance, newWi, newThroughput] = _handleRayHit(result.hitPosition, wo, throughput);


                        radiance += newRadiance;

                        if (!isContinueBounce) {
                            break;
                        }

                        wi = newWi;
                        throughput = newThroughput;
                    }
                } else {
                    radiance += _getBackgroudColor() * throughput;

                    break;
                };

                if (!isAbort) {
                    let ksi = Math.random();
                    let p_rr = luminance(throughput);

                    if (ksi > p_rr) {
                        break;
                    } else {
                        throughput /= p_rr;
                    }
                }

                isCameraRay = false;
            }

            pixelColor += _weight(pixelDiff) * radiance;

            weightSum += _weight(pixelDiff);
        }

        pixelColor /= weightSum;

        pixelBuffer[pixelIndex] = (pixelBuffer[pixelIndex].rgb + pixelColor).push(1.0);
    });
}
