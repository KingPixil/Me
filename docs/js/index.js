var canvas = document.getElementById("canvas")
var gl = canvas.getContext("webgl")
var seed = Math.random()*7
var looping = false
var shaderVertex, shaderGradient, widthHandle, heightHandle, seedHandle

function update() {
	canvas.width = canvas.offsetWidth
	canvas.height = canvas.offsetHeight
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
	gl.clearColor(0, 0, 0, 0)
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.uniform1f(widthHandle, gl.canvas.width)
	gl.uniform1f(heightHandle, gl.canvas.height)
	gl.uniform1f(seedHandle, seed+=0.001)
	gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function loop() {
	update()

	if (looping)
		requestAnimationFrame(loop)
}

function download(next) {
	shaderVertex = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(shaderVertex, "attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0, 1);}")
	gl.compileShader(shaderVertex)

	fetch(document.querySelector("#shader-gradient").src)
		.then(function(res) {return res.text()})
		.then(function(shaderGradientSource) {
			shaderGradient = gl.createShader(gl.FRAGMENT_SHADER)
			gl.shaderSource(shaderGradient, shaderGradientSource)
			gl.compileShader(shaderGradient)
			next()
		})
}

function setup() {
	var buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0,  1.0,
			-1.0,  1.0,
			1.0, -1.0,
			1.0,  1.0]),
		gl.STATIC_DRAW
	)

	var program = gl.createProgram()
	gl.attachShader(program, shaderVertex)
	gl.attachShader(program, shaderGradient)
	gl.linkProgram(program)
	gl.useProgram(program)

	var positionLocation = gl.getAttribLocation(program, "a_position")
	widthHandle = gl.getUniformLocation(program, "width")
	heightHandle = gl.getUniformLocation(program, "height")
	seedHandle = gl.getUniformLocation(program, "seed")
	gl.enableVertexAttribArray(positionLocation)
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

	update()
	window.onresize = update
	window.onkeyup = function(event) {
		if (event.key === "Enter") {
			if (looping) looping = false
			else {
				looping = true
				requestAnimationFrame(loop)
			}
		}
	}
}

download(setup)
