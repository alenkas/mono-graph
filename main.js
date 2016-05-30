// Set the dimensions of the canvas / graph
var margin = {
        top: 30,
        right: 30,
        bottom: 50,
        left: 50
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

// Format large numbers by putting commas
var formatLargeNumbers = d3.format(",");

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);

//var y1 = d3.scale.linear()
//    .range([height, 0]);

var color = d3.scale.category10();

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(d3.time.days, 1).tickFormat(d3.time.format("%d %b"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(3).tickFormat(d3.format("s"));

//var yAxisTotal = d3.svg.axis().scale(y1)
//    .orient("left").ticks(5).tickFormat(d3.format("s"));

// Define the line for store
var valueline = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y(d.store);
    });

// Define the line for store
//var valueline_total = d3.svg.line()
//    .x(function (d) {
//        return x(d.datetime);
//    })
//    .y(function (d) {
//        return y1(d.value);
//    });

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

//function make_y_axis_total() {
//    return d3.svg.axis()
//        .scale(y1)
//        .orient("left")
//        .ticks(5);
//}

//not sure if it's used
//var lineSvg = svg.append("g");

var startDate;
var endDate;

$("#e1").daterangepicker({
    change: function () {
        var date = $("#e1").daterangepicker("getRange");
        var updated = d3.select(".chart").classed("updated");

        startDate = date.start;
        endDate = date.end;
        var input_start_date = document.getElementById("input_start_date");
        var input_end_date = document.getElementById("input_end_date");
        input_start_date.setAttribute("value", startDate);
        //input_end_date.value = endDate;
        input_end_date.setAttribute("value", endDate);
        //console.log(startDate, endDate);
        if (updated) {
            console.log(updated);
            update_graphs(true);
        } else {
            console.log(updated);
            render(true);
        }
    }
});

function render(filterByDates) {

    d3.json(url, function (error, data) {

        d3.selectAll('svg').remove();
        d3.select('#tooltip').select('div').remove();
        d3.select("#legend").select('div').remove();

        if (error) return console.warn(error);

        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "datetime";
        }));

        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
        });

        if (filterByDates) {
            data = data.filter(function (d) {
                return d.datetime >= startDate && d.datetime <= endDate;
            });
        }

        console.log(data);

        var stores = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {datetime: d.datetime, store: +d[name]};
                })
            };
        });

        //y.domain([
        //    d3.min(stores, function (c) {
        //        return d3.min(c.values, function (v) {
        //            return v.store;
        //        });
        //    }),
        //    d3.max(stores, function (c) {
        //        return d3.max(c.values, function (v) {
        //            return v.store;
        //        });
        //    })
        //]);


        // Overall graph

        //This one for counting overall users
        var count_total = function () {
            var number = [];
            // Fill array with zero values
            for (var k = 0; k < stores[0].values.length; k++) {
                number.push({
                    datetime: data[k].datetime,
                    store: 0
                });
            }
            // Overwrite array values with new ones
            for (var i = 0; i < stores.length; i++) {
                for (var j = 0; j < stores[i].values.length; j++) {
                    number[j].store += parseInt(stores[i].values[j].store);
                }
            }
            return number;
        };

        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));

        y.domain([
            0,
            d3.max(count_total(), function (d) {
                return Math.max(d.store);
            })
        ]);


        // Create SVG element
        var svg = d3.select(".chart")
            .classed("updated", false)
            .append("svg")
            .attr({
                "width": width + margin.left + margin.right,
                "height": height + margin.top + margin.bottom
            })
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Draw horizontal lines
        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
        );

        //// Draw vertical lines
        //svg.append("g")
        //    .attr("class", "y grid")
        //    .call(make_y_axis()
        //        .tickSize(-width, 0, 0)
        //        .tickFormat("")
        //);

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
            .attr({
                "dx": "-.8em",
                "dy": ".15em"
            })
            .attr("transform", "rotate(-45)");
        // Add the Y Axis
        svg.append("g")
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

        var store_total = svg.append("g")
            .data(stores)
            .attr("class", "graph total")
            .attr("id", "total");

        // Add the valueline path for stores.
        store_total.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("d", function () {
                return valueline(count_total());
            })
            .style("stroke", "#000");

        var svgElement = document.getElementsByClassName("chart");
        var svgElementPosition = svgElement[0].getBoundingClientRect();
        console.log(svgElementPosition);

        // LEGEND

        var legend = d3.select("#legend")
            .append('div')
            .attr("class", "legend")
            .style("margin-top", margin.top + "px");


        legend.append("div")
            //.attr("id", "legend-title")
            .text("Stores")
            .append("span")
            .attr("id", "refresh")
            .attr("class", "ui-icon ui-icon-arrowrefresh-1-e")
            .on("click", function () {
                update_graphs(false);
            });

        var legend_section = legend.selectAll(".legend-item")
            .data(stores)
            .enter().append("div")
            .attr("class", function (d) {
                return "legend-item " + "legend-item-" + d.name + " store";
            })
            .attr({
                "width": width / 4,
                "height": height / 4
            })
            .attr("data-store", function (d) {
                return d.name;
            })
            .on("click", click_function)
            .on("mouseover", mouseover)
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

        var legend_section_total = legend.append("div")
            .attr("class", "legend-item")
            .attr({
                "width": width / 4,
                "height": height / 4
            })
            .attr("data-store", "total")
            .on("click", click_function)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        legend_section_total.append("div")
            .attr("class", "legend-swatch")
            .style("background-color", "#000");

        legend_section_total.append("div")
            .attr("class", "legend-title")
            .text("total");

        // TOOLTIP

        var tooltip = d3.select("#tooltip")
            .append("div")
            //.attr("id", "tooltip")
            .attr("class", "tooltip")
            .style("display", "none")
            .style({
                "left": svgElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px",
                "top": svgElementPosition.top + document.body.scrollTop + margin.top * 1.5 + "px"
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
            .style("color", function (d) {
                return color(d.name);
            })
            .text(function (d) {
                // return last value
                return formatLargeNumbers(d.values[d.values.length - 1].store);
            });

        var tooltip_section_total = tooltip.append("div")
            .data(count_total())
            .attr("class", "tooltip-section total");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-swatch")
            .style("background-color", "#000");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-title")
            .attr("title", "Total")
            .text("Total");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-value")
            .text(function () {
                // return last value
                return formatLargeNumbers(count_total()[count_total().length - 1].store);
            });


        // don't know what's this for
        // Add the valueline path.
        //lineSvg.append("path")
        //    .attr("class", "line")
        //    .attr("d", valueline(data));

        var focus = svg.append("g")
            .attr("class", "hover")
            .style("display", "none");


        // append the x line
        focus.append("line")
            .data(stores)
            .attr("class", "x")
            .style("stroke", function (d) {
                return color(d.name);
            })
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr({
                "y1": 0,
                "y2": height
            });

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


        //var focus_total = svg.append("g")
        //    .attr("class", "hover")
        //    .style("display", "none");

        // append the x line
        focus.append("line")
            .data(count_total())
            .attr("class", "x total")
            .style("stroke", "#1B1B1B")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("y1", 0)
            .attr("y2", height);

        // append the circle at the intersection
        focus.append("circle")
            .data(count_total())
            .attr("class", "total")
            .style("fill", "#FFFFFF")
            .style("stroke", "#000")
            .attr("r", 4);

        // append the rectangle to capture mouse
        svg.append("rect")
            .data(stores)
            .attr({
                "width": width,
                "height": height
            })
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

        //svg.append("rect")
        //    .data(count_total())
        //    .attr({
        //        "width": width,
        //        "height": height
        //    })
        //    .attr("class", "rect-capture-mouse")
        //    .style("fill", "none")
        //    .style("pointer-events", "all")
        //    .on("mouseover", function () {
        //        tooltip.style("display", null);
        //        focus.style("display", null);
        //        //console.log(tooltip_total);
        //    })
        //    .on("mouseout", function () {
        //        tooltip.style("display", "none");
        //        focus.style("display", "none");
        //    })
        //    .on("mousemove", mousemove_total);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;

            // Loop through object to fin each store value, append it to circles and
            // set their transform attribute
            for (var key in d) {
                if (key != "datetime") {
                    focus.select("circle." + key)
                        .attr("value", d[key])
                        .attr("transform",
                        "translate(" + x(d.datetime) + "," +
                        y(d[key]) + ")");
                }
            }

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
                    var date = d.datetime.getDate() + " " + get_month(month_number) + " " + d.datetime.getFullYear();
                    return date;
                });

            tooltip.selectAll(".tooltip-value")
                .data(stores)
                .text(function (d) {
                    var value = d3.select("circle." + d.name).attr("value");
                    return formatLargeNumbers(value);
                });
        }

        //function mousemove_total() {
        //    var x0 = x.invert(d3.mouse(this)[0]),
        //        i = bisectDate(count_total(), x0, 1),
        //        d0 = count_total()[i - 1],
        //        d1 = count_total()[i],
        //        d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;
        //
        //    focus.select("circle.total")
        //        .attr("value", d.store)
        //        .attr("transform",
        //        "translate(" + x(d.datetime) + "," +
        //        y(d.store) + ")");
        //
        //    focus.select(".x")
        //        .attr("transform",
        //        "translate(" + x(d.datetime) + "," +
        //        0 + ")")
        //        .attr("y2", height);
        //
        //    focus.select(".y")
        //        .attr("transform",
        //        "translate(" + width * -1 + "," +
        //        y(d.store) + ")")
        //        .attr("x2", width + width);
        //
        //    //tooltip.select(".total").select("")
        //    //    .text(function () {
        //    //        var month_number = d.datetime.getMonth();
        //    //        var date = d.datetime.getDate() + " " + get_month(month_number) + " " + d.datetime.getFullYear();
        //    //        return date;
        //    //    });
        //
        //    tooltip.select(".total").select(".tooltip-value")
        //        .data(count_total())
        //        .text(function () {
        //            var value = d3.select("circle.total").attr("value");
        //            return formatLargeNumbers(value);
        //        });
        //}

    });
}

render(false);

function update_graphs(filterByDates) {
    d3.json("data1.json", function (error, data) {

        console.log("data updated");

        d3.selectAll('svg').remove();
        d3.select('#tooltip').select('div').remove();
        d3.select("#legend").select('div').remove();

        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "datetime";
        }));

        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
        });

        if (filterByDates) {
            data = data.filter(function (d) {
                return d.datetime >= startDate && d.datetime <= endDate;
            });
        }

        var stores = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {datetime: d.datetime, store: +d[name]};
                })
            };
        });

        //This one for counting overall users
        var count_total = function () {
            var number = [];
            // Fill array with zero values
            for (var k = 0; k < stores[0].values.length; k++) {
                number.push({
                    datetime: data[k].datetime,
                    store: 0
                });
            }
            // Overwrite array values with new ones
            for (var i = 0; i < stores.length; i++) {
                for (var j = 0; j < stores[i].values.length; j++) {
                    number[j].store += parseInt(stores[i].values[j].store);
                }
            }
            return number;
        };

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));

        y.domain([
            0,
            d3.max(count_total(), function (d) {
                return Math.max(d.store);
            })
        ]);

        // Create SVG element
        var svg = d3.select(".chart")
            .classed('updated', true)
            .append("svg")
            .attr({
                "width": width + margin.left + margin.right,
                "height": height + margin.top + margin.bottom
            })
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
            .attr({
                "dx": "-.8em",
                "dy": ".15em"
            })
            .attr("transform", "rotate(-45)");
        // Add the Y Axis
        svg.append("g")
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

        var store_total = svg.append("g")
            .data(stores)
            .attr("class", "graph total")
            .attr("id", "total");

        // Add the valueline path for stores.
        store_total.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("d", function () {
                return valueline(count_total());
            })
            .style("stroke", "#000");

        var svgElement = document.getElementsByClassName("chart");
        var svgElementPosition = svgElement[0].getBoundingClientRect();
        //console.log(svgElementPosition);

        // LEGEND

        var legend = d3.select("#legend")
            .append('div')
            .attr("class", "legend")
            .style("margin-top", margin.top + "px");


        legend.append("div")
            .attr("id", "legend-title")
            .text("Stores")
            //.on("click", update_graphs)
            .append("span")
            .attr("id", "refresh")
            .attr("class", "ui-icon ui-icon-arrowrefresh-1-e")
            .on("click", function () {
                update_graphs(false);
            });

        var legend_section = legend.selectAll(".legend-item")
            .data(stores)
            .enter().append("div")
            .attr("class", function (d) {
                return "legend-item " + "legend-item-" + d.name + " store";
            })
            .attr({
                "width": width / 4,
                "height": height / 4
            })
            .attr("data-store", function (d) {
                return d.name;
            })
            .on("click", click_function)
            .on("mouseover", mouseover)
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

        var legend_section_total = legend.append("div")
            .attr("class", "legend-item")
            .attr({
                "width": width / 4,
                "height": height / 4
            }).attr("data-store", "total")
            .on("click", click_function)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        legend_section_total.append("div")
            .attr("class", "legend-swatch")
            .style("background-color", "#000");

        legend_section_total.append("div")
            .attr("class", "legend-title")
            .text("total");

        // TOOLTIP

        var tooltip = d3.select("#tooltip")
            .append("div")
            .attr("id", "tooltip")
            .attr("class", "tooltip")
            .style("display", "none")
            .style({
                "left": svgElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px",
                "top": svgElementPosition.top + document.body.scrollTop + margin.top * 1.5 + "px"
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
            .style("color", function (d) {
                return color(d.name);
            })
            .text(function (d) {
                // return last value
                return formatLargeNumbers(d.values[d.values.length - 1].store);
            });

        var tooltip_section_total = tooltip.append("div")
            .data(count_total())
            .attr("class", "tooltip-section total");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-swatch")
            .style("background-color", "#000");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-title")
            .attr("title", "Total")
            .text("Total");

        tooltip_section_total.append("div")
            .attr("class", "tooltip-value")
            .text(function () {
                // return last value
                return formatLargeNumbers(count_total()[count_total().length - 1].store);
            });

        // don't know what's this for
        // Add the valueline path.
        //lineSvg.append("path")
        //    .attr("class", "line")
        //    .attr("d", valueline(data));

        var focus = svg.append("g")
            .attr("class", "hover")
            .style("display", "none");


        // append the x line
        focus.append("line")
            .data(stores)
            .attr("class", "x")
            .style("stroke", function (d) {
                return color(d.name);
            })
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr({
                "y1": 0,
                "y2": height
            });

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

        // append the x line
        focus.append("line")
            .data(count_total())
            .attr("class", "x total")
            .style("stroke", "#1B1B1B")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("y1", 0)
            .attr("y2", height);

        // append the circle at the intersection
        focus.append("circle")
            .data(count_total())
            .attr("class", "total")
            .style("fill", "#FFFFFF")
            .style("stroke", "#000")
            .attr("r", 4);

        // append the rectangle to capture mouse
        svg.append("rect")
            .data(stores)
            .attr({
                "width": width,
                "height": height
            })
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

            // Loop through object to fin each store value, append it to circles and
            // set their transform attribute
            for (var key in d) {
                if (key != "datetime") {
                    focus.select("circle." + key)
                        .attr("value", d[key])
                        .attr("transform",
                        "translate(" + x(d.datetime) + "," +
                        y(d[key]) + ")");
                }
            }

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
                    var date = d.datetime.getDate() + " " + get_month(month_number) + " " + d.datetime.getFullYear();
                    return date;
                });

            tooltip.selectAll(".tooltip-value")
                .data(stores)
                .text(function (d) {
                    var value = d3.select("circle." + d.name).attr("value");
                    return formatLargeNumbers(value);
                });
        }


        //---------------------------

        // Overall graph

        // Create SVG element

    });
}

function hide_graph(graph_id) {

    d3.selectAll("#" + graph_id + ", circle." + graph_id + ", .tooltip-section." + graph_id)
        .classed("hidden", true);

    //d3.selectAll("#" + graph_id + ", circle." + graph_id + ", .tooltip-section." + graph_id)
    //    .attr("class", hide_element);

    d3.selectAll(".legend-item").filter(function () {
        if (!d3.select(this).classed("legend-item-hidden")) {
            //console.log(true);
            d3.select(this)
                .classed("transparent", false);
            d3.selectAll(".graph").filter(function () {
                if (!d3.select(this).classed("hidden")) {
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

function mouseover() {
    var element = d3.select(this);
    var graph_id = this.getAttribute("data-store");

    var transparent = element.classed("transparent");
    var focused = element.classed("legend-item-focused");
    var hidden = element.classed("legend-item-hidden");

    if (!hidden) {
        element.classed("legend-item-focused", true);
    }

    // Selection by store class is temporary decision
    d3.selectAll(".legend-item").filter(function () {
        // Check if current element is hidden
        if (!d3.select(this).classed("transparent")) {
            if (hidden) {
                //don't delete this. without it won't work if selection :(
                //console.log(true);
            } else if (!d3.select(this).classed("legend-item-focused")) {
                d3.select(this)
                    .classed("transparent", true);
                d3.selectAll(".graph").filter(function () {
                    if (d3.select(this).attr("id") != graph_id) {
                        d3.select(this)
                            .classed("transparent", true);
                    }
                });
            }
        }
    });
}

function mouseout() {
    d3.select(this).classed("legend-item-focused", false);
    d3.selectAll(".legend-item").filter(function () {
        // Check if current element is hidden
        if (d3.select(this).classed("transparent")) {
            d3.select(this)
                .classed("transparent", false);
            d3.selectAll(".graph")
                .classed("transparent", false);
        }
    });
}

function click_function() {
    var element = d3.select(this);
    var graph_id = element.attr("data-store");
    var hidden = element.classed("legend-item-hidden");

    if (!hidden) {
        element.classed({
            "legend-item-hidden": true,
            "legend-item-focused": false
        });
        hide_graph(graph_id);
    } else if (hidden) {
        element.classed({
            "legend-item-hidden": false,
            "legend-item-focused": true
        });
        show_graph(graph_id);
        d3.selectAll(".legend-item").filter(function () {
            if (!d3.select(this).classed("legend-item-focused")) {
                d3.select(this).classed("transparent", true);
                d3.selectAll(".graph").filter(function () {
                    if (d3.select(this).attr("id") != graph_id) {
                        d3.select(this)
                            .classed("transparent", true);
                    }
                });
            }
        });
    }
}

d3.select(window).on("resize", resize);

function resize() {
    var svgElement = document.getElementsByClassName("chart");
    var svgElementPosition = svgElement[0].getBoundingClientRect();
    //var totalElementPosition = totalElement[0].getBoundingClientRect();

    d3.select("#tooltip")
        .style({
            "left": svgElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px",
            "top": svgElementPosition.top + document.body.scrollTop + margin.top * 1.5 + "px"
        });
    //d3.select("#tooltip_total")
    //    .style({
    //        "left": totalElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px",
    //        "top": totalElementPosition.top + document.body.scrollTop + margin.top * 2 + "px"
    //    });
}