#version 460
#extension GL_EXT_ray_tracing : enable
#pragma shader_stage(closest)

layout(location = 0) rayPayloadInEXT vec3 payload;

void main() { payload = vec3(1.0, 0.0, 0.0); }