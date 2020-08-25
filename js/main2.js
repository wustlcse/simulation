var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 2060 - margin.right - margin.left,
    height = 1700 - margin.top - margin.bottom;

var i = 0;
var duration = 1000;
var root;

var duplicate_count_dict = {};

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/amphibia copy.json", function(error, json_data) {
    if (error) throw error;

    root = json_data;
    root.x0 = height / 2;
    root.y0 = 0;

    console.log(root);
    function collapse(d)
    {
        if (d.children)
        {
            d.children_swap = d.children;
            d.children_swap.forEach(collapse);
            d.children = null;
        }
    }

    root.children.forEach(collapse);
    update(root);
    imitation();
    // document.getElementById("Batrachia").dispatchEvent(new Event('click')); this works, jquery's trigger.click() doesn't.
});

function update(source) {

    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    nodes.forEach(function(d) { d.y = d.depth * 180; });

    var node = svg.selectAll("g.node")
        .data(nodes, function(d)
        {
            //console.log(d.id);
            return d.id || (d.id = ++i);
        })
    ;

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click)
        .attr("id", function (d) {
            var temp_id = d.name + d.depth.toString();
            if (d.name in duplicate_count_dict)
            {
                duplicate_count_dict[d.name] +=1;
            }
            else
            {
                duplicate_count_dict[d.name] = 0;
            }

            return temp_id;
        });


    nodeEnter.append("circle")
        .attr("r", 7)
        .style("fill", function(d) { return d.children_swap ? "green" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", -10)
        .attr("class", "label")
        .attr("dy", ".05em")
        .attr("text-anchor", "end")
        .text(function(d) { return d.name; })
        .style("fill-opacity", 0.1);

    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 7)
        .style("fill", function(d) { return d.children_swap ? "green" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 0);

    nodeExit.select("text")
        .style("fill-opacity", 0);

    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function click(d)
{
    console.log(d.name + " clicked!");
    if (d.children) 
    {
        d.children_swap = d.children;
        d.children = null;
    } 
    else {
        d.children = d.children_swap;
        d.children_swap = null;
    }
    update(d);
}

function imitation(){
    d3.json("data/mturk-data-exploratoryCondition copy.json", function(error, data) {

        console.log("in imitation");
        var imitation_task = JSON.parse(data[0]['task1']);
        var counter = 0;
        var start_time = imitation_task['starttime'];
        var sequence = imitation_task['interactions'].slice();
        for (counter = 0; counter < sequence.length; counter++) {
            sequence[counter]['act_time'] = (sequence[counter].timestamp-start_time);
        }

        console.log(sequence);

        var counter = 0;

        function myLoop()
        {

            setTimeout(function()
            {
                console.log(counter);
                var current_move = sequence[counter];
                var curent_event = current_move.event;
                var curent_reference_id = current_move.name + current_move.depth.toString();
                console.log(current_move);
                if (curent_event == 'hover'){
                    $('[id="' + curent_reference_id + '"]').children().css('fill', 'red');
                }
                else{
                    $('[id="' + curent_reference_id + '"]').children().css('fill', 'red');
                    document.getElementById(curent_reference_id).dispatchEvent(new Event('click'));
                }


                counter++;
                if (counter < sequence.length)
                {
                    myLoop();
                }
            }, 3000)
        }

        myLoop();


    });
}


