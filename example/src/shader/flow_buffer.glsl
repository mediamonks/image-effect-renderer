uniform vec4 uMouse;
uniform float uMouseDown;

vec3 mouseInput(vec2 uv) {
  if (uMouseDown > .5) {
    vec2 d = uv - uMouse.xy;
    d.x *= iResolution.x / iResolution.y;
    return vec3((uMouse.zw-uMouse.xy) * 20. * smoothstep(.2, 0., length(d)), 0);
  } else {
    return vec3(0);
  }
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;
  vec3 newColor = oldColor + mouseInput(uv);

  // newColor -= sign(newColor) * 1./127.;

  fragColor = vec4(newColor, 1);
}
