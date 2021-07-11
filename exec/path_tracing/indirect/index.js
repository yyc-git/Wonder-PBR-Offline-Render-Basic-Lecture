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

// type isHitObject = result -> bool;


// 用f_r表示fr函数的返回值，不需要参数
// 用cosine表示cos(theta i)

// 已知下面的数据：
// N：采样次数
// pixelBuffer

let _handleRayHit = (p, wo) => {
    TODO
}