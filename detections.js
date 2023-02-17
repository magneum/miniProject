const detections = await faceapi.detectAllFaces(input);

// resize the detected boxes in case your displayed image has a different size then the original
const detectionsForSize = faceapi.resizeResults(detections, {
  width: input.width,
  height: input.height,
});
// draw them into a canvas
const canvas = document.getElementById("overlay");
canvas.width = input.width;
canvas.height = input.height;
faceapi.drawDetection(canvas, detectionsForSize, { withScore: true });

const detectionsWithLandmarks = await faceapi
  .detectAllFaces(input)
  .withFaceLandmarks();

// resize the detected boxes and landmarks in case your displayed image has a different size then the original
const detectionsWithLandmarksForSize = faceapi.resizeResults(
  detectionsWithLandmarks,
  { width: input.width, height: input.height }
);
// draw them into a canvas
const canvas = document.getElementById("overlay");
canvas.width = input.width;
canvas.height = input.height;
faceapi.drawLandmarks(canvas, detectionsWithLandmarks, { drawLines: true });

const boxesWithText = [
  new faceapi.BoxWithText(new faceapi.Rect(x, y, width, height), text),
  new faceapi.BoxWithText(new faceapi.Rect(0, 0, 50, 50), "some text"),
];

const canvas = document.getElementById("overlay");
faceapi.drawDetection(canvas, boxesWithText);
