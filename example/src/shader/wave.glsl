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
  uv.y *= iResolution.y / iResolution.x / .5;
  uv.y += .5;

  float amp = .025;

  uv.y += amp * sineNoise1(iTime + uv.x * 5.);

	vec4 color = texture(iChannel0, uv).rgba;

	fragColor = color;
}
