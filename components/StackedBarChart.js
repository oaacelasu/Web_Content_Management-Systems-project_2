class StackedBarChart extends Chart {
  constructor(albums) {
    super(albums);
    this.colors = d3.scaleOrdinal().range(d3.schemeCategory10);
  }

  prepareData() {
    const nestedAlbums = this.albums["feed"]["entry"];
    const releaseDateData = {};

    nestedAlbums.forEach((d) => {
      const releaseDate = d["im:releaseDate"]["attributes"]["label"];
      const releaseYear = new Date(releaseDate).getFullYear();
      if (!(releaseYear in releaseDateData)) {
        releaseDateData[releaseYear] = 0;
      }
      releaseDateData[releaseYear] += 1;
    });

    const data = Object.entries(releaseDateData).map(
      ([releaseYear, count]) => ({
        year: releaseYear,
        count,
      })
    );

    data.sort((a, b) => b.albums - a.albums);

    return data;
  }

  createStackedBarChart() {
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
      .domain(this.data.map((d) => d.year))
      .range([0, width])
      .padding(0.1);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.count)])
      .nice()
      .range([height, 0]);
    const colorScale = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d.year))
      .range(d3.schemeCategory10);

    svg
      .selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => height - y(d.count))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => colorScale(d.year));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
  }

  createSummaryTable() {
    const tableData = d3.select("#table-data");
    const tableRows = tableData
      .selectAll("tr")
      .data(this.data)
      .enter()
      .append("tr");

    tableRows.append("td").text((d) => d.year);
    tableRows.append("td").text((d) => d.count);
  }
}
