// Set the dimensions of the canvas / graph
var margin = {
        top: 30,
        right: 300,
        bottom: 50,
        left: 30
    },
    width = 950 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var data;

var yTranslate = 0;

var url = "data.json";

// Parse the date / time
var parseDate = d3.time.format("%Y-%m-%d").parse,
    formatDate = d3.time.format("%d-%b"),
    bisectDate = d3.bisector(function (d) {
        return d.datetime;
    }).left

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

var tooltip = d3.select("#tooltip");

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

var lineSvg = svg.append("g");

var focus = svg.append("g")
    .attr("class", "hover");
//.style("display", "none");

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
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
    );

    // Draw vertical lines
    svg.append("g")
        .attr("class", "grid")
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

    //store.append("text")
    //    .datum(function (d) {
    //        return {name: d.name, value: d.values[d.values.length - 1]};
    //    })
    //    .attr("transform", function (d) {
    //        return "translate(" + x(d.value.datetime) + "," + y(d.value.store) + ")";
    //    })
    //    .attr("x", 3)
    //    .attr("dy", ".35em")
    //    .text(function (d) {
    //        return d.name;
    //    });

    var legend = svg.append("g")
        .attr("transform", "translate(" + (width + margin.left) + ",0)");

    legend.append("rect")
        .attr("stroke", "#ccc")
        .attr("stroke-width", .4)
        .attr("fill", "none")
        .attr("width", width / 4)
        .attr("height", height / 4);

    legend.selectAll(".legend")
        .data(stores)
        .enter().append("rect")
        .attr("style", "legend")
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d){
            return color(d.name);
        })
        .attr("transform", function(d){
            yTranslate += 20;
            return "translate(20, " + yTranslate + ")";
        });

    yTranslate = 10;

    legend.selectAll("text")
        .data(stores)
        .enter().append("text")
        .attr("transform", function () {
            yTranslate += 20;
            return "translate(40, " + yTranslate + ")";
        })
        .text(function (d) {
            return d.name;
        });

    //mouseG.append("path") // this is the black vertical line to follow mouse
    //    .attr("class", "mouse-line")
    //    .style("stroke", "black")
    //    .style("stroke-width", "1px")
    //    .style("opacity", "0");
    //
    //var lines = document.getElementsByClassName('line');
    //
    //var mousePerLine = mouseG.selectAll('.mouse-per-line')
    //    .data(stores)
    //    .enter()
    //    .append("g")
    //    .attr("class", "mouse-per-line");
    //
    //mousePerLine.append("circle")
    //    .attr("r", 7)
    //    .style("stroke", function(d) {
    //        return color(d.name);
    //    })
    //    .style("fill", "none")
    //    .style("stroke-width", "1px")
    //    .style("opacity", "0");
    //
    //mousePerLine.append("text")
    //    .attr("transform", "translate(10,3)");
    //
    //mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    //    .attr('width', width) // can't catch mouse events on a g element
    //    .attr('height', height)
    //    .attr('fill', 'none')
    //    .attr('pointer-events', 'all')
    //    .on('mouseout', function() { // on mouse out hide line, circles and text
    //        d3.select(".mouse-line")
    //            .style("opacity", "0");
    //        d3.selectAll(".mouse-per-line circle")
    //            .style("opacity", "0");
    //        d3.selectAll(".mouse-per-line text")
    //            .style("opacity", "0");
    //    })
    //    .on('mouseover', function() { // on mouse in show line, circles and text
    //        d3.select(".mouse-line")
    //            .style("opacity", "1");
    //        d3.selectAll(".mouse-per-line circle")
    //            .style("opacity", "1");
    //        d3.selectAll(".mouse-per-line text")
    //            .style("opacity", "1");
    //    })
    //    .on('mousemove', function() { // mouse moving over canvas
    //        var mouse = d3.mouse(this);
    //        d3.select(".mouse-line")
    //            .attr("d", function() {
    //                var d = "M" + mouse[0] + "," + height;
    //                d += " " + mouse[0] + "," + 0;
    //                return d;
    //            });
    //
    //        d3.selectAll(".mouse-per-line")
    //            .attr("transform", function(d, i) {
    //                console.log(width/mouse[0]);
    //                var xDate = x.invert(mouse[0]),
    //                    bisect = d3.bisector(function(d) { return d.date; }).right;
    //                idx = bisect(d.values, xDate);
    //
    //                var beginning = 0,
    //                    end = lines[i].getTotalLength(),
    //                    target = null;
    //
    //                while (true){
    //                    target = Math.floor((beginning + end) / 2);
    //                    pos = lines[i].getPointAtLength(target);
    //                    if ((target === end || target === beginning) && pos.x !== mouse[0]) {
    //                        break;
    //                    }
    //                    if (pos.x > mouse[0])      end = target;
    //                    else if (pos.x < mouse[0]) beginning = target;
    //                    else break; //position found
    //                }
    //
    //                //d3.select(this).select('text')
    //                //    .text(y.invert(pos.y).toFixed(2));
    //
    //                tooltip.select("#" + d.name)
    //                    ;
    //                console.log(d.name);
    //
    //                return "translate(" + mouse[0] + "," + pos.y +")";
    //            });
    //    });

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

    //// append the y line
    //focus.append("line")
    //    .data(stores)
    //    .attr("class", "y")
    //    .style("stroke", function(d){
    //        return color(d.name);
    //    })
    //    .style("stroke-dasharray", "3,3")
    //    .style("opacity", 0.5)
    //    .attr("x1", width)
    //    .attr("x2", width);

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
            focus.style("display", null);
        })
        .on("mouseout", function () {
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

        focus.select("text.y1")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.play) + ")")
            .text(d.play);

        focus.select("text.y2")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.play) + ")")
            .text(d.play);

        focus.select("text.y3")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.play) + ")")
            .text(formatDate(d.datetime));

        focus.select("text.y4")
            .attr("transform",
            "translate(" + x(d.datetime) + "," +
            y(d.play) + ")")
            .text(formatDate(d.datetime));

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

        tooltip.style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px");
    }

    d3.selectAll(".date")
        .data(data)
        .text(function (d) {
            var lastArrayItem = data[data.length - 1];
            var date = lastArrayItem.datetime;
            return date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() + 1);
        });
    d3.selectAll(".value")
        .data(data)
        .text(function (d) {
            var lastArrayItem = data[data.length - 1];
            var store_id = this.getAttribute("data-store");
            return store_data(lastArrayItem, store_id);
        });
    d3.selectAll(".difference")
        .data(data)
        .text(function (d) {
            var lastArrayItem = data[data.length - 1];
            var store_id = this.getAttribute("data-store");
            return store_data(lastArrayItem, store_id) + "%";
        });
});

function store_data(d, store_id) {
    switch (store_id) {
        case "fb":
            return d.fb;
            break;
        case "play":
            return d.play;
            break;
        case "appstore":
            return d.appstore;
            break;
    }
}

function mouseover(d) {
    var element = this;
    console.log(this);
    var store_id = element.getAttribute("data-store");
    //tooltip.style("left", d3.event.pageX + "px")
    //     .style("top", d3.event.pageY + "px");
    tooltip.select("#" + store_id).select(".date")
        .transition()
        .duration(150)
        .style("color", "red")
        .text(function () {
            var date = d.datetime;
            return date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() + 1);
        })
        .transition()
        .duration(450)
        .style("color", "black");
    tooltip.select("#" + store_id).select(".value")
        .transition()
        .duration(150)
        .style("color", "red")
        .text(function () {
            return store_data(d, store_id);
        })
        .transition()
        .duration(450)
        .style("color", "black");
    tooltip.select("#" + store_id).select(".difference")
        .transition()
        .duration(150)
        .style("color", "red")
        .text(function () {
            var previousValue = element.previousSibling.getAttribute("value");
            var currentValue = element.getAttribute("value")

            switch (previousValue) {
                case null:
                    return "beginning of period";
                    break;
                case "0":
                    return "-";
                    break;
                default:
                    return Math.floor((((currentValue - previousValue) / previousValue) * 100) * 100) / 100 + "%";
                    break;
            }
        })
        .transition()
        .duration(450)
        .style("color", "black");
}

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

        // Remove all grids before adding new ones
        d3.selectAll(".grid")
            .remove();

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart");

        // Draw horizontal lines
        svg.select("g").append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
        );

        // Draw vertical lines
        svg.select("g").append("g")
            .attr("class", "grid")
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

        //store.selectAll("text")
        //    .data(stores)
        //    .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        //    .transition()
        //    .duration(750)
        //    .attr("transform", function(d) { return "translate(" + x(d.value.datetime) + "," + y(d.value.store) + ")"; })
        //    .attr("x", 3)
        //    .attr("dy", ".35em")
        //    .text(function(d) { return d.name; });

        // Make the changes
        // change the line facebook
        //svg.select("#fb")
        //    .duration(750)
        //    .style("display", "inline")
        //    .attr("d", valueline(data));
        //
        //// change the line playstore
        //svg.select("#play")
        //    .duration(750)
        //    .style("display", "inline")
        //    .style("stroke", "red")
        //    .attr("d", valueline_play(data));
        //// change the line appstore
        //svg.select("#appstore")
        //    .duration(750)
        //    .style("display", "inline")
        //    .style("stroke", "green")
        //    .attr("d", valueline_appstore(data));
        //

        // append the x line
        //focus.append("line")
        //    .data(stores)
        //    .attr("class", "x")
        //    .style("stroke", function (d) {
        //        return color(d.name);
        //    })
        //    .style("stroke-dasharray", "3,3")
        //    .style("opacity", 0.5)
        //    .attr("y1", 0)
        //    .attr("y2", height);

        //// append the y line
        //focus.append("line")
        //    .data(stores)
        //    .attr("class", "y")
        //    .style("stroke", function(d){
        //        return color(d.name);
        //    })
        //    .style("stroke-dasharray", "3,3")
        //    .style("opacity", 0.5)
        //    .attr("x1", width)
        //    .attr("x2", width);

        // append the circle at the intersection
        //focus.selectAll("circle")
            //.data(stores)
            //.enter().append("circle")
            //.attr("class", function (d) {
            //    return d.name;
            //})
            //.style("fill", "#FFFFFF")
            //.style("stroke", function (d) {
            //    return color(d.name);
            //})
            //.attr("r", 4);

        //append the rectangle to capture mouse
        svg.select(".rect-capture-mouse")
            .data(stores)
            .attr("width", width)
            .attr("height", height)
            //.attr("rect-capture-mouse")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function () {
                console.log("hey hey");
                focus.style("display", null);
            })
            .on("mouseout", function () {
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

            focus.select("text.y1")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")")
                .text(d.play);

            focus.select("text.y2")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")")
                .text(d.play);

            focus.select("text.y3")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")")
                .text(formatDate(d.datetime));

            focus.select("text.y4")
                .attr("transform",
                "translate(" + x(d.datetime) + "," +
                y(d.play) + ")")
                .text(formatDate(d.datetime));

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

        }

        d3.selectAll(".date")
            .data(data)
            .text(function (d) {
                var lastArrayItem = data[data.length - 1];
                var date = lastArrayItem.datetime;
                return date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() + 1);
            });
        d3.selectAll(".value")
            .data(data)
            .text(function (d) {
                var lastArrayItem = data[data.length - 1];
                var store_id = this.getAttribute("data-store");
                return store_data(lastArrayItem, store_id);
            });
        d3.selectAll(".difference")
            .data(data)
            .text(function (d) {
                var lastArrayItem = data[data.length - 1];
                var store_id = this.getAttribute("data-store");
                return store_data(lastArrayItem, store_id);
            });

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

function show_all_graphs() {
    //d3.json(url, function (error, data) {
    //
    //    color.domain(d3.keys(data[0]).filter(function (key) {
    //        return key !== "datetime";
    //    }));
    //
    //    data.forEach(function (d) {
    //        d.datetime = parseDate(d.datetime);
    //    });
    //
    //    var stores = color.domain().map(function (name) {
    //        return {
    //            name: name,
    //            values: data.map(function (d) {
    //                return {datetime: d.datetime, store: +d[name]};
    //            })
    //        };
    //    });
    //
    //    // Scale the range of the data again
    //    x.domain(d3.extent(data, function (d) {
    //        return d.datetime;
    //    }));
    //    y.domain([
    //        d3.min(stores, function (c) {
    //            return d3.min(c.values, function (v) {
    //                return v.store;
    //            });
    //        }),
    //        d3.max(stores, function (c) {
    //            return d3.max(c.values, function (v) {
    //                return v.store;
    //            });
    //        })
    //    ]);

    // Select the section we want to apply our changes to
    var svg = d3.select(".chart");

    var store = svg.selectAll(".store")
        .style("display", "block");

    store.select("path")
        .transition()
        .duration(450)
        .style("display", "inline");

    store.selectAll("circle")
        .style("display", "inline");

    focus.selectAll("circle")
        .style("display", "block");

    // Make the changes
    // change the line facebook
    //svg.select("#fb")
    //    .duration(750)
    //    .style("display", "inline")
    //    .attr("d", valueline(data));
    //
    //// change the line playstore
    //svg.select("#play")
    //    .duration(750)
    //    .style("display", "inline")
    //    .style("stroke", "red")
    //    .attr("d", valueline_play(data));
    //// change the line appstore
    //svg.select("#appstore")
    //    .duration(750)
    //    .style("display", "inline")
    //    .style("stroke", "green")
    //    .attr("d", valueline_appstore(data));
    //
    //svg.selectAll(".fb-dot")
    //    .duration(750)
    //    .style("display", "inline")
    //    .attr("r", 3.5)
    //    .attr("cx", function (d) {
    //        return x(d.datetime);
    //    })
    //    .attr("cy", function (d) {
    //        return y(d.fb);
    //    })
    //    .attr("value", function (d) {
    //        return d.fb;
    //    });
    //
    //svg.selectAll(".play-dot")
    //    .duration(750)
    //    .style("display", "inline")
    //    .attr("r", 3.5)
    //    .attr("cx", function (d) {
    //        return x(d.datetime);
    //    })
    //    .attr("cy", function (d) {
    //        return y1(d.play);
    //    })
    //    .attr("value", function (d) {
    //        return d.play;
    //    });
    //
    //svg.selectAll(".appstore-dot")
    //    .duration(750)
    //    .style("display", "inline")
    //    .attr("r", 3.5)
    //    .attr("cx", function (d) {
    //        return x(d.datetime);
    //    })
    //    .attr("cy", function (d) {
    //        return y2(d.appstore);
    //    })
    //    .attr("value", function (d) {
    //        return d.appstore;
    //    });
    //});
}

function hide_all_graphs() {
    // Select the section we want to apply our changes to
    var svg = d3.select(".chart").transition();

    var store = svg.selectAll(".store");

    // Hide all graphs
    store.select("path")
        .style("display", "none");
    store.selectAll("circle")
        .style("display", "none");
}

function show_store_graph(store_id) {
    // Get the data again
    d3.json(url, function (error, data) {
        color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== "datetime";
        }));

        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            //d.fb = +d.fb;
            //d.play = +d.play;
            //d.appstore = +d.appstore;
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
        var svg = d3.select(".chart").transition();

        var store = svg.selectAll(".city");

        store.select("path")
            .attr("d", function (d) {
                return valueline(d.values);
            })
            .style("display", "inline")
            .style("stroke", function (d) {
                return color(d.name);
            });

        // Show selected store
        svg.select("#" + store_id)
            .duration(750)
            .style("display", "inline");
        svg.selectAll("." + store_id + "-dot")
            .duration(750)
            .style("display", "inline");

        focus.select("circle." + store_id)
            .style("display", "block");


        //svg.select(".x.axis") // change the x axis
        //    .duration(750)
        //    .call(xAxis);
        //svg.select(".y.axis") // change the y axis
        //    .duration(750)
        //    .call(yAxis);

    });
}

function hide_store_graph(store_id) {

    // Select the section we want to apply our changes to
    var svg = d3.select(".chart").transition();

    // Hide chosen store
    svg.select("#" + store_id)
        .duration(750)
        .style("display", "none");
    svg.selectAll("." + store_id + "-dot")
        .duration(750)
        .style("display", "none");
    focus.select("circle." + store_id)
        .style("display", "none");

}

d3.select("#update").on("click", update_graphs);
d3.selectAll(".store-controls").on("click", function () {
    var store_id = this.getAttribute("value");
    var controls = document.getElementsByClassName("store-controls");
    if (this.checked) {
        show_store_graph(store_id);
    } else {
        hide_store_graph(store_id);
    }
    if (controls[1].checked && controls[2].checked && controls[3].checked) {
        controls[0].checked = true;
    } else {
        controls[0].checked = false;
    }

});
d3.select("#show-all").on("click", function () {
    if (this.checked) {
        check_all();
        show_all_graphs();
    } else {
        uncheck_all();
        hide_all_graphs();
    }
});
//d3.select("#week").on("click", function () {
//
//    //Define the axes
//    var xAxis = d3.svg.axis().scale(x)
//        .orient("bottom").ticks(d3.time.days, 1).tickFormat(d3.time.format("%d %b"));
//
//    var yAxis = d3.svg.axis().scale(y)
//        .orient("left").ticks(5);
//
//    d3.json(url, function (error, data) {
//
//        color.domain(d3.keys(data[0]).filter(function (key) {
//            return key !== "datetime";
//        }));
//
//        data.forEach(function (d) {
//            d.datetime = parseDate(d.datetime);
//        });
//
//        var stores = color.domain().map(function (name) {
//            return {
//                name: name,
//                values: data.map(function (d) {
//                    return {datetime: d.datetime, store: +d[name]};
//                })
//            };
//        });
//
//
//        // Scale the range of the data again
//        x.domain(d3.extent(data, function (d) {
//            return d.datetime;
//        }));
//        y.domain([
//            d3.min(stores, function (c) {
//                return d3.min(c.values, function (v) {
//                    return v.store;
//                });
//            }),
//            d3.max(stores, function (c) {
//                return d3.max(c.values, function (v) {
//                    return v.store;
//                });
//            })
//        ]);
//        //
//        // Select the section we want to apply our changes to
//        var svg = d3.select(".chart");
//
//        var store = svg.selectAll(".store")
//            .data(stores);
//
//        store.select("path")
//            .transition()
//            .duration(750)
//            .attr("d", function (d) {
//                return valueline(d.values);
//            })
//            .style("display", "inline");
//
//        store.selectAll(".fb-dot")
//            .data(data)
//            .transition()
//            .duration(750)
//            .attr("r", 3.5)
//            .attr("cx", function (d) {
//                return x(d.datetime);
//            })
//            .attr("cy", function (d) {
//                return y(d.fb);
//            })
//            .attr("value", function (d) {
//                return d.fb;
//            });
//
//
//        d3.selectAll(".date")
//            .data(data)
//            .text(function (d) {
//                var lastArrayItem = data[data.length - 1];
//                var date = lastArrayItem.datetime;
//                return date.getDate() + "." + (date.getMonth() + 1) + "." + (date.getFullYear() + 1);
//            });
//        d3.selectAll(".value")
//            .data(data)
//            .text(function (d) {
//                var lastArrayItem = data[data.length - 1];
//                var store_id = this.getAttribute("data-store");
//                return store_data(lastArrayItem, store_id);
//            });
//        d3.selectAll(".difference")
//            .data(data)
//            .text(function (d) {
//                var lastArrayItem = data[data.length - 1];
//                var store_id = this.getAttribute("data-store");
//                return store_data(lastArrayItem, store_id) + "%";
//            });
//
//        // update the x axis
//        svg.select(".x.axis")
//            //.duration(750)
//            .attr("class", "x axis")
//            .attr("transform", "translate(0," + height + ")")
//            .call(xAxis)
//            .selectAll("text")
//            .style("text-anchor", "end")
//            .attr("dx", "-.8em")
//            .attr("dy", ".15em")
//            .attr("transform", "rotate(-45)");
//
//        // update the y axis
//        svg.select(".y.axis")
//            //.duration(750)
//            .call(yAxis);
//    })
//});


function check_all() {
    var controls = document.getElementsByClassName("store-controls");
    for (var i = 0; i < controls.length; i++) {
        controls[i].checked = true;
    }
}

function uncheck_all() {
    var controls = document.getElementsByClassName("store-controls");
    for (var i = 0; i < controls.length; i++) {
        controls[i].checked = false;
    }
}

check_all();