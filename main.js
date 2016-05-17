// Set the dimensions of the canvas / graph
var margin = {
        top: 30,
        right: 300,
        bottom: 50,
        left: 30
    },
    width = 950 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function get_month(month_number){
    switch(month_number){
        case month_number:
            return months[month_number];
    }
}

var data;

var yTranslate = 0;

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
    .orient("left").ticks(5);

// Define the line for store
var valueline = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y(d.store);
    });

// Create SVG element
var svg = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("#tooltip")
    .style("left", margin.left * 1.6 + "px")
    .style("top", margin.top * 2.2 + "px")
    .style("display", "none");

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
    .attr("class", "hover");

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

    var store = svg.selectAll(".city")
        .data(stores)
        .enter().append("g")
        .attr("class", "store")
        .attr("id", function (d) {
            return d.name;
        });

    // Add the valueline path for stores.
    store.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return valueline(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    var legend = svg.append("g")
        .attr("transform", "translate(" + (width + margin.left) + ",0)");

    legend.append("rect")
        .attr("stroke", "#ccc")
        .attr("stroke-width", .4)
        .attr("fill", "none")
        .attr("width", width / 4)
        .attr("height", height / 4);

    var legend_group = legend.selectAll("g")
        .data(stores)
        .enter().append("g")
        .attr("class", "legend");

    legend_group.append("rect")
        .attr("class", "rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("id", function (d) {
            return d.name + "1";
        })
        .style("fill", function (d) {
            return color(d.name);
        })
        .attr("transform", function (d) {
            yTranslate += 20;
            return "translate(20, " + yTranslate + ")";
        });

    yTranslate = 10;

    legend_group.append("text")
        .attr("class", "legend-text")
        .attr("data-store", function(d){
            return d.name;
        })
        .attr("transform", function () {
            yTranslate += 20;
            return "translate(40, " + yTranslate + ")";
        })
        .text(function (d) {
            return d.name;
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
            tooltip.style("display", "none")
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);

    tooltip.append("div")
        .attr("id", "tooltip-title")
        .style("font-weight", "bold")
        .text("Stores");

    var tooltip_section = tooltip.selectAll(".store")
        .data(stores)
        .enter().append("div")
        .attr("class", "tooltip-section");

    tooltip_section.append("div")
        .attr("class", "tooltip-swatch")
        .style("background-color", function(d){
            return color(d.name);
        });

    tooltip_section.append("div")
        .attr("class", "tooltip-title")
        .attr("title", function(d){
            return d.name;
        })
        .text(function(d){
            return d.name;
        });
    //not sure if it's needed
    //tooltip_section.append("div")
    //    .attr("class", "tooltip-value")
    //    .text(function(d){
    //        return d.values[d.values.length - 1].store;
    //    });

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
            .text(function(){
                var month_number = d.datetime.getMonth();
                var date = d.datetime.getDate() + " " + get_month(month_number)  + " " + (d.datetime.getFullYear() + 1);
                return date;
            });

        tooltip.selectAll(".tooltip-value")
            .data(stores)
            .text(function(d){
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

        var store = svg.selectAll(".store")
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
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.fb) + ")");

            focus.select("circle.play")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")");

            focus.select("circle.appstore")
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
                .text(function(){
                    var month_number = d.datetime.getMonth();
                    var date = d.datetime.getDate() + " " + get_month(month_number)  + " " + (d.datetime.getFullYear() + 1);
                    return date;
                });

            tooltip.selectAll(".tooltip-value")
                .data(stores)
                .text(function(d){
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

function select_store_graph(store_id) {
    // Select the section we want to apply our changes to
    var svg = d3.select(".chart").transition();

    svg.selectAll(".store").filter(function(d){
        d3.select(this)
            .style("display", "none");
        svg.select("#" + store_id)
            .style("display", null);
    });


    focus.select("circle." + store_id)
        .style("display", null);
}

function deselect_store_graph(store_id) {

    // Select the section we want to apply our changes to
    var svg = d3.select(".chart").transition();

    svg.selectAll(".store").filter(function(d){
        d3.select(this)
            .style("display", null);
    });

    focus.select("circle." + store_id)
        .style("display", "none");

}

d3.select("#update").on("click", update_graphs);

var clicked = false;
window.onload = function(){
    console.log("loaded");
    d3.selectAll(".legend-text").on("click", function () {
        var store_id = this.getAttribute("data-store");
        if (clicked) {
            select_store_graph(store_id);
            clicked = false;
        } else {
            deselect_store_graph(store_id);
            clicked = true;
        }
    });
};