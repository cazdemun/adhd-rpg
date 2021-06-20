const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL not supported');
}

// alert('WebGL enabled');

// vertexData = [...]

// create buffer
// load vertexData into buffer

// create vertex shader
// create fragment shader
// create program
// attach shaders to program

// enabler vertex attributes

// draw

const vertexData = [
  0, 1, 0,
  1, -1, 0,
  -1, -1, 0,
];

const colorVertex = [
  
]

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); // gl.DYNAMIC_DRAW

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
attribute vec3 position;
void main() {
  gl_Position = vec4(position, 1);
}
`) // openGL shader language
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
void main() {
  gl_FragColor = vec4(1, 0, 0, 1);
}
`);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);