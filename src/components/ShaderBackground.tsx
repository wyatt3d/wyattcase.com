"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;

// hash + value noise
float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++){
    v += a * noise(p);
    p = rot * p * 2.03 + 17.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
  p *= 1.6;

  float t = uTime * 0.045;

  // Inigo-Quilez-style domain warping for organic river-delta flow.
  vec2 q = vec2(
    fbm(p + vec2(0.0, t)),
    fbm(p + vec2(5.2, 1.3) - vec2(t * 0.4, 0.0))
  );
  vec2 r = vec2(
    fbm(p + 3.4 * q + vec2(1.7, 9.2) + vec2(t, t * 0.7)),
    fbm(p + 3.4 * q + vec2(8.3, 2.8) - vec2(t * 0.6, t * 0.3))
  );
  float f = fbm(p + 3.0 * r);

  // Cinematic palette: deep slate -> cool teal -> dark amber -> highlight gold.
  vec3 c1 = vec3(0.022, 0.030, 0.040);
  vec3 c2 = vec3(0.10, 0.14, 0.16);
  vec3 c3 = vec3(0.42, 0.28, 0.12);
  vec3 c4 = vec3(0.95, 0.66, 0.28);

  vec3 col = mix(c1, c2, smoothstep(0.0, 0.55, f));
  col = mix(col, c3, smoothstep(0.40, 0.78, length(r)));
  col = mix(col, c4, smoothstep(0.74, 1.08, f + 0.30 * length(q)));

  // Horizontal warm/cool bias echoing the reference: cool left, warm right.
  float bias = smoothstep(0.10, 0.92, uv.x + 0.06 * (q.x - 0.5));
  vec3 cool = col * vec3(0.70, 0.88, 1.10);
  vec3 warm = col * vec3(1.20, 1.02, 0.78);
  col = mix(cool, warm, bias);

  // Vignette.
  vec2 vp = uv - 0.5;
  float vig = smoothstep(0.95, 0.15, length(vp) * 1.02);
  col *= vig * 0.88 + 0.12;

  // Grain.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.022;

  // Gentle filmic curve.
  col = col / (col + vec3(0.85));
  col = pow(col, vec3(0.92));

  outColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("shader compile: " + log);
  }
  return sh;
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("program link:", gl.getProgramInfoLog(prog));
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    gl.useProgram(prog);

    // Cap DPR for performance; respect reduced motion.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      const w = Math.floor(canvas!.clientWidth * dpr);
      const h = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    let raf = 0;
    let lost = false;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
    });

    function frame(now: number) {
      if (lost) return;
      const t = (now - start) / 1000;
      gl!.uniform1f(uTime, reducedMotion ? 0 : t);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 h-full w-full"
    />
  );
}
