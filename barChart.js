const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const barChart = d3.select("div#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("barChartData.csv").then ( function(data) {

    // sort data
    data.sort(function(b, a) {
        return a.Value - b.Value;
    });

    const x = d3.scaleLinear()
        .domain([0, 40])
        .range([ 0, width]);
    barChart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font", "20px times");

    // Y axis
    const y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(d => d.Country))
        .padding(.1);
    barChart.append("g")
        .call(d3.axisLeft(y))

    //Bars
    barChart.selectAll("myRect")
        .data(data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d.Country))
        .attr("width", d => x(d.Value))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2")

})