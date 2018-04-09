uniform float delta;

float smooth = 24.0;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv.y = 1.0 - uv.y;

	vec4 color = texture(iChannel0, uv).rgba;

	float colorGrad = texture(iChannel1, uv).r;

	color.rgb *= color.a;
	fragColor = color * smoothstep( colorGrad - 1.0 / smooth, colorGrad, (delta * (1.0 + 1.0 / smooth) - 1.0 / smooth));
}
