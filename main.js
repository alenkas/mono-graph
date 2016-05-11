// Set the dimensions of the canvas / graph
var margin = {
        top: 30,
        right: 20,
        bottom: 50,
        left: 30
    },
    width = 650 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var data;

var url = "data.json";

// Parse the date / time
var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale().range([0, width]);

// Set the ranges
// facebook
var y = d3.scale.linear()
    .range([height, 0]);
// playstore
var y1 = d3.scale.linear().range([height, 0]);
// appstore
var y2 = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(30).tickFormat(d3.time.format("%d %b"));

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line for FaceBook
var valueline = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y(d.fb);
    });

//Define the line for PlayStore
var valueline_play = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y1(d.play);
    });

//Define the line for PlayStore
var valueline_appstore = d3.svg.line()
    .x(function (d) {
        return x(d.datetime);
    })
    .y(function (d) {
        return y2(d.appstore);
    });

// Create SVG element
var svg = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var lineSvg = svg.append("g");
var focus = svg.append("g")
    .style("display", "none");

var tooltip = d3.select("#tooltip");

function make_x_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(30)
}

function make_y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
}

d3.json(url, function (error, data) {

    if (error) return console.warn(error);

    data.forEach(function (d) {
        d.datetime = parseDate(d.datetime);
        d.fb = +d.fb;
        d.play = +d.play;
        d.appstore = +d.appstore;
    });

    x.domain(d3.extent(data, function (d) {
        return d.datetime;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.fb;
    })]);
    y1.domain([0, d3.max(data, function (d) {
        return d.play;
    })]);
    y2.domain([0, d3.max(data, function (d) {
        return d.appstore;
    })]);

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

    // Add the valueline path for FaceBook.
    svg.append("path")
        .attr("class", "line")
        .attr("id", "fb")
        .attr("d", valueline(data));

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "fb-dot")
        .attr("data-store", "fb")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return x(d.datetime);
        })
        .attr("cy", function (d) {
            return y(d.fb);
        })
        .attr("value", function (d) {
            return d.fb;
        })
        .on("mouseover", mouseover);

    //Add the valueline2 path for PlayStore
    svg.append("path")
        .style("stroke", "red")
        .attr("class", "line")
        .attr("id", "play")
        .attr("d", valueline_play(data));

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "play-dot")
        .attr("data-store", "play")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return x(d.datetime);
        })
        .attr("cy", function (d) {
            return y1(d.play);
        })
        .attr("value", function (d) {
            return d.play;
        })
        .on("mouseover", mouseover);

    // Add the valueline2 path for AppStore
    svg.append("path")
        .style("stroke", "green")
        .attr("class", "line")
        .attr("id", "appstore")
        .attr("d", valueline_appstore(data));

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "appstore-dot")
        .attr("data-store", "appstore")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return x(d.datetime);
        })
        .attr("cy", function (d) {
            return y2(d.appstore);
        })
        .attr("value", function (d) {
            return d.appstore;
        })
        .on("mouseover", mouseover);

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
    // tooltip.style("left", d3.event.pageX + "px")
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
            return Math.floor((((currentValue - previousValue) / previousValue) * 100) * 100) / 100;
        })
        .transition()
        .duration(450)
        .style("color", "black");
}

function updateData() {
    // Get the data again
    d3.json(url, function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.fb = +d.fb;
            d.play = +d.play;
            d.appstore = +d.appstore;
        });
        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.fb;
        })]);
        y1.domain([0, d3.max(data, function (d) {
            return d.play;
        })]);
        y2.domain([0, d3.max(data, function (d) {
            return d.appstore;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#fb")
            .duration(750)
            .style("opacity", 1)
            .attr("d", valueline(data));

        // change the line playstore
        svg.select("#play")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "red")
            .attr("d", valueline_play(data));
        // change the line appstore
        svg.select("#appstore")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "green")
            .attr("d", valueline_appstore(data));

        svg.selectAll(".fb-dot")
            .duration(750)
            .style("opacity", 1)
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(d.datetime);
            })
            .attr("cy", function (d) {
                return y(d.fb);
            })
            .attr("value", function (d) {
                return d.fb;
            });

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function showAllGraphs() {
    d3.json(url, function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.fb = +d.fb;
            d.play = +d.play;
            d.appstore = +d.appstore;
        });
        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.fb;
        })]);
        y1.domain([0, d3.max(data, function (d) {
            return d.play;
        })]);
        y2.domain([0, d3.max(data, function (d) {
            return d.appstore;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#fb")
            .duration(750)
            .style("opacity", 1)
            .attr("d", valueline(data));

        // change the line playstore
        svg.select("#play")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "red")
            .attr("d", valueline_play(data));
        // change the line appstore
        svg.select("#appstore")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "green")
            .attr("d", valueline_appstore(data));

        svg.selectAll(".fb-dot")
            .duration(750)
            .style("opacity", 1)
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(d.datetime);
            })
            .attr("cy", function (d) {
                return y(d.fb);
            })
            .attr("value", function (d) {
                return d.fb;
            });

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function hideAllGraphs(){
    d3.json(url, function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.fb = +d.fb;
            d.play = +d.play;
            d.appstore = +d.appstore;
        });
        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.fb;
        })]);
        y1.domain([0, d3.max(data, function (d) {
            return d.play;
        })]);
        y2.domain([0, d3.max(data, function (d) {
            return d.appstore;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#fb")
            .duration(750)
            .style("opacity", 1)
            .attr("d", valueline(data));

        // change the line playstore
        svg.select("#play")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "red")
            .attr("d", valueline_play(data));
        // change the line appstore
        svg.select("#appstore")
            .duration(750)
            .style("opacity", 1)
            .style("stroke", "green")
            .attr("d", valueline_appstore(data));

        svg.selectAll(".fb-dot")
            .duration(750)
            .style("opacity", 1)
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(d.datetime);
            })
            .attr("cy", function (d) {
                return y(d.fb);
            })
            .attr("value", function (d) {
                return d.fb;
            });

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function showStoreGraph(store_id) {
    // Get the data again
    d3.json("data.json", function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d[store_id] = +d[store_id];
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d[store_id];
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#" + store_id)
            .duration(750)
            .style("display", "inline")
            .attr("d", valueline(data));
        svg.selectAll("." + store_id + "-dot")
            .duration(750)
            .style("display", "inline");

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function hideStoreGraph(store_id) {
    d3.json("data.json", function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d[store_id] = +d[store_id];
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d[store_id];
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#" + store_id)
            .duration(750)
            .style("display", "none");
        svg.selectAll("." + store_id + "-dot")
            .duration(750)
            .style("display", "none");

        // !@!@!@!@!@!@!@!@ Here this might not be needed !@!@!@!@!@!@!@!@

        //svg.select(".x.axis") // change the x axis
        //    .duration(750)
        //    .call(xAxis);
        //svg.select(".y.axis") // change the y axis
        //    .duration(750)
        //    .call(yAxis);

    });
}

d3.select("#update").on("click", updateData);
d3.select("#show-all").on("click", function () {
    if (this.checked) {
        showAllGraphs();
    } else {
        hideAllGraphs();
    }
});
d3.select("#show-facebook").on("click", function () {
    var store_id = this.getAttribute("value");
    if (this.checked) {
        showStoreGraph(store_id);
    } else {
        hideStoreGraph(store_id);
    }
});
d3.select("#show-playstore").on("click", function () {
    var store_id = this.getAttribute("value");
    if (this.checked) {
        showStoreGraph(store_id);
    } else {
        hideStoreGraph(store_id);
    }
});

d3.select("#show-appstore").on("click", function () {
    var store_id = this.getAttribute("value");
    if (this.checked) {
        showStoreGraph(store_id);
    } else {
        hideStoreGraph(store_id);
    }
});


function showFacebookData() {
    // Get the data again
    d3.json("data.json", function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.fb = +d.fb;
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.fb;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#fb")
            .duration(750)
            .style("display", "inline")
            .attr("d", valuelineFB(data));
        svg.selectAll(".fb-dot")
            .duration(750)
            .style("display", "inline");

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function showPlaystoreData() {
    // Get the data again
    d3.json("data.json", function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.play = +d.play;
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.play;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#playstore")
            .duration(750)
            .style("display", "inline")
            .attr("d", valuelinePL(data));
        svg.selectAll(".playstore-dot")
            .duration(750)
            .style("display", "inline");

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}

function showAppstoreData() {
    // Get the data again
    d3.json("data.json", function (error, data) {
        data.forEach(function (d) {
            d.datetime = parseDate(d.datetime);
            d.appstore = +d.appstore;
        });

        // Scale the range of the data again
        x.domain(d3.extent(data, function (d) {
            return d.datetime;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.appstore;
        })]);

        // Select the section we want to apply our changes to
        var svg = d3.select(".chart").transition();

        // Make the changes
        // change the line facebook
        svg.select("#appstore")
            .duration(750)
            .style("display", "inline")
            .attr("d", valuelineAP(data));
        svg.selectAll(".appstore-dot")
            .duration(750)
            .style("display", "inline");

        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

    });
}