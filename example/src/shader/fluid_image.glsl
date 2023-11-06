void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
    col = smoothstep(vec3(0), vec3(1), col);

    fragColor = vec4(col, 1);
}
