class BarChart extends Chart {
  constructor(albums) {
    super(albums);
    this.colors = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d.name))
      .range(d3.schemeCategory10);
  }

  // Prepare data for the bar chart
  prepareData() {
    const nestedAlbums = this.albums["feed"]["entry"];
    const genresData = {};

    nestedAlbums.forEach((d) => {
      const genre = d["category"]["attributes"]["label"];

      if (!(genre in genresData)) {
        genresData[genre] = 0;
      }

      genresData[genre] += 1;
    });

    const data = Object.entries(genresData).map(([genre, albumCount]) => ({
      name: genre,
      albums: albumCount,
    }));

    data.sort((a, b) => b.albums - a.albums);

    return data;
  }
  createBarChart() {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    const svg = d3
      .select("#bar-chart-container")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(this.data.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.albums)])
      .nice()
      .range([height, 0]);

    svg
      .selectAll(".bar")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.albums))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.albums))
      .attr("fill", (d, i) => this.colors(d.name));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // X-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Genres");

    // Y-axis label
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Number of Albums");
  }

  createSummaryTable() {
    const tableData = d3.select("#table-data");
    const tableRows = tableData
      .selectAll("tr")
      .data(this.data)
      .enter()
      .append("tr");

    tableRows.append("td").text((d) => d.name);
    tableRows.append("td").text((d) => d.albums);
  }
}
