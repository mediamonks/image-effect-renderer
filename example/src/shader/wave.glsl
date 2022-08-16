uniform float uScrAspectRatio;

float sineNoise1(float t) {
  const float fallOff = 0.618;
  float a= 1.;
  float f = 1.;
  float o = 1.;

  for (int i = 0; i < 3; i++) {
    o += sin(t * f) * a;
    f *= (1./fallOff);
    a *= fallOff;
  }
  return o;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 uv = fragCoord.xy / iResolution.xy;

	uv.y = 1.0 - uv.y;

  uv.y -= .5;
  uv.y *= uScrAspectRatio;
  uv.y *= iResolution.y / iResolution.x;
  uv.y += .5;

  const float amplitude = .025;
  const float temporalFrequency = 1.;
  const float spatialFrequency = 5.;

  uv.y += amplitude * sineNoise1(iTime * temporalFrequency + uv.x * spatialFrequency);

	vec4 color = texture(iChannel0, uv).rgba;

	fragColor = color;
}
