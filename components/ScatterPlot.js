class ScatterPlot extends Chart {
  constructor(albums) {
    super(albums);
    this.margin = { top: 20, right: 30, bottom: 40, left: 40 };
    this.width = this.width - this.margin.left - this.margin.right;
    this.height = this.height - this.margin.top - this.margin.bottom;
  }

  prepareData() {
    const nestedAlbums = this.albums["feed"]["entry"];

    return nestedAlbums.map((album) => ({
      price: parseFloat(album["im:price"]["label"].replace("$", "")),
      releaseDate: new Date(album["im:releaseDate"]["label"]).getFullYear(),
    }));
  }

  createScatterPlot() {
    const svg = d3
      .select("#scatter-plot-container")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.price)])
      .range([0, this.width]);
    const yScale = d3
      .scaleBand()
      .domain(this.data.map((d) => d.releaseDate))
      .range([0, this.height])
      .padding(0.1);

    const tooltip = svg
      .append("text")
      .attr("class", "tooltip")
      .style("visibility", "hidden");

    // Create scatter plot circles
    const circles = svg
      .selectAll("circle")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.price))
      .attr("cy", (d) => yScale(d.releaseDate))
      .attr("r", 6) // Circle radius
      .attr("fill", "steelblue") // Circle color
      .on("mouseover", function (d, i) {
        d3.select(this).transition().duration("300").attr("r", 20);
      })
      .on("mouseout", function (d, i) {
        d3.select(this).transition().duration("200").attr("r", 5);
      });

    // Create x-axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", 30)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .text("Price");

    // Create y-axis
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("x", -this.height / 2)
      .attr("y", -30)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .text("Year")
      .attr("transform", "rotate(-90)");
  }
  createSummaryTable() {
    const tableData = d3.select("#table-data");
    const tableRows = tableData
      .selectAll("tr")
      .data(this.data)
      .enter()
      .append("tr");

    tableRows.append("td").text((d) => d.releaseDate);
    tableRows.append("td").text((d) => `$${d.price.toFixed(2)}`);
  }
}
