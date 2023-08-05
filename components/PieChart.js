class PieChart extends Chart {
    constructor(albums) {
        super(albums);
        this.totalCount = this.data.reduce((sum, d) => sum + d.count, 0);
        this.radius = Math.min(this.chartWidth, this.chartHeight) / 2;

        this.color = d3.scaleOrdinal()
            .domain(this.data.map(d => d.price))
            .range(d3.schemeCategory10);

        this.hoverColor = d3.scaleOrdinal()
            .domain(this.data.map(d => d.price))
            .range(d3.schemeCategory10.map(color => d3.color(color).brighter()));
    }

    // Util function to calculate percentage
    getPercentage(count) {
        return ((count / this.totalCount) * 100).toFixed(2);
    }

    // Util function to format the album count label
    formatAlbumCount(count, price) {
        return `${count} albums are priced at ${price}`;
    }

    // Show the album count in the center
    showAlbumCount(count, price) {
        const albumCountDiv = d3.select("#album-count");
        albumCountDiv.text(this.formatAlbumCount(count, price));
        albumCountDiv.style("display", "block");
    }

    // Hide the album count in the center
    hideAlbumCount() {
        const albumCountDiv = d3.select("#album-count");
        albumCountDiv.text(`Total Albums: ${this.totalCount}`);
        albumCountDiv.style("display", "block");
    }

    getTotalCount() {
        return this.totalCount;
    }

    // Prepare data for the pie chart
    prepareData() {
        const pricesDict = {};

        // Loop through each album
        this.albums.forEach(d => {
            const priceStr = d['im:price']['label'];
            const price = Number(priceStr.replace('$', ''));
            if (price < 5) {
                if (!("< 5.00" in pricesDict)) {
                    pricesDict["< 5.00"] = 0;
                }
                pricesDict["< 5.00"] += 1;
            } else {
                if (!(priceStr in pricesDict)) {
                    pricesDict[priceStr] = 0;
                }
                pricesDict[priceStr] += 1;
            }
        });

        const otherCount = Object.entries(pricesDict).reduce((sum, [key, value]) => {
            if (value < 5) {
                delete pricesDict[key];
                return sum + value;
            }
            return sum;
        }, 0);

        if (otherCount > 0) {
            pricesDict["Other"] = otherCount;
        }

        // Convert the dictionary into an array of objects for D3 pie chart
        return Object.entries(pricesDict).map(([price, count]) => ({ price, count })).sort((a, b) => b.count - a.count);
    }

    // Create the pie chart
    createPieChart() {
        const pie = d3.pie().value(d => d.count);
        const arc = d3.arc().innerRadius(0).outerRadius(this.radius);
        const labelArc = d3.arc().innerRadius(this.radius + 30).outerRadius(this.radius + 30);

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        const arcs = svg.selectAll("path")
            .data(pie(this.data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => this.color(d.data.price))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                const arcHover = d3.arc().innerRadius(0).outerRadius(this.radius + 10);
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr("d", arcHover)
                    .attr("fill", d => this.hoverColor(d.data.price));

                this.showAlbumCount(d.data.count, d.data.price);
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr("d", arc)
                    .attr("fill", d => this.color(d.data.price));

                this.hideAlbumCount();
            });

        const textLabels = svg.selectAll("text")
            .data(pie(this.data))
            .enter()
            .append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => d.data.price);
    }

    // Create summary table
    createSummaryTable() {
        const tableData = d3.select("#table-data");
        const tableRows = tableData
            .selectAll("tr")
            .data(this.data)
            .enter()
            .append("tr");

        this.hideAlbumCount();

        tableRows.append("td").text(d => d.price);
        tableRows.append("td").text(d => d.count);
        tableRows.append("td").text(d => this.getPercentage(d.count) + "%");
    }
}
