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

var y1 = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(d3.time.days, 1).tickFormat(d3.time.format("%d %b"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(3).tickFormat(d3.format("s"));

var yAxisSum = d3.svg.axis().scale(y1)
    .orient("left").ticks(5).tickFormat(d3.format("s"));

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
        return y1(d.value);
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

var svgElement = document.getElementsByClassName("chart");
var svgElementPosition = svgElement[0].getBoundingClientRect();
console.log(svgElementPosition);

var sumElement = document.getElementsByClassName("sum");
var sumElementPosition = sumElement[0].getBoundingClientRect();
console.log(sumElementPosition);

var tooltip = d3.select("#tooltip")
    .attr("class", "tooltip")
    //.style("display", "none")
    .style("left", svgElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px")
    .style("top", svgElementPosition.top + document.body.scrollTop + margin.top * 1.5 + "px");

var legend = d3.select("#legend")
    .attr("class", "legend")
    .style("margin-top", margin.top + "px");

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

function make_y_axis_sum() {
    return d3.svg.axis()
        .scale(y1)
        .orient("left")
        .ticks(5);
}

//not sure if it's used
//var lineSvg = svg.append("g");

var focus = svg.append("g")
    .attr("class", "hover")
    .style("display", "none");

var focus_sum = sum.append("g")
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

    legend.append("div")
        .attr("id", "legend-title")
        .text("Stores")
        .on("click", update_graphs)
        .append("span")
        .attr("id", "refresh")
        .attr("class", "ui-icon ui-icon-arrowrefresh-1-e")
        .on("click", update_graphs);

    var legend_section = legend.selectAll(".legend-item")
        .data(stores)
        .enter().append("div")
        .attr("class", function (d) {
            return "legend-item " + "legend-item-" + d.name + " store";
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
        .style("color", function(d){
            return color(d.name);
        })
        .text(function (d) {
            // return last value
            return formatLargeNumbers(d.values[d.values.length - 1].store);
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
                return formatLargeNumbers(value);
            });
    }

    // ------------------------------------------------------------------------------

    // Overall graph

    // This one for counting overall users
    var count_sum = function () {
        var number = [];
        // Fill array with zero values
        for (var k = 0; k < stores[0].values.length; k++) {
            number.push({
                datetime: data[k].datetime,
                value: 0
            });
        }
        // Overwrite array values with new ones
        for (var i = 0; i < stores.length; i++) {
            for (var j = 0; j < stores[i].values.length; j++) {
                number[j].value += parseInt(stores[i].values[j].store);
            }
        }
        return number;
    };

    y1.domain([
        d3.min(count_sum(), function (d) {
            return Math.min(d.value);
        }),
        d3.max(count_sum(), function (d) {
            return Math.max(d.value);
        })
    ]);


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
        .call(make_y_axis_sum()
            .tickSize(-width, 0, 0)
            .tickFormat("")
    );

    // Add the X Axis
    sum.append("g")
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
    sum.append("g")
        .attr("class", "y axis")
        .call(yAxisSum);

    var store_sum = sum.append("g")
        .data(stores)
        .attr("class", "graph-sum")
        .attr("id", "overall");

    // Add the valueline path for stores.
    store_sum.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("d", function () {
            return valueline_sum(count_sum());
        })
        .style("stroke", "#000");

    var legend_sum = d3.select("#legend_sum")
        .attr("class", "legend")
        .style("margin-top", margin.top + "px");

    legend_sum.append("div")
        .attr("id", "legend-title")
        .text("Stores overall")
        .append("span")
        .attr("id", "refresh")
        .attr("class", "ui-icon ui-icon-arrowrefresh-1-e")
        .on("click", update_graphs);

    var legend_section_sum = legend_sum.append("div")
        .attr("class", "legend-item")
        .attr("width", width / 4)
        .attr("height", height / 4);
        //.on("click", click_function)
        //.on("mouseover", hover)
        //.on("mouseout", mouseout);

    legend_section_sum.append("div")
        .attr("class", "legend-swatch")
        .style("background-color", "#000");

    legend_section_sum.append("div")
        .attr("class", "legend-title")
        .text("Sum");

    var tooltip_sum = d3.select("#tooltip_sum");

    tooltip_sum.attr("class", "tooltip")
        .style("display", "none")
        .style("left", sumElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px")
        .style("top", sumElementPosition.top + document.body.scrollTop + margin.top * 2 + "px")
        .append("div")
        .attr("id", "tooltip-title")
        .style("font-weight", "bold")
        .text("Sum");

    console.log(sumElementPosition.top + " " + document.body.scrollTop + " " + margin.top * 2);

    var tooltip_section_sum = tooltip_sum.append("div")
        .data(count_sum())
        .attr("class", "tooltip-section");

    tooltip_section_sum.append("div")
        .attr("class", "tooltip-swatch")
        .style("background-color", "#000");

    tooltip_section_sum.append("div")
        .attr("class", "tooltip-title")
        .attr("title", "Sum")
        .text("Sum");

    tooltip_section_sum.append("div")
        .attr("class", "tooltip-value")
        .text(function () {
            // return last value
            return formatLargeNumbers(count_sum()[count_sum().length - 1].value);
        });

    // append the x line
    focus_sum.append("line")
        .data(count_sum())
        .attr("class", "x")
        .style("stroke", "#1B1B1B")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the circle at the intersection
    focus_sum.append("circle")
        .data(count_sum())
        .attr("class", "sum")
        .style("fill", "#FFFFFF")
        .style("stroke", "#000")
        .attr("r", 4);

    // append the rectangle to capture mouse
    sum.append("rect")
        .data(count_sum())
        .attr("width", width)
        .attr("height", height)
        .attr("class", "rect-capture-mouse")
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () {
            tooltip_sum.style("display", null);
            focus_sum.style("display", null);
            //console.log(tooltip_sum);
        })
        .on("mouseout", function () {
            tooltip_sum.style("display", "none");
            focus_sum.style("display", "none");
        })
        .on("mousemove", mousemove_sum);

    function mousemove_sum() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(count_sum(), x0, 1),
            d0 = count_sum()[i - 1],
            d1 = count_sum()[i],
            d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;

        focus_sum.select("circle.sum")
            .attr("value", d.value)
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y1(d.value) + ")");

        focus_sum.select(".x")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            0 + ")")
            .attr("y2", height);

        focus_sum.select(".y")
            .attr("transform",
            "translate(" + width * -1 + "," +
            y1(d.value) + ")")
            .attr("x2", width + width);

        tooltip_sum.select("#tooltip-title")
            .text(function () {
                var month_number = d.datetime.getMonth();
                var date = d.datetime.getDate() + " " + get_month(month_number) + " " + (d.datetime.getFullYear() + 1);
                return date;
            });

        tooltip_sum.selectAll(".tooltip-value")
            .data(count_sum())
            .text(function () {
                var value = d3.select("circle.sum").attr("value");
                return formatLargeNumbers(value);
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
                    return formatLargeNumbers(value);
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

        //---------------------------

        // Overall graph

        // This one for counting overall users
        var count_sum = function () {
            var number = [];
            // Fill array with zero values
            for (var k = 0; k < stores[0].values.length; k++) {
                number.push({
                    datetime: data[k].datetime,
                    value: 0
                });
            }
            // Overwrite array values with new ones
            for (var i = 0; i < stores.length; i++) {
                for (var j = 0; j < stores[i].values.length; j++) {
                    number[j].value += parseInt(stores[i].values[j].store);
                }
            }
            return number;
        };

        y1.domain([
            d3.min(count_sum(), function (d) {
                return Math.min(d.value);
            }),
            d3.max(count_sum(), function (d) {
                return Math.max(d.value);
            })
        ]);

        // Select the section we want to apply our changes to
        var sum = d3.select(".sum");

        // Redraw vertical grid
        sum.select(".grid.x")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
            );

        //Redraw horizontal grid
        sum.select(".grid.y")
            //.attr("transform", "translate(0," + height + ")")
            .call(make_y_axis_sum()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );

        var store_sum = sum.select(".graph-sum")
            .data(count_sum());

        store_sum.select("path")
            .transition()
            .duration(750)
            .attr("d", function () {
                return valueline_sum(count_sum());
            })
            .style("display", "inline");

        var tooltip_sum = d3.select("#tooltip_sum");

        //append the rectangle to capture mouse
        sum.select(".rect-capture-mouse")
            .data(count_sum())
            .attr("width", width)
            .attr("height", height)
            //.attr("rect-capture-mouse")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function () {
                tooltip_sum.style("display", null);
                focus_sum.style("display", null);
            })
            .on("mouseout", function () {
                tooltip_sum.style("display", "none");
                focus_sum.style("display", "none");
            })
            .on("mousemove", mousemove_sum);

        function mousemove_sum() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(count_sum(), x0, 1),
                d0 = count_sum()[i - 1],
                d1 = count_sum()[i],
                d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;

            focus_sum.select("circle.sum")
                .attr("value", d.value)
                .attr("transform",
                    "translate(" + x(d.datetime) + "," +
                    y1(d.value) + ")");

            focus_sum.select(".x")
                .attr("transform",
                    "translate(" + x(d.datetime) + "," +
                    0 + ")")
                .attr("y2", height);

            focus_sum.select(".y")
                .attr("transform",
                    "translate(" + width * -1 + "," +
                    y1(d.value) + ")")
                .attr("x2", width + width);

            tooltip_sum.select("#tooltip-title")
                .text(function () {
                    var month_number = d.datetime.getMonth();
                    var date = d.datetime.getDate() + " " + get_month(month_number) + " " + (d.datetime.getFullYear() + 1);
                    return date;
                });

            tooltip_sum.select(".tooltip-value")
                .data(count_sum())
                .text(function (d) {
                    var value = d3.select("circle.sum").attr("value");
                    return formatLargeNumbers(value);
                });
        }

        // update the x axis
        sum.select(".x.axis")
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
        sum.select(".y.axis")
            //.duration(750)
            .call(yAxisSum);
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

function hover() {
    console.log(this);
    var element = d3.select(this);

    //var graph_id = element.attr("data-store");
    var graph_id = this.getAttribute("data-store");

    //var transparent = element.classed("transparent");
    //var focused = element.classed("legend-item-focused");
    //var hidden = element.classed("legend-item-hidden");

    var transparent = this.classList.contains("transparent");
    var focused = this.classList.contains("legend-item-focused");
    var hidden = this.classList.contains("legend-item-hidden");

    if (!hidden) {
        element.classed("legend-item-focused", true);
    }
    // Selection by store class is temporary decision
    d3.selectAll(".legend-item.store").filter(function () {
        // Check if current element is hidden
        if (!d3.select(this).classed("transparent")) {
            //console.log(false);
            //console.log(d3.select(this));
            if (hidden) {
                //console.log(true);
            } else if (!d3.select(this).classed("legend-item-focused")) {
                //console.log(d3.select(this));
                d3.select(this)
                    .classed("transparent", true);
                d3.selectAll(".graph").filter(function () {
                    if (d3.select(this).attr("id") != graph_id) {
                        //console.log(true);
                        d3.select(this)
                            .classed("transparent", true);
                    }
                });
            }
        }
    });


}

function mouseout() {
    this.classList.remove("legend-item-focused");
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
        }).call(hover);
        show_graph(graph_id);
    }
}

d3.select(window).on("resize", resize);

function resize(){
    svgElementPosition = svgElement[0].getBoundingClientRect();
    sumElementPosition = sumElement[0].getBoundingClientRect();

    d3.select("#tooltip")
        .style("left", svgElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px")
        .style("top", svgElementPosition.top + document.body.scrollTop + margin.top * 1.5 + "px");
    d3.select("#tooltip_sum")
        .style("left", sumElementPosition.left + document.body.scrollLeft + margin.left * 1.5 + "px")
        .style("top", sumElementPosition.top + document.body.scrollTop + margin.top * 2 + "px");

}