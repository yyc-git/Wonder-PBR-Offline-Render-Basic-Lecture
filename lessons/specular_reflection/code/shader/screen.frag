#version 450
#pragma shader_stage(fragment)

layout(location = 0) in vec2 uv;
layout(location = 0) out vec4 outColor;

layout(std140, set = 0, binding = 0) buffer PixelBuffer { vec4 pixels[]; }
pixelBuffer;

layout(std140, set = 0, binding = 1) uniform ScreenDimension {
  vec2 resolution;
}
screenDimension;

layout(std140, set = 0, binding = 2) uniform CommonData {
  uint sampleCountPerPixel;
  uint totalSampleCount;
  uint pad_0;
  uint pad_1;
}
pushC;

void main() {
  const ivec2 resolution = ivec2(screenDimension.resolution);

  const ivec2 bufferCoord = ivec2(floor(uv * resolution));
  const uint pixelIndex = bufferCoord.y * uint(resolution.x) + bufferCoord.x;

  vec3 pixelColor = pixelBuffer.pixels[pixelIndex].rgb / pushC.totalSampleCount;
  // vec3 pixelColor = pixelBuffer.pixels[pixelIndex].rgb ;
  outColor = vec4(pixelColor, 1.0);
  // outColor = vec4(pushC.totalSampleCount / 10, 0,0, 1.0);
  // outColor = vec4(1.0);
}
