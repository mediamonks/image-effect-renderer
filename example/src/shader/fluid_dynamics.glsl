uniform vec4 uMouse;
uniform float uMouseDown;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  const float dt = 0.15;

  // Simple and Fast Fluids
  // https://hal.inria.fr/inria-00596050/document

  vec4 me = texture2D(iChannel0, uv);// x,y velocity, z density, w curl
  vec4 tr = texture2D(iChannel0, uv + vec2(1./iResolution.x, 0));
  vec4 tl = texture2D(iChannel0, uv - vec2(1./iResolution.x, 0));
  vec4 tu = texture2D(iChannel0, uv + vec2(0, 1./iResolution.y));
  vec4 td = texture2D(iChannel0, uv - vec2(0, 1./iResolution.y));

  vec3 dx = (tr.xyz - tl.xyz)*0.5;
  vec3 dy = (tu.xyz - td.xyz)*0.5;
  vec2 DdX = vec2(dx.z, dy.z);

  // Solve for density
  me.z -= dt*dot(vec3(DdX, dx.x + dy.y), me.xyz);

  // Solve for velocity
  vec2 viscosityForce = 0.55*(tu.xy + td.xy + tr.xy + tl.xy - 4.0*me.xy);
  me.xyw = texture2D(iChannel0, uv - me.xy*(dt/iResolution.xy)).xyw;

  vec2 externalForces = clamp(vec2(uMouse.xy - uMouse.zw) * (.4 / (dot(uv - uMouse.xy, uv - uMouse.xy)+0.001)), -5., 5.);

  // Semi−lagrangian advection.
  me.xy += dt*(viscosityForce.xy + externalForces) - 0.2*DdX;

  // Vorticity refinement, copied from "Chimera's Breath" by nimitz 2018 (twitter: @stormoid)
  // https://www.shadertoy.com/view/4tGfDW
  // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
    me.w = (tr.y - tl.y - tu.x + td.x);
    vec2 vort = vec2(abs(tu.w) - abs(td.w), abs(tl.w) - abs(tr.w));
    vort *= 0.11/length(vort + 1e-9)*me.w;
    me.xy += vort;
  // end of vorticy refinement

  // stability
  fragColor = clamp(me, vec4(-10, -10, 0.5, -10.), vec4(10, 10, 3.0, 10.));
}
