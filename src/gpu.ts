// Just for syntax highlighting
const glsl = identity
function identity(template: TemplateStringsArray, ...args: any[]) {
    let string = ''
    for (let i = 0; i < args.length; i++) {
        string += template[i] + String(args[i])
    }
    return string + template[template.length - 1]
}

const canvas = document.createElement('canvas');

export function test() {
  const width = 1024;
  const height = 1024;

  canvas.width  = width;
  canvas.height = height;

  const maybeGl = canvas.getContext('webgl2');
  if (!maybeGl)
    throw new Error('webgl2_required');

  const gl = maybeGl;

  gl.clearColor(0, 0, 0, 0);

  // Vertext Shader
  const vsSource = glsl`#version 300 es
    precision highp float;
    layout (location=0) in vec4 position;

    out vec2 clipPosition;

    void main() {
      clipPosition = position.xy;
      gl_Position = position;
    }
  `;

  // Fragment shader
  const fsSource = glsl`#version 300 es
    precision highp float;
    precision highp int;

    in vec2 clipPosition;
    out vec4 outputVector;

    uniform uvec4 dimensions;
    uniform sampler2D u_data;

    void main() {
      uint width  = (dimensions[1] << 8) | (dimensions[0] << 0);
      uint height = (dimensions[3] << 8) | (dimensions[2] << 0);

      vec2 zeroToOne = clipPosition * 0.5 + 0.5;
      uvec2 position = uvec2(
        uint(zeroToOne.x * float(width)),
        uint(zeroToOne.y * float(height))
      );

      uint index = position.x + position.y * width;
      vec4 data = texture(u_data, zeroToOne);

      outputVector = vec4(
        data[0],
        data[1],
        data[2],
        data[3]
      );
    }
  `;

  const program = setup(gl, vsSource, fsSource)

  // Construct simple 2D geometry
  const triangleArray = gl.createVertexArray();
  gl.bindVertexArray(triangleArray);

  // Vertex Positions, 2 triangles
  const positions = new Float32Array([
    -1, -1,
    -1,  1,
     1,  1,
     1, -1,
     1,  1,
    -1, -1,
  ]);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const dimensionsLocation = gl.getUniformLocation(program, 'dimensions');
  const dimensionsBytes = new Uint8Array(4);
  const dimensions = new Uint16Array(dimensionsBytes.buffer)
  dimensions[0] = gl.drawingBufferWidth
  dimensions[1] = gl.drawingBufferHeight

  const dataLocation = gl.getUniformLocation(program, 'u_data');
  const dataBytes = new Uint8Array(
    Array.from({ length: width * height * 4 })
      .map((_, index) => index)
  );
  const dataTextureUnit = 0

  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + dataTextureUnit)
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width, height, 0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    dataBytes,
  );


  // Input & run

  const start = performance.now()

  gl.uniform4uiv(dimensionsLocation, Array.from(dimensionsBytes));
  gl.uniform1i(dataLocation, dataTextureUnit)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(
    0,
    0,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );

  const end = performance.now()

  console.log(end - start)

  return Array.from(pixels)
}

function setup(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
    throw new Error('Could not create vertex shader');
  }

  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error('Vertex shader: ' + gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    throw new Error('Could not create vertex shader');
  }

  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error('Fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  if (!program)
    throw new Error('Could not create WebGL program');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw gl.getProgramInfoLog(program);

  gl.useProgram(program);

  return program
}
