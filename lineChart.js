const width = 900;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 90;


// we are appending SVG first
const lineChart = d3.select("div#lineChart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj *3) + " "
        + (height + adj*2))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
d3.select("#dataviz_brushing1D")
    .call( d3.brushX()                     // Add the brush feature using the d3.brush function
        .extent( [ [0,100], [400,300] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    )

//-----------------------------DATA-----------------------------//

const timeConv = d3.timeParse("%Y");
const dataset = d3.csv("data.csv");
dataset.then(function(data) {
    var slices = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    });

//----------------------------SCALES----------------------------//
    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().rangeRound([height, 0]);
    xScale.domain(d3.extent(data, function(d){
        return timeConv(d.date)}));
    yScale.domain([(0), d3.max(slices, function(c) {
        return d3.max(c.values, function(d) {
            return d.measurement + 4; });
    })
    ]);

//-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .ticks((slices[0].values).length)
        .scale(yScale);

    const xaxis = d3.axisBottom()
        .ticks(d3.timeYear.every(4))
        .tickFormat(d3.timeFormat('%Y'))
        .scale(xScale);

//----------------------------LINES-----------------------------//
    const line = d3.line()
        //.defined(function(d) { return d.measurement >= 0 && d.measurement <= 270; })
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.measurement); });

    const dangerLine = d3.line()
        .defined(function(d) { return d.measurement >= 270; })
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.measurement); });


    let id = 0;
    const ids = function () {
        return "line-"+id++;
    }

    //270 Needed to Win Line
    lineChart.append('line')
        .attr('x1', 0)
        .attr('y1', height/2.03)
        .transition()
        .duration(2000)
        .attr('x2', width)
        .attr('y2', height/2.03)
        .attr('stroke', 'green')
    lineChart.append("text")
        .attr("class", "label")
        .attr("x", 50)
        .attr("y", height/2.08)
        .text("270 Needed")
        .style("fill", "green");
    lineChart.append("text")
        .attr("class", "label")
        .attr("x", 50)
        .attr("y", height/1.9)
        .text("To Win")
        .style("fill", "green");

    //2000 election annotation
    lineChart.append('line')
        .attr('x1', width/2+40)
        .attr('y1', height/2.03)
        .attr('x2', width/2+40)
        .attr('y2', 55)
        .style("stroke-dasharray", ("3, 3"))
        .attr('stroke', 'black');

    lineChart.append("text")
        .attr("class", "label")
        .attr("x", width/2-100)
        .attr("y", 30)
        .text("2000 Election Decided by the Supreme Court")
        .style("fill", "black");
    lineChart.append("text")
        .attr("class", "label")
        .attr("x", width/2-100)
        .attr("y", 50)
        .text("due to a contentious fight in Florida")
        .style("fill", "black");
//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .style("font", "18px times")
        .call(xaxis)
        .append("text")
        .attr("dy", "3em")
        .attr("x", width/2)
        .text("Election Year")
        .style('fill', 'black');

    lineChart.append("g")
        .style("font", "18px times")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .style("font", "15px times")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .style("font", "20px times")
        .text("Electoral College Votes");


//----------------------------LINES-----------------------------//


    const lines = lineChart.selectAll("lines")
        .data(slices)
        .enter()
        .append("g");

    //  lines.append("path")
    //  .attr("d", function(d) { return dangerLine(d.values); });
    lines.append("path")
        .attr("class", ids)
        .transition()
        .duration(2000)
        .attr("d", function(d) { return line(d.values); })
        // .attr("d", function(d) { return dangerLine(d.values); })
        .on("mouseover", function(event, d) {
            // show()
            console.log(d);
            // line1's legend is hovered
            d3.select(this).classed("highlight", true)

            if (d.id == "Democrats")
            {
                lineChart.selectAll(".line-0").style("stroke-width", "4px");
                lineChart.selectAll(".line-1").style("stroke", "gray");
                lineChart.selectAll(".line-1").style("stroke-opacity", "0.5");
            }
            else
            {
                lineChart.selectAll(".line-1").style("stroke-width", "4px")
                lineChart.selectAll(".line-0").style("stroke", "gray");
                lineChart.selectAll(".line-0").style("stroke-opacity", "0.5");
            }

        })
        .on("mouseout", function() {
            // revert the styles
            lineChart.selectAll(".line-0").style("stroke-width", "3px");
            lineChart.selectAll(".line-0").style("stroke", "blue");
            lineChart.selectAll(".line-0").style("stroke-opacity", "1");
            lineChart.selectAll(".line-1").style("stroke-width", "3px");
            lineChart.selectAll(".line-1").style("stroke-opacity", "1");
            lineChart.selectAll(".line-1").style("stroke", "red");
        });;

    lines.append("text")
        .attr("class","serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) - 5)
                + "," + (yScale(d.value.measurement) + 5 ) + ")"; })
        .attr("x", 5)
        .text(function(d) { return d.id; })
        .style("font", "20px times");

    d3.select("#lineChart")
        .call( d3.brush()                     // Add the brush feature using the d3.brush function
            .extent( [ [0,0], [400,400] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        )




})

//----------------------------Bar Chart-----------------------------//

const barMargin = {top: 30, right: 30, bottom: 70, left: 450},
    barWidth = 990 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;
// append the svg object to the body of the page
const barChart = d3.select("div#barChart")
    .append("svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);



// Parse the Data
d3.csv("barChartData.csv").then ( function(data) {

    // sort data
    data.sort(function(b, a) {
        return a.Value - b.Value;
    });

    const x = d3.scaleLinear()
        .domain([0, 40])
        .range([ 0, barWidth]);
    barChart.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font", "15px times");

    // Y axis
    const y = d3.scaleBand()
        .range([ 0, barHeight ])
        .domain(data.map(d => d.Country))
        .padding(.1);
    barChart.append("g")
        .call(d3.axisLeft(y))
        .style("font", "15px times")

    //Bars
    barChart.selectAll("myRect")
        .data(data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d.Country))
        .transition()
        .duration(2000)
        .attr("width", d => x(d.Value))
        .attr("height", y.bandwidth())
        .attr("fill", "teal")



    bars =  barChart.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font", "15px times");
    bars.append("g")
        .call(d3.axisLeft(y))
        .style("font", "15px times")
    bars.selectAll("myRect")
        .data(data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d.Country))
        .attr("width", d => x(d.Value))
        .attr("height", y.bandwidth())
        .attr("fill", "teal")


    barChart.append("text")
        .data(data)
        //.attr("x", d => x(d.Value) )
        .attr("x", 475)
        .attr("y", d => y(d.Country) + 30)
        .attr("dy", ".35em")
        .text(function(d) { return d.Value; });

    barChart.append("text")
        .data(data)
        //.attr("x", d => x(d.Value) )
        .attr("x", function(d) { return x(d.Value[1]) + 90; })
        .attr("y", 250)
        .attr("dy", ".35em")
        .text("14");

    barChart.append("text")
        .data(data)
        //.attr("x", d => x(d.Value) )
        .attr("x", 320)
        .attr("y", 160)
        .attr("dy", ".35em")
        .text("25");
});

//----------------------------Parallel coordinates-----------------------------//
// set the dimensions and margins of the graph
var parallelMargin = {parallelTop: 30, parallelRight: 100, parallelBottom: 10, parallelLeft: -130},
    parallelWidth = 1200 - parallelMargin.parallelLeft - parallelMargin.parallelRight,
    parallelHeight = 500 - parallelMargin.parallelTop - parallelMargin.parallelBottom;

const svg = d3.select("#parallelChart")
    .append("svg")
    .attr("width", parallelWidth + parallelMargin.parallelLeft + parallelMargin.parallelRight)
    .attr("height", parallelHeight + parallelMargin.parallelTop + parallelMargin.parallelBottom)
    .append("g")
    .attr("transform",
        `translate(${parallelMargin.parallelLeft},${parallelMargin.parallelTop})`);

// Parse the Data
d3.csv("parallelData.csv").then( function(data) {
    var color = d3.scaleOrdinal()
        .domain(["Democrats", "republicans", "virginica" ])
        .range([ "blue", "red", "#fde725ff"])
    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    dimensions = Object.keys(data[0]).filter(function(d) { return d != "Species" })

    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}
    for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain([0, 100])
            .range([parallelHeight, 0])

    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, parallelWidth])
        .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(data)
        .join("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", function(d){ return( color(d.Species))} )
        .style("opacity", 0.5)



    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .style("font", "15px times")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")
        .style("font", "14px times")


})



//----------------------------Bubble Chart-----------------------------//
// set the dimensions and margins of the graph
const bubbleMargin = {bubbleTop: 130, bubbleRight: 50, bubbleBottom: 50, bubbleLeft: 50},
    bubbleWidth = 800 - bubbleMargin.bubbleLeft - bubbleMargin.bubbleRight,
    bubbleHeight = 550 - bubbleMargin.bubbleTop - bubbleMargin.bubbleBottom;

// append the svg object to the body of the page
const bubbleChart = d3.select("#bubbleChart")
    .append("svg")
    .attr("width", bubbleWidth + bubbleMargin.bubbleLeft + bubbleMargin.bubbleRight)
    .attr("height", bubbleHeight + bubbleMargin.bubbleTop + bubbleMargin.bubbleBottom)
    .append("g")
    .attr("transform", `translate(${bubbleMargin.bubbleLeft},${bubbleMargin.bubbleTop})`);

//Read the data
d3.csv("lollipopData.csv").then( function(data) {

    // Add X axis
    const bubbleX = d3.scaleLinear()
        .domain([0, 100])
        .range([ 0, bubbleWidth ]);

    bubbleChart.append("g")
        .attr("transform", `translate(0, ${bubbleHeight})`)
        .call(d3.axisBottom(bubbleX))
        .style("font", "15px times")
        .attr("font-weight", 500);;
    bubbleChart.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", bubbleWidth-180)
        .attr("y", bubbleHeight + 40)
        .text("% of Total Vote for Democrats")
        .attr("font-weight", 500);
    bubbleChart.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -40)
        .attr("x", -20)
        .attr("dy", ".154em")
        .attr("transform", "rotate(-90)")
        .text("% of Total Population College-Educated")
        .attr("font-weight", 500);

    // Add Y axis
    const bubbleY = d3.scaleLinear()
        .domain([15, 50])
        .range([ bubbleHeight, 0]);
    bubbleChart.append("g")
        .call(d3.axisLeft(bubbleY))
        .style("font", "15px times")
        .attr("font-weight", 500);

    // Add a scale for bubble size
    const z = d3.scaleLinear()
        .domain([500000, 40000000])
        .range([ 4, 40]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(["democrats", "republicans"])
        .range(["blue", "red"]);

    //legend
    bubbleChart.append("circle")
        .attr("cx", 40)
        .attr("cy", -110)
        .attr("r", 4)
        .attr("fill", "#bed8ec");
    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", 90)
        .attr("y", -110)
        .text("Population = 500,000");

    bubbleChart.append("circle")
        .attr("cx", 40)
        .attr("cy", -50)
        .attr("r", 40)
        .attr("fill", "#bed8ec");
    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", 90)
        .attr("y", -50)
        .text("Population = 40,000,000");

    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", 300)
        .attr("y", -110)
        .text("Red = State Voted For a Republican")
        .style("fill", "red");

    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", 300)
        .attr("y", -50)
        .text("Blue = State Voted For a Democrat")
        .style("fill", "blue");
    //Line for average % educated Americans
    bubbleChart.append('line')
        .attr('x1', 0)
        .attr('y1', bubbleHeight/2)
        .attr('x2', bubbleWidth)
        .attr('y2', bubbleHeight/2)
        .attr('stroke', 'green')
    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", bubbleWidth-150)
        .attr("y", bubbleHeight/2.08)
        .text("Average % of Americans")
        .style("fill", "green");
    bubbleChart.append("text")
        .attr("class", "label")
        .attr("x", bubbleWidth-150)
        .attr("y", bubbleHeight/1.8)
        .text("With a Bachelor's Degree")
        .style("fill", "green");

    //Aged 25+ With a Bachelor's");

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#bubbleChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip

    const showTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("state: " + d.state + " ----- " + "population voted for dems: " + d.percentDems + "% ----- percent college educated: " + d.educated + "% ----- total population: " + d.pop)
            .style("left", (event.bubbleX)/2 + "px")
            .style("top", (event.bubbleY)/2+30 + "px")
    }
    const moveTooltip = function(event, d) {
        tooltip
            .style("left", (event.bubbleX)/2 + "px")
            .style("top", (event.bubbleY)/2+30 + "px")
    }
    const hideTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Add dots
    bubbleChart.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("class", "bubbles")
        .transition()
        .duration(2000)
        .attr("cx", d => bubbleX(d.percentDems))
        .attr("cy", d => bubbleY(d.educated))
        .attr("r", d => z(d.pop))
        .style("fill", d => myColor(d.party))
        // -3- Trigger the functions
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )


})


