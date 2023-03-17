let key = "pcGnhWmu0zUzapg4cSIamN0srWxqz33dY1PeegWP";
let start = "2023-03-15";
let end = "2023-03-15";
let url = `https://api.nasa.gov/DONKI/CME?startDate=${start}&endDate=${end}&api_key=${key}`;
let rotationSpeed = 350;
let defaultRotation = `millis() / ${rotationSpeed}`;

let canv;
let canvx;
const canvH = 150;
const canvW = 300;
const projectionWidth = canvW / 360;
const projectionHeight = canvH / 180;

let img;
let cmeArr;
let data;

function preload() {
  data = loadJSON(url);
}
function setup() {
  let myCanv = createCanvas(500, 500, WEBGL);
  myCanv.parent("solContainer");
  main(data);
}
function main(cme) {
  cmeArr = dataParse(cme);
  mapPoints(cmeArr);
  canvasSaver(canv);
}
function dataParse(events) {
  let retArr = [];
  let $list = $("<ul></>");
  for (let i = 0; i < Object.keys(events).length; i++) {
    let lat = events[i].cmeAnalyses[0].latitude || 0;
    let long = events[i].cmeAnalyses[0].longitude || 0;
    let coord = [
      lat,
      long,
      events[i].cmeAnalyses[0].time21_5,
      events[i].cmeAnalyses[0].speed,
      events[i].cmeAnalyses[0].type,
      events[i].cmeAnalyses[0].note,
    ];
    retArr.push(coord);
    let $listItem = $(`<li id="${coord[0]},${coord[1]}" class="eventListData">
    ${coord[2]}
    <details>
      <summary>Show More</summary>
      <h3>Type ${coord[4]} Event</h3>
      <ul>
        <li>Solar Coordinates: ${coord[0]}, ${coord[1]}</li>
        <li>Speed : ${coord[3]}</li>
        <li>Notes : ${coord[5]}</li>
      </ul>
    </details>
  </li>`);
    $list.append($listItem);
  }
  $("#listContainer").on("click", (e) => {
    coordSelector(e.target.id);
  });
  $("#listContainer").append($list);
  $("#solContainer").append($speedSlider);

  return retArr;
}
function mapPoints(arrOfXY) {
  canv = document.createElement("canvas");
  canvx = canv.getContext("2d");
  canvx.width = canvW;
  canvx.height = canvH;
  canvx.fillStyle = "orange";
  canvx.fillRect(0, 0, canvW, canvH);
  for (let i = 0; i < arrOfXY.length; i++) {
    let x = Math.floor(projectionWidth * (180 + arrOfXY[i][0]));
    let y = Math.floor(projectionHeight * (90 - arrOfXY[i][1]));
    canvx.fillStyle = 255;
    canvx.strokeRect(x, y, 1, 1);
    canvx.stroke();
  }
  canvasSaver(canv);
}
function canvasSaver(cavnasToSave) {
  img = cavnasToSave.toDataURL("image/png");
  img = loadImage(img);
}
function coordSelector(coords) {
  coords = coords.split(",");
  let lat = coords[0];
  let long = coords[1];
  let x = Math.floor(projectionWidth * (180 + parseInt(lat)));
  let y = Math.floor(projectionHeight * (90 - parseInt(long)));
  mapPoints(cmeArr);
  canvx.fillStyle = "red";
  canvx.fillRect(x - 5, y - 5, 10, 10);
  canvx.stroke();
  canvasSaver(canv);
}
function draw() {
  texture(img);
  noStroke();
  rotateY(eval(defaultRotation));
  sphere(200);
}
async function getDate() {
  console.log("what");
  start = $("#startDate").val();
  end = $("#endDate").val();
  url = `https://api.nasa.gov/DONKI/CME?startDate=${start}&endDate=${end}&api_key=pcGnhWmu0zUzapg4cSIamN0srWxqz33dY1PeegWP`;
  cmeArr = await $.get(url);
  $("#listContainer").empty();
  main(cmeArr);
}

let $dateEntry = $(
  `<label for="startDate">Starting Date</label>
  <input type="date" id = "startDate"/>
  <label for="endDate">End Date</label>
  <input type="date" id = "endDate"/>`
);
let $submitButton = $(`<input type="submit" value="Pull CME data"/>`);
$submitButton.on("click", (e) => {
  if ($("#startDate").val().length > 0 && $("#endDate").val().length > 0) {
    getDate();
  }
});
$("#dateContainer").append($dateEntry, $submitButton);

let $speedSlider = $(
  `<input type="range" min="150" max="3000" step = "100"id="speedRange"/>`
);
$speedSlider.on("mouseup", () => {
  rotationSpeed = $speedSlider.val();
  console.log(rotationSpeed);
  defaultRotation = `millis() / ${rotationSpeed}`;
});
$("#solContainer").append($speedSlider);
