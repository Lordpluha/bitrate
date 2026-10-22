/* GLSL for the landing stage, ported verbatim from the motion prototype. */

/** Simplex noise (Ashima / Stefan Gustavson, MIT). */
const NOISE = `
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;i=mod(i,289.0);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`

/** One parametric surface (u,v) that becomes eight shapes; the vertex shader morphs between two of them:
    0 sphere · 1 torus · 2 wave ribbon · 3 vinyl · 4 trefoil knot · 5 spiked bloom · 6 helix ribbon · 7 dome. */
const SHAPES = `
      const float PI = 3.14159265;
      uniform float uTime;
      vec3 knot(float t){ float r = .62 + .28 * cos(3.0 * t); return vec3(r * cos(2.0 * t), r * sin(2.0 * t), .3 * sin(3.0 * t)); }
      vec3 shapeAt(float id, vec2 uv){
        float th = uv.x * 2.0 * PI; float ph = uv.y * PI;
        vec3 sph = vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th));
        if (id < .5) return sph;
        if (id < 1.5) { float a = uv.y * 2.0 * PI; float R = .9; float r = .34; return vec3((R + r * cos(a)) * cos(th), r * sin(a), (R + r * cos(a)) * sin(th)); }
        if (id < 2.5) { float x = (uv.x - .5) * 4.4; float z = (uv.y - .5) * 1.5; return vec3(x, sin(x * 1.7 + uTime * 1.3) * .34 * cos(z * 2.1) + sin(x * 5.0 - uTime * 2.4) * .05, z); }
        if (id < 3.5) { float r = .16 + uv.y * 1.12; return vec3(r * cos(th), .028 * sin(r * 96.0) * smoothstep(.3, .4, r), r * sin(th)); }
        if (id < 4.5) { float t = uv.x * 2.0 * PI; vec3 c = knot(t); vec3 T = normalize(knot(t + .01) - c); vec3 N = normalize(cross(T, vec3(0.0, 0.0, 1.0)) + vec3(1e-4)); vec3 B = cross(T, N); float a = uv.y * 2.0 * PI; return c + (N * cos(a) + B * sin(a)) * .15; }
        if (id < 5.5) { float sp = pow(abs(sin(th * 6.0) * sin(ph * 5.0)), 3.0); return sph * (1.0 + sp * .6); }
        if (id < 6.5) { float t = (uv.x - .5) * 3.4; float a = t * 2.3 + uTime * .5; float w = (uv.y - .5) * .9; vec3 d = vec3(cos(a), 0.0, sin(a)); return vec3(0.0, t * .85, 0.0) + d * (.42 + w * .5); }
        float p2 = uv.y * PI * .5; return vec3(sin(p2) * cos(th) * 1.3, cos(p2) * 1.3 - .45, sin(p2) * sin(th) * 1.3);
      }`

export const SURFACE_VERT = `${NOISE}${SHAPES}
      uniform float uA, uB, uMix, uAmp, uTwist, uPx;
      varying vec3 vN; varying vec3 vW; varying float vD; varying vec2 vUv; varying float vBurst;
      vec3 morph(vec2 uv, float m){ return mix(shapeAt(uA, uv), shapeAt(uB, uv), m); }
      void main(){
        float m = smoothstep(0.0, 1.0, clamp(uMix * 1.8 - uv.x * .4 - uv.y * .4, 0.0, 1.0));
        vec3 p = morph(uv, m);
        float e = .0025;
        vec3 cr = cross(morph(uv + vec2(e, 0.0), m) - p, morph(uv + vec2(0.0, e), m) - p);
        vec3 n = length(cr) > 1e-9 ? normalize(cr) : normalize(p + vec3(1e-4));
        float burst = sin(m * PI);
        float nz = snoise(p * 1.4 + vec3(uTime * .32, uTime * .21, 0.0));
        float d = nz * (uAmp + burst * .38);
        p += n * d;
        float ang = uTwist * p.y + burst * 1.4 * sin(uTime * .7);
        p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;
        vD = d; vUv = uv; vBurst = burst;
        vN = normalize(normalMatrix * n);
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vW = wp.xyz;
        vec4 mv = viewMatrix * wp;
        gl_PointSize = uPx * (1.0 + burst * 1.5) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`

export const SURFACE_FRAG = `
      uniform vec3 uCa, uCb, uCc; uniform float uAlpha, uTime;
      varying vec3 vN; varying vec3 vW; varying float vD; varying vec2 vUv; varying float vBurst;
      void main(){
        vec3 v = normalize(cameraPosition - vW);
        float f = pow(1.0 - abs(dot(v, vN)), 2.0);
        vec3 col = mix(uCa, uCb, smoothstep(-.25, .35, vD));
        col = mix(col, uCc, smoothstep(.45, 1.0, f) * .6);
        float scan = smoothstep(.46, .5, abs(fract(vUv.y * 46.0 - uTime * .25) - .5));
        col += f * .28 + scan * .12 + vBurst * .18;
        gl_FragColor = vec4(col, (.1 + f * .6 + scan * .1) * uAlpha);
      }`

export const SKIN_FRAG = `
      uniform vec3 uCa, uCb; uniform float uAlpha; varying vec2 vUv; varying float vBurst;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); gl_FragColor = vec4(mix(uCa, uCb, vUv.x), a * (.55 + vBurst * .4) * uAlpha); }`

/**
 * How the field morph staggers: particle progress is `smoothstep(uT * speed - seed * spread)`.
 * The stage repeats it on the CPU to freeze the field mid-morph, so both read these numbers.
 */
export const FIELD_MORPH = { speed: 1.4, spread: 0.4 } as const

/** The structured particle field: per-scene layouts in board pixels, morphed by uT. */
export const FIELD_VERT = `
        attribute vec3 aFrom; attribute vec3 aTo; attribute float aSeed; uniform float uT, uTime, uSize; uniform vec4 uBoard; uniform vec2 uView; varying float vSeed;
        void main(){
          float t = smoothstep(0.0, 1.0, clamp(uT * ${FIELD_MORPH.speed} - aSeed * ${FIELD_MORPH.spread}, 0.0, 1.0));
          vec3 b = mix(aFrom, aTo, t);
          float lift = sin(t * 3.14159) * 140.0 * (aSeed - .5);
          vec2 sp = uBoard.xy + (b.xy + vec2(lift, -abs(lift) * .6)) * uBoard.z;
          vec3 p = vec3((sp.x - uView.x * .5) * uBoard.w, -(sp.y - uView.y * .5) * uBoard.w, b.z * uBoard.z * uBoard.w);
          p += vec3(sin(uTime * .6 + aSeed * 40.0), cos(uTime * .5 + aSeed * 30.0), 0.0) * .012;
          vSeed = aSeed;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uSize * (.35 + aSeed * .8) / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`

export const FIELD_FRAG = `
        uniform vec3 uCol, uCol2; varying float vSeed;
        void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0.0, d); gl_FragColor = vec4(mix(uCol, uCol2, vSeed), a * .8); }`

/** Newton's cradle chrome: an analytic two-lobe matcap. */
export const CHROME_VERT =
  'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }'
export const CHROME_FRAG = `uniform vec3 uBase, uAccent, uTint; varying vec3 vN; varying vec3 vV;
        void main(){
          vec3 n = normalize(vN);
          float rim = pow(1.0 - max(dot(n, vV), 0.0), 3.0);
          float horizon = smoothstep(-.08, .08, n.y);
          vec3 body = mix(uBase * .35, uBase * 1.7, horizon) + uTint * smoothstep(.1, -.7, n.y) * .55;
          vec3 h1 = normalize(normalize(vec3(-.45, .75, .5)) + vV);
          vec3 h2 = normalize(normalize(vec3(.55, .25, .8)) + vV);
          float spec = pow(max(dot(n, h1), 0.0), 90.0) + pow(max(dot(n, h2), 0.0), 26.0) * .45;
          gl_FragColor = vec4(body + uAccent * spec + mix(uTint, uAccent, .5) * rim * .9, 1.0);
        }`
