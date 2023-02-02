// set the dimensions and margins of the graph
const d3 = require("d3");
var Simplex = require("perlin-simplex");
var simplex = new Simplex();

const margin = { top: 30, right: 20, bottom: 30, left: 40 },
  data_size = 250,
  axis_size = Math.floor(Math.sqrt(data_size)),
  width = axis_size * 16, //500 - margin.left - margin.right,
  height = axis_size * 16; //500 - margin.top - margin.bottom;

// append the heatmap object to the body of the page
const heatmap = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("viewBox", "0 0 500 500")
  // .call(
  //   d3
  //     .zoom()
  //     .scaleExtent([0.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
  //     .extent([
  //       [0, 0],
  //       [width, height]
  //     ])
  //     .on("zoom", function (e) {
  //       heatmap.attr("transform", e.transform);
  //     })
  // )
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

let data = [];
for (let y = 0; y < axis_size; y++) {
  for (let x = 0; x < axis_size; x++) {
    let v = (simplex.noise(x / 10, y / 5) + 1) * 50;
    data.push({ x, y, value: v });
  }
}

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
const xs = [...Array(axis_size).keys()];
const ys = [...Array(axis_size).keys()];

// Add X axis
var x = d3.scaleBand().domain(xs).range([0, width]);
var xAxis = heatmap
  .append("g")
  .attr("transform", "translate(-10," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleBand().domain(ys).range([height, 0]);
var yAxis = heatmap
  .append("g")
  .attr("transform", "translate(-15, -10)")
  .call(d3.axisLeft(y));

// Build color scale
const myColor = d3
  .scaleSequential()
  .interpolator(d3.interpolateYlOrRd)
  .domain([1, 100]);

// create a tooltip
const tooltip = d3
  .select("#my_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "3px")
  .style("box-shadow", "0px 5px 10px 0px rgba(0,0,0,.4)")
  .style("padding", "8px 15px");

// Three function that change the tooltip when user hover / move / leave a cell
const mouseover = function (event, d) {
  tooltip
    .html("The exact value of this cell is:<br/> " + d.value)
    .style("opacity", 1)
    .style("left", `${event.offsetX + 45}px`)
    .style("top", `${event.offsetY + 105}px`)
    .style("border-color", myColor(d.value));

  d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", "1")
    .style("opacity", 1);
};
const mousemove = function (event, d) {};
const mouseleave = function (event, d) {
  tooltip.style("opacity", 0);
  d3.select(this).style("stroke", "none").style("opacity", 1);
};

// add the circles
async function drawHeatmap(heatmapData) {
  let start_time = new Date().getTime();
  await heatmap
    .selectAll()
    .data(heatmapData)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", (d) => d.value / 16)
    // .attr("width", width)
    // .attr("height", height)
    // .attr("class", "heatmap-circle")
    .style("fill", (d) => myColor(d.value))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  let end_time = new Date().getTime();

  document.getElementById("render-size").innerText = data_size.toLocaleString(
    "en"
  );
  document.getElementById("render-time").innerText = (
    (end_time - start_time) /
    1000
  ).toLocaleString("en");
}

drawHeatmap(data);
