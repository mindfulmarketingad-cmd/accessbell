// Animated "silk ribbon" background for the homepage hero (WebGL).
// Decorative only: hidden from assistive technology, paused off-screen,
// and rendered as a still frame when the visitor prefers reduced motion.
(function () {
  'use strict';
  var canvas = document.querySelector('[data-flow]');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
  if (!gl) {
    canvas.setAttribute('data-fallback', 'true');
    return;
  }

  var vertexSrc = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  // Simplex noise (Ashima Arts / Stefan Gustavson, MIT) drives the organic flow.
  var fragmentSrc = [
    'precision highp float;',
    'uniform vec2 r;uniform float t;',
    'uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 c4;',
    'vec3 perm(vec3 x){return mod(((x*34.)+1.)*x,289.);}',
    'float sn(vec2 v){',
    '  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);',
    '  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
    '  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
    '  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.);',
    '  vec3 p=perm(perm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
    '  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
    '  vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;',
    '  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);',
    '  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);',
    '}',
    'vec3 ramp(float g){',
    '  vec3 c=mix(c1,c2,smoothstep(0.,.35,g));',
    '  c=mix(c,c3,smoothstep(.3,.65,g));',
    '  return mix(c,c4,smoothstep(.62,1.,g));',
    '}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/r;',
    '  float asp=r.x/r.y;',
    '  float x=uv.x*asp;',
    '  float y=uv.y;',
    '  float tt=t*.05;',
    // Two overlapping ribbons sweep diagonally and drift slowly.
    '  float center=asp*.80+(y-.5)*asp*.34+.07*sin(y*2.4+tt*3.)+.06*sn(vec2(y*1.2,tt*1.3));',
    '  float width=asp*(.12+.035*sin(y*2.2-tt*2.1));',
    '  float d=(x-center)/width;',
    '  float center2=center-asp*.10+.05*sin(y*3.1-tt*2.4);',
    '  float d2=(x-center2)/(width*.62);',
    // Crisp edges, like fabric rather than smoke.
    '  float a1=smoothstep(1.,.86,abs(d));',
    '  float a2=smoothstep(1.,.84,abs(d2));',
    // Folds: bright and dark bands along the ribbon, like light on silk.
    '  float f1=sin(d*2.4+y*6.5+sn(vec2(d*.7,y*1.4+tt))*1.8+tt*4.);',
    '  float f2=sin(d2*2.+-y*5.5+sn(vec2(d2*.6+3.,y*1.1-tt))*1.6+tt*3.4);',
    '  float g1=clamp(.5+.42*d+.22*sin(y*2.3+tt*1.7)+.12*sn(vec2(y*1.7,tt)),0.,1.);',
    '  float g2=clamp(.58+.4*d2+.22*sin(y*1.9-tt*1.5+2.)+.12*sn(vec2(y*1.4+7.,tt)),0.,1.);',
    '  vec3 col1=ramp(g1)*(.74+.36*(.5+.5*f1))+.22*pow(max(f1,0.),6.);',
    '  vec3 col2=ramp(g2)*(.78+.32*(.5+.5*f2))+.2*pow(max(f2,0.),6.);',
    // Premultiplied "over": the second ribbon sits on top of the first.
    '  vec4 o=vec4(col2*a2,a2)+vec4(col1*a1,a1)*(1.-a2);',
    // Keep the text column clear and soften the bottom edge of the section.
    '  gl_FragColor=o*smoothstep(.5,.64,uv.x)*smoothstep(0.,.16,uv.y);',
    '}',
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = compile(gl.VERTEX_SHADER, vertexSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
  var prog = vs && fs && gl.createProgram();
  if (!prog) {
    canvas.setAttribute('data-fallback', 'true');
    return;
  }
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.setAttribute('data-fallback', 'true');
    return;
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var hex = function (h) {
    return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  };
  // Brand palette: ink, deep green, sage, warm light.
  var palette = { c1: '#353A47', c2: '#3E7B57', c3: '#84B082', c4: '#F1DFA8' };
  Object.keys(palette).forEach(function (k) {
    gl.uniform3fv(gl.getUniformLocation(prog, k), hex(palette[k]));
  });
  var uRes = gl.getUniformLocation(prog, 'r');
  var uTime = gl.getUniformLocation(prog, 't');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = true;
  var running = false;
  var start = performance.now() - 40000; // start mid-motion rather than at t=0
  var frame = 0;

  function draw(now) {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    frame = requestAnimationFrame(loop);
  }

  function update() {
    var shouldRun = visible && !document.hidden && !reduce.matches;
    if (shouldRun && !running) {
      running = true;
      frame = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
    if (!running) draw(start + 52000); // still frame
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      update();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', update);
  if (reduce.addEventListener) reduce.addEventListener('change', update);
  window.addEventListener('resize', function () {
    if (!running) update();
  });
  canvas.setAttribute('data-ready', 'true');
  update();
})();
