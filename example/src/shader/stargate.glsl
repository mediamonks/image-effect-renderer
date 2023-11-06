#version 300 es
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

in vec2 vScreen;

out vec4 fragColor;


const float _Temporal = 0.25;    //value=.25, min=0, max=1, step=0.01
const float _FrequencyY = 2.;    //value=2., min=0.1, max=4, step=0.01
const float _SpeedZ = 2.;    //value=2., min=0., max=32, step=0.01
const float _RandomSpeed = 6.;    //value=6., min=0., max=8, step=0.01
const float _FrequencyZ = 0.01;    //value=.01, min=0.0001, max=0.1, step=0.0001

const float PI2 = 6.2831853;


vec3 hash31(float p)
{
    vec3 p3 = fract(p * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec2 hash21(float p)
{
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}


vec3 spectrum(in float d)
{
    return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));
    //return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));
    //return sin((vec3(0, 1. ,2) / 3. + d) * PI2) * 0.5 + 0.5;
}

float aa(float x)
{
    float dx = fwidth(x);
    return smoothstep(dx, 0., x);
}

float aaa(float x)
{
    float dx = fwidth(x);
    return smoothstep(-dx, 0., x) * smoothstep(dx, 0., x);
}

void main() {
    vec3 color = vec3(0.);
    float z = iTime * _SpeedZ;
    float zOffset = z * _RandomSpeed;
    vec2 uv = vScreen * .5;
    uv.x = abs(uv.x);
    uv.y = abs(uv.y);

    vec3 ray = normalize(vec3(uv, 1.5));
    float l = length(ray.xy);
    bool isX =  abs(ray.x) > abs(ray.y);
    vec3 dir = ray / max(abs(ray.x),abs(ray.y)) ;
    float r = 0.5;
    float offset = 0.;
    float hue = sin(iTime) * 0.5 + 0.5;


    for(int i = 0; i <4; i++){
        vec3 hit = dir * r++;
        vec3 p = hit;
        p.z += z;

        float phase = isX? hit.y : hit.x;
        offset += 2.4;
        phase += sin(iTime * _Temporal + offset);
        phase += sin(phase * 6.) * 0.5;
        phase *= _FrequencyY;

        vec3 rand = hash31(floor(phase));

        //z animation
        p.z += rand.x * zOffset;
        p.z += float(i) * 10.;
        //frequency in z
        p.z *=	_FrequencyZ / (rand.y + 0.05);
        p.z += sin( p.z * 10.);
        // p.z += cos( p.z * 17.) * 0.5;
        vec2 cell = fract(vec2(phase, p.z)) - 0.5;

        float cellID = floor(p.z);
        vec2 cellRand = hash21(cellID);
        float ax = abs(cell.x);
        float ay = abs(cell.y);
        float fx = fwidth(ax) * 1.;
        float fy = fwidth(ay) * 1.;

        //float d = 0.45;
        float d = 0.1 + cellRand.y * 0.3;
        float outer = smoothstep(fx, 0., ax - d + fx) * smoothstep(fy, 0., ay - d + fy);
        float inner = smoothstep(fx, 0., ax -d + fx * 2.) * smoothstep(fy, 0., ay - d + fy * 2.);

        float outerGlow = smoothstep(0.1, 0., ax - d );
        outerGlow *= smoothstep(0.5, 0., ay);
        float b = outer - inner;
        b += outerGlow * 0.25;
        b *= smoothstep(50., 20., hit.z);
        b *= 0.5 + rand.z;
        color += spectrum((cellRand.x - hue) * 0.25) * b;
    }
    //color *= 2.;
    color = sqrt(color);
    color *= 1. - dot(uv, uv);
    fragColor = vec4(color,1.0);
}