uniform vec4 uMouse;
uniform float uMouseDown;

// The MIT License
// Copyright © 2015 Inigo Quilez
// https://www.shadertoy.com/view/ll2GD3

vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos(6.28318*(c*t+d));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float dt = 0.15;

    vec2 uv = fragCoord.xy / iResolution.xy;

    vec2 velocity = texture(iChannel0, uv).xy;
    vec3 col = texture(iChannel1, uv - (dt*3.)*velocity/iResolution.xy).rgb;

    vec3 newCol = pal(iTime, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.10, 0.20));

    col += newCol * 0.01*distance(uMouse.xy, uMouse.zw)/(dot(uv - uMouse.xy, uv - uMouse.xy)+0.002);

    col = clamp(0.998 * col - 0.00005, 0., 5.);
    fragColor = vec4(col, 1.);
}

