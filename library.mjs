/*jslint browser:true */
/*global Delaunator, performance*/

function createCanvas() {
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

function distance(point) {
    return Math.sqrt(point[0] * point[0] + point[1] * point[1]);
}

function normalise(point) {
    let d = distance(point);
    return [point[0] / d, point[1] / d];
}

function iterateVertices(vertices, moveDistance, rotation) {
    let previousVertices = vertices;
    let length = vertices.length;
    let newVertices = previousVertices.map(function (p, i) {
        let q;
        if (rotation) {
            q = previousVertices[(i + 1) % length];
        } else {
            q = previousVertices[(i + length - 1) % length];
        }
        let direction = [q[0] - p[0], q[1] - p[1]];
        let d = distance(direction);
        if (d < moveDistance) {
            return undefined;
        }
        let normalisedDirection = normalise(direction);
        let x = p[0] + normalisedDirection[0] * moveDistance;
        let y = p[1] + normalisedDirection[1] * moveDistance;
        return [x, y];
    });

    return newVertices.filter(function (p) {
        return p !== undefined;
    });
}

function renderVertices(context, vertices) {
    context.beginPath();
    vertices.forEach(function (v) {
        context.lineTo(v[0], v[1]);
    });
    context.lineTo(vertices[0][0], vertices[0][1]);
    context.stroke();
    context.fill();
}

function renderSpiral(context, vertices, moveDistance = 5, rotation = true) {
    renderVertices(context, vertices);
    let newVertices = iterateVertices(vertices, moveDistance, rotation);
    if (newVertices.length > 2) {
        renderSpiral(context, newVertices, moveDistance, rotation);
    }
}

function renderShapes(context, shapes, moveDistance, rotation) {
    shapes.forEach(function (shape) {
        renderSpiral(context, shape, moveDistance, rotation);
    });
}

function array_chunks(array, chunk_size) {
    let size = Math.ceil(array.length / chunk_size);
    return (new Array(size).fill().map(function (ignore, index) {
        return index * chunk_size;
    }).map(function (begin) {
        return array.slice(begin, begin + chunk_size);
    }));
}

function generateShapes(points) {
    let delaunay = Delaunator.from(points);
    let tris = array_chunks(delaunay.triangles, 3);
    return tris.map(function (t) {

        let newTri = Array.from(t).map(function (i) {
            return points[i];
        });
        return newTri;
    });
}

function init() {
    let canvas = createCanvas();
    let context = canvas.getContext("2d");
    return context;
}

function render() {
    let t = performance.now();
    //context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let n = Math.random() * noise * period;
    dist = 3 + 0.5 * amplitude * (1 + Math.sin((t + n) / period));

    let N = 10 * (n / period);
    let newPoints = points.map(function (p) {
        return [
            p[0] + Math.random() * N - N / 2,
            p[1] + Math.random() * N - N / 2
        ];
    });

    let shapes = generateShapes(newPoints);
    renderShapes(context, shapes, dist);
    window.requestAnimationFrame(render);
}

let count = 100;
let width = window.innerWidth;
let height = window.innerHeight;

let points = Array.from(new Array(count)).map(function () {
    return [Math.random() * width, Math.random() * height];
});

let context = init();
context.fillStyle = "white";
let period = 1000;
let amplitude = 4;
let noise = 0.4;
let dist = 5;
render();
