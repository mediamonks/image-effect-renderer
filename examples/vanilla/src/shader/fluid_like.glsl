#version 300 es
precision highp float;

#define PI2 6.2831853

uniform float iTime;
uniform vec2 iResolution;
const float Detail = 2.5;// value= 2.5, min=1., max=5., step=0.1

in vec2 vScreen;
out vec4 fragColor;

#define _CameraDist 3.

#define _Saturation 0.37
#define _Color0 vec3(180./255., 205./255., 245./255.)
#define _Color1 vec3(173./255., 215./255., 252./255.)
#define _Color2 vec3(202./255., 204./255., 235./255.)
#define _NormalStrength 0.75
#define _Frequency 3.5

#define TemporalFrequency  0.125
#define Falloff  0.525
#define Frequency PI2

#define m3 mat3(-0.737, 0.456, 0.498, 0, -0.737, 0.675, 0.675, 0.498, 0.544)

vec3 twistedSineNoise33(vec3 q) {
  q.xy *= vec2(1.8, 1.);
  float a = 1.;
  vec3 sum = vec3(0);
  for (int i = 0; i <4; i++){
    q = m3 * q;
    vec3 s = sin(q.zxy * (1./ a)) * a;
    q += s;
    sum += s;
    a *= Falloff;
  }
  return sum;
}

vec3 getBgCol(vec3 p) {
  vec3 mn = twistedSineNoise33(p);
  vec3 col = mix(mix(mix(_Color0 * _Color0, _Color1 * _Color1, mn.x), _Color2 * _Color2, mn.z), vec3(1), .5 * mn.y);
  return max(vec3(0), col);
}

void main() {
  vec2 uv = vScreen;

  vec3 huv = 7. + vec3(uv, iTime * (_Frequency * TemporalFrequency / Detail));
  vec3 hduv = vec3(1./iResolution.x, 1./iResolution.y, 0.);

  float hdx = (twistedSineNoise33(huv + hduv.xzz).x - twistedSineNoise33(huv - hduv.xzz).x) * (iResolution.x * .5);
  float hdy = (twistedSineNoise33(huv + hduv.zyz).x - twistedSineNoise33(huv - hduv.zyz).x) * (iResolution.x * .5);

  vec3 normal = normalize(vec3(hdx, hdy, _NormalStrength));

  vec3 pos = vec3(uv, _CameraDist);
  vec3 rd = normalize(pos);

  vec3 rf = reflect(-rd, normal);
  vec3 col = getBgCol(rf - vec3(uv * Detail, iTime * TemporalFrequency));

  vec3 rfr = refract(-rd, normal, 1./1.4);
  col += getBgCol(rfr +  vec3(uv * Detail, iTime * TemporalFrequency));

  col = sqrt(col * .6);

  fragColor = vec4(col, 1.0);
}
