
var margin = {top: 40, right: 90, bottom: 50, left: 90},
  width = 660 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("class", "svg-content")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/amphibia copy.json", function(data) {

    var cluster = d3.tree()
        .size([width, height]);

    var root = d3.hierarchy(data, function(d) {
        return d.children;
    });
    cluster(root);

    console.log(root);

    // links between nodes
    svg.selectAll('path')
        .data( root.descendants().slice(1) )
        .enter()
        .append('path')
        .attr("d", function(d) {
            return "M" + d.x + "," + d.y
                + "C" + d.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + d.parent.y;
        })
        .style("fill", 'none')
        .attr("stroke", '#ccc')

    svg.selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .append("circle")
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .style("stroke-width", 2)
        .append("text")
        .attr("dy", ".35em")
        .attr("y", function(d) { return d.children ? -20 : 20; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.name; });

})