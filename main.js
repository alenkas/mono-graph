// Set the dimensions of the canvas / graph
var margin = {
        top: 30,
        right: 30,
        bottom: 50,
        left: 30
    },
    width = 650 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function get_month(month_number) {
    switch (month_number) {
        case month_number:
            return months[month_number];
    }
}

var url = "data.json";

// Parse the date / time
var parseDate = d3.time.format("%Y-%m-%d").parse,
    formatDate = d3.time.format("%d-%b"),
    bisectDate = d3.bisector(function (d) {
        return d.datetime;
    }).left;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(d3.time.days, 1).tickFormat(d3.time.format("%d %b"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(3);

// Define the line for store
var valueline = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y(d.store);
    });

// Define the line for store
var valueline_sum = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y(d.value);
    });

// Create SVG element
var svg = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create SVG element
var sum = d3.select(".sum")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//console.log(width, height, margin.left, margin.top);

var svgElement = document.getElementsByClassName("chart");
var svgElementPosition = svgElement[0].getBoundingClientRect();
console.log(svgElementPosition);

var tooltip = d3.select("#tooltip")
    .style("left", svgElementPosition.left + margin.left * 1.5 + "px")
    .style("top", svgElementPosition.top + margin.top * 1.5 + "px")
    .style("display", "none");

var legend = d3.select("#legend");
legend.style("margin-top", margin.top + "px");

function make_x_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.days, 1);
}

function make_y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
}

//not sure if it's used
//var lineSvg = svg.append("g");

var focus = svg.append("g")
    .attr("class", "hover")
    .style("display", "none");

d3.json(url, function (error, data) {

    if (error) return console.warn(error);

    color.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "datetime";
    }));

    data.forEach(function (d) {
        d.datetime = parseDate(d.datetime);
    });

    var stores = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {datetime: d.datetime, store: +d[name]};
            })
        };
    });

    x.domain(d3.extent(data, function (d) {
        return d.datetime;
    }));

    y.domain([
        d3.min(stores, function (c) {
            return d3.min(c.values, function (v) {
                return v.store;
            });
        }),
        d3.max(stores, function (c) {
            return d3.max(c.values, function (v) {
                return v.store;
            });
        })
    ]);

    // Draw horizontal lines
    svg.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
    );

    // Draw vertical lines
    svg.append("g")
        .attr("class", "y grid")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
    );

    // Draw horizontal lines
    sum.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
    );

    // Draw vertical lines
    sum.append("g")
        .attr("class", "y grid")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
    );

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Add the X Axis
    sum.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    // Add the Y Axis
    sum.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var store = svg.selectAll(".graph")
        .data(stores)
        .enter().append("g")
        .attr("class", "graph")
        .attr("id", function (d) {
            return d.name;
        });

    // Add the valueline path for stores.
    store.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("d", function (d) {
            return valueline(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    var store_sum = sum.append("g")
        .data(stores)
        .attr("class", "graph")
        .attr("id", "overall");

    // Add the valueline path for stores.
    store_sum.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("d", function (d) {
            //console.log(data[0].datetime);
            var number = [];;
            for (var i = 0; i < stores[0].values.length; i++){
                number.push({
                    datetime: data[i].datetime,
                    value: 0
                });
            }
            for(var i = 0; i < stores.length; i++){
                //console.log(stores[i]);
                for(var j = 0; j < stores[i].values.length; j++){
                    //console.log(stores[i].values[j].store);
                    //console.log(number[j]);
                    number[j].value += parseInt(stores[i].values[j].store);
                    //console.log(number[j], stores[i].values[j].store);
                }
            }
            //console.log(number);
            return valueline_sum(number);
        })
        .style("stroke", "#000");

    legend.append("div")
        .attr("id", "legend-title")
        .text("Stores")
        .append("span")
        .attr("id", "refresh")
        .attr("class", "ui-icon ui-icon-arrowrefresh-1-e")
        .on("click", update_graphs);

    var legend_section = legend.selectAll(".legend-item")
        .data(stores)
        .enter().append("div")
        .attr("class", function(d){
            return "legend-item " + "legend-item-" + d.name;
        })
        .attr("width", width / 4)
        .attr("height", height / 4)
        .attr("data-store", function (d) {
            return d.name;
        })
        .on("click", click_function)
        .on("mouseover", hover)
        .on("mouseout", mouseout);

    legend_section.append("div")
        .attr("class", "legend-swatch")
        .style("background-color", function (d) {
            return color(d.name);
        });

    legend_section.append("div")
        .attr("class", "legend-title")
        .attr("data-store", function (d) {
            return d.name;
        })
        .text(function (d) {
            return d.name;
        });

    tooltip.append("div")
        .attr("id", "tooltip-title")
        .style("font-weight", "bold")
        .text("Stores");

    var tooltip_section = tooltip.selectAll(".graph")
        .data(stores)
        .enter().append("div")
        .attr("class", function (d) {
            return "tooltip-section " + d.name;
        });

    tooltip_section.append("div")
        .attr("class", "tooltip-swatch")
        .style("background-color", function (d) {
            return color(d.name);
        });

    tooltip_section.append("div")
        .attr("class", "tooltip-title")
        .attr("title", function (d) {
            return d.name;
        })
        .text(function (d) {
            return d.name;
        });

    tooltip_section.append("div")
        .attr("class", "tooltip-value")
        .text(function (d) {
            // return last value
            return d.values[d.values.length - 1].store;
        });


    // don't know what's this for
    // Add the valueline path.
    //lineSvg.append("path")
    //    .attr("class", "line")
    //    .attr("d", valueline(data));

    // append the x line
    focus.append("line")
        .data(stores)
        .attr("class", "x")
        .style("stroke", function (d) {
            return color(d.name);
        })
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the circle at the intersection
    focus.selectAll("circle")
        .data(stores)
        .enter().append("circle")
        .attr("class", function (d) {
            return d.name;
        })
        .style("fill", "#FFFFFF")
        .style("stroke", function (d) {
            return color(d.name);
        })
        .attr("r", 4);

    // append the rectangle to capture mouse
    svg.append("rect")
        .data(stores)
        .attr("width", width)
        .attr("height", height)
        .attr("class", "rect-capture-mouse")
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () {
            tooltip.style("display", null);
            focus.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;

        //focus.selectAll("circle")
        //    .data(stores)
        //    .attr("value", function(d){
        //        return d.name;
        //    })
        //    .attr("transform", function(d){
        //        console.log(d.values, d.name, d);
        //        return  "translate(" + x(d.datetime) + "," +
        //            y(d.name) + ")";
        //    });

        focus.select("circle.fb")
            .attr("value", d.fb)
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.fb) + ")");

        focus.select("circle.play")
            .attr("value", d.play)
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.play) + ")");

        focus.select("circle.appstore")
            .attr("value", d.appstore)
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.appstore) + ")");

        focus.select(".x")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            0 + ")")
            .attr("y2", height);

        focus.select(".y")
            .attr("transform",
            "translate(" + width * -1 + "," +
            y(d.play) + ")")
            .attr("x2", width + width);

        tooltip.select("#tooltip-title")
            .text(function () {
                var month_number = d.datetime.getMonth();
                var date = d.datetime.getDate() + " " + get_month(month_number) + " " + (d.datetime.getFullYear() + 1);
                return date;
            });

        tooltip.selectAll(".tooltip-value")
            .data(stores)
            .text(function (d) {
                var value = d3.select("circle." + d.name).attr("value");
                return value;
            });
    }
});

function update_graphs() {
    d3.json("data1.json", function (error, data) {

        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "datetime";
        }));

        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
        });

        var stores = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {datetime: d.datetime, store: +d[name]};
                })
            };
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([
            d3.min(stores, function (c) {
                return d3.min(c.values, function (v) {
                    return v.store;
                });
            }),
            d3.max(stores, function (c) {
                return d3.max(c.values, function (v) {
                    return v.store;
                });
            })
        ]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart");

        // Redraw vertical grid
        svg.select(".grid.x")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
        );

        //Redraw horizontal grid
        svg.select(".grid.y")
            //.attr("transform", "translate(0," + height + ")")
            .call(make_y_axis()
                .tickSize(-width, 0, 0)
                .tickFormat("")
        );

        var store = svg.selectAll(".graph")
            .data(stores);

        store.select("path")
            .transition()
            .duration(750)
            .attr("d", function (d) {
                return valueline(d.values);
            })
            .style("display", "inline");

        //append the rectangle to capture mouse
        svg.select(".rect-capture-mouse")
            .data(stores)
            .attr("width", width)
            .attr("height", height)
            //.attr("rect-capture-mouse")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function () {
                tooltip.style("display", null);
                focus.style("display", null);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;

            focus.select("circle.fb")
                .attr("value", d.fb)
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.fb) + ")");

            focus.select("circle.play")
                .attr("value", d.play)
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")");

            focus.select("circle.appstore")
                .attr("value", d.appstore)
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.appstore) + ")");

            focus.select(".x")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                0 + ")")
                .attr("y2", height);

            focus.select(".y")
                .attr("transform",
                "translate(" + width * -1 + "," +
                y(d.play) + ")")
                .attr("x2", width + width);

            tooltip.select("#tooltip-title")
                .text(function () {
                    var month_number = d.datetime.getMonth();
                    var date = d.datetime.getDate() + " " + get_month(month_number) + " " + (d.datetime.getFullYear() + 1);
                    return date;
                });

            tooltip.selectAll(".tooltip-value")
                .data(stores)
                .text(function (d) {
                    var value = d3.select("circle." + d.name).attr("value");
                    return value;
                });
        }

        // update the x axis
        svg.select(".x.axis")
            //.duration(750)
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // update the y axis
        svg.select(".y.axis")
            //.duration(750)
            .call(yAxis);

    });
}

function hide_element(){
    var element_classes = d3.select(this).attr("class");
    return element_classes + " hidden";
}

function transparent_element(){
    var element_classes = d3.select(this).attr("class");
    return element_classes + " transparent";
}

function hide_graph(graph_id) {
    d3.selectAll("#" + graph_id + ", circle." + graph_id + ", .tooltip-section." + graph_id)
        .attr("class", hide_element);
    d3.selectAll(".legend-item").filter(function(){
       if(!d3.select(this).classed("legend-item-hidden")){
           //console.log(true);
           d3.select(this)
               .classed("transparent", false);
           d3.selectAll(".graph").filter(function(){
               if(!d3.select(this).classed("hidden")){
                   d3.select(this)
                       .classed("transparent", false);
               }
           });
       }
    });
}

function show_graph(graph_id) {
    d3.selectAll("#" + graph_id + ", circle." + graph_id + ", .tooltip-section." + graph_id)
        .classed("hidden", false);
}

function hover() {
    var graph_id = this.getAttribute("data-store");
    var transparent = this.classList.contains("transparent");
    var focused = this.classList.contains("legend-item-focused");
    var hidden = this.classList.contains("legend-item-hidden");

    if(!hidden){
        this.classList.add("legend-item-focused");
    }

    d3.selectAll(".legend-item").filter(function(){
        // Check if current element is hidden
        if(!d3.select(this).classed("transparent")){
            //console.log(false);
            //console.log(d3.select(this));
            if(hidden){
                //console.log(true);
            } else if(!d3.select(this).classed("legend-item-focused")){
                //console.log(d3.select(this));
                d3.select(this)
                    .attr("class", transparent_element);
                d3.selectAll(".graph").filter(function() {
                    if(d3.select(this).attr("id") != graph_id){
                        //console.log(true);
                        d3.select(this)
                            .attr("class", transparent_element);
                    }
                });
            }
        }
    });


}

function mouseout() {
    this.classList.remove("legend-item-focused");
    d3.selectAll(".legend-item").filter(function(){
        // Check if current element is hidden
        if(d3.select(this).classed("transparent")){
            d3.select(this)
                .classed("transparent", false);
            d3.selectAll(".graph")
                .classed("transparent", false);
        }
    });
}

function click_function() {
    var graph_id = this.getAttribute("data-store");
    //console.log(graph_id);
    var hidden = this.classList.contains("legend-item-hidden");
    if (!hidden) {
        this.classList.add("legend-item-hidden");
        this.classList.remove("legend-item-focused");
        hide_graph(graph_id);
    } else if (hidden) {
        this.classList.remove("legend-item-hidden");
        show_graph(graph_id);
        // Currently not working
        //hover(this);
    }
}

