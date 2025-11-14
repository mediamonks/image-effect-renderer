const float iFrameStepSize = 1.;// Based on alpha during additive blending
const float smoothWidth = 4./255.;// 0 - 1 (1./255. = no smoothing, 10./255. = 10 frames smoothing)

uniform float iFrames;

float getDelta() {
  // normally, you will pass delta as an uniform
  return clamp(mod(iTime * 24., iFrames + 4.) - 2., 0., iFrames) / 255.;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2 uv = fragCoord/iResolution.xy;
  uv.y = 1.0 - uv.y;

  float maskGrad = iFrames/255. - texture(iChannel0, uv).r * (1. / iFrameStepSize);

  // normally, you will pass delta as an uniform
  float delta = getDelta();

  vec3 col = texture(iChannel1, uv).rgb;

  float alpha = smoothstep(maskGrad, maskGrad + smoothWidth, delta * (1.0 + smoothWidth * 255./iFrames));

  fragColor = vec4(col * alpha, alpha);
}
