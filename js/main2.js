var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 2060 - margin.right - margin.left,
    height = 1700 - margin.top - margin.bottom;

var i = 0;
var duration = 1000;
var root;

var duplicate_count_dict = {};
var link_traverse_count_dict = {};
var people_data = [];
var thickness = d3.scale.linear()
    .domain([0, 20])
    .range([1,15]);

var tree = d3.layout.tree()
    .size([height, width])
    .nodeSize([40,])
    .separation(function separation(a, b) {
        return a.parent == b.parent ? 3 : 4;
    });

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("#table").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .append("g")
    .attr("transform", "translate(" + (margin.left + width/2) + "," + margin.top + ")")
    .style("z-index","5")
;

d3.json("data/amphibia copy.json", function(error, json_data) {
    if (error) throw error;

    root = json_data;
    root.x0 = width / 2;
    root.y0 = 0;

    //console.log(root);
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

    // console.log("nodes: ");
    // console.log(nodes);
    // console.log("links: ");
    // console.log(links);

    nodes.forEach(function(d) { d.y = d.depth * 180; });

    var node = svg.selectAll("g.node")
        .data(nodes, function(d)
        {
            //console.log(d.id);
            return d.id || (d.id = ++i);
        })
    ;

    var node_enter = node.enter().append("g")
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

    node_enter.append("circle")
        .attr("r", 7)
        .style("fill", function(d) { return d.children_swap ? "green" : "#fff"; });

    node_enter.append("text")
        .attr("x", -10)
        .attr("class", "label")
        .attr("dy", ".05em")
        .attr("text-anchor", "end")
        .text(function(d) { return d.name; })
        .style("fill-opacity", 0.1);

    var node_update = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node_update.select("circle")
        .attr("r", 7)
        .style("fill", function(d) { return d.children_swap ? "green" : "#fff"; });

    node_update.select("text")
        .style("fill-opacity", 1);

    var node_exit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    node_exit.select("circle")
        .attr("r", 0);

    node_exit.select("text")
        .style("fill-opacity", 0);

    var link = svg.selectAll("path.link")
        .data(links, function(d)
        {
            return d.target.id;
        });

    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("id",function (d) {
            return d['source'].name + d['source'].depth.toString()
            + d['target'].name + d['target'].depth.toString();
        })
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            // console.log("d");
            // console.log(d);
            // console.log("source");
            // console.log(source);
            // console.log("o");
            // console.log(o);
            // console.log("diagonal");
            // console.log(diagonal({source: o, target: o}));
            // return diagonal({source: o, target: o});
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

/*
A simple yet hacky way to loop through an array in a time-controlled fashion while
not violating Javascript timer's non-blocking mechanism; I suspect D3 might have implemented
transition in a similar fashion.
 */
function myLoop(sequence)
{
    var counter = 0;

    setTimeout(function()
    {
        //console.log(counter);
        var current_move = sequence[counter];
        var curent_event = current_move.event;
        var curent_reference_id = current_move.name + current_move.depth.toString();
        var current_link_reference_id = 'none';
        if (counter > 0)
        {
            current_link_reference_id = sequence[counter-1].name
                + sequence[counter-1].depth.toString() + curent_reference_id;
            if (current_link_reference_id in link_traverse_count_dict)
            {
                link_traverse_count_dict[current_link_reference_id] +=1;
            }
            else
            {
                link_traverse_count_dict[current_link_reference_id] = 0;
            }

            console.log(link_traverse_count_dict[current_link_reference_id]);
            console.log(thickness(link_traverse_count_dict[current_link_reference_id]));
            console.log(current_link_reference_id);
            $('[id="' + current_link_reference_id + '"]').css({"stroke": "red", 'stroke-width': thickness(link_traverse_count_dict[current_link_reference_id])});
        }
        //console.log(current_move);
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
            myLoop(sequence,counter);
        }
    }, 3000)
}

function imitation(){
    d3.json("data/mturk-data-exploratoryCondition copy.json", function(error, data) {

        console.log("in imitation");
        people_data = data.slice();
        for(var i = 0; i < people_data.length; ++i)
        {
            $("#select1").append( $("<option>")
                .val(people_data[i]['postId'])
                .html(people_data[i]['postId'])
            );
        }

        $(document).ready(function(){
            $("#select1").change(function(){
                var sel = document.getElementById('select1');
                var opt = sel.options[sel.selectedIndex];
                //console.log( opt.text );
                var select2 =
                    Object.getOwnPropertyNames(people_data.find(element => element['postId'] == opt.text)).filter(a => a.startsWith('task') && isNaN(a.charAt(a.length-1))!=true);
                console.log(select2);
                $(".option2").remove();
                for(let i = 0; i < select2.length; ++i)
                {
                    $("#select2").append( $("<option class='option2'>")
                        .val(select2[i])
                        .html(select2[i])
                    );
                }
            })
        });
        console.log(people_data);
        // var imitation_task = JSON.parse(people_data[0]['task1']);
        // var counter = 0;
        // var start_time = imitation_task['starttime'];
        // var sequence = imitation_task['interactions'].slice();
        // for (counter = 0; counter < sequence.length; counter++)
        // {
        //     sequence[counter]['act_time'] = (sequence[counter].timestamp-start_time);
        // }
        //
        // //console.log(sequence);
        //
        // var counter = 0;


        //myLoop(sequence,counter);
    });
}

function start_tasks() {
    var select1_choice = document.getElementById( "select1" );
    //console.log(typeof select1_choice.options[ select1_choice.selectedIndex ].value);
    var select2_choice = document.getElementById( "select2" );
    //console.log(typeof select2_choice.options[ select2_choice.selectedIndex ].value);

    var imitation_task = JSON.parse(people_data.find(element => element['postId'] == select1_choice.options[ select1_choice.selectedIndex ].value)[select2_choice.options[ select2_choice.selectedIndex ].value]);
    var sequence = imitation_task['interactions'].slice();
    myLoop(sequence);
}


