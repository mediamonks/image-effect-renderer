vec3 mouseInput(vec2 uv) {
  vec2 d = uv - iMouse.xy;
  d.x *= iResolution.x / iResolution.y;
  return vec3((iMouse.zw-iMouse.xy) * 20. * smoothstep(.2, 0., length(d)), 0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;
  vec3 newColor = oldColor + mouseInput(uv);

  // newColor -= sign(newColor) * 1./127.;

  fragColor = vec4(newColor, 1);
}
