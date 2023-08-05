class TreeMapChart extends Chart {
    constructor(albums) {
        super(albums);
        this.colors = d3.scaleOrdinal()
            .domain(this.data.children.map(d => d.name))
            .range(d3.schemeCategory10);
        this.hoverColors = d3.scaleOrdinal()
            .domain(this.data.children.map(d => d.name))
            .range(d3.schemeCategory10.map(color => d3.color(color).brighter()));
    }

    prepareData() {
        const nestedAlbums = this.albums['feed']['entry'];
        const categoriesData = {};

        nestedAlbums.forEach(d => {
            const genre = d['category']['attributes']['label'];

            if (!(genre in categoriesData)) {
                categoriesData[genre] = {
                    totalAlbums: 0,
                };
            }

            categoriesData[genre].totalAlbums += 1;
        });

        const data = {
            name: "albums",
            children: Object.entries(categoriesData).map(([genre, data]) => ({
                name: genre,
                albums: data.totalAlbums,
            })),
        };

        data.children.sort((a, b) => b.albums - a.albums);

        return data;
    }

    createTreeMap() {
        const svg = d3.select("#tree-map-container")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        const root = d3.hierarchy(this.data)
            .sum(d => d.albums)
            .sort((a, b) => b.value - a.value);

        const treemap = d3.treemap()
            .size([this.width, this.height])
            .paddingOuter(3)
            .paddingInner(1)
            .round(true);

        treemap(root);

        const cell = svg.selectAll("g")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("transform", `translate(${d.x0 - 6}, ${d.y0 - 6})`)
                    .select("rect")
                    .attr("width", d.x1 - d.x0 + 12)
                    .attr("height", d.y1 - d.y0 + 12)
                    .attr("fill", (d, i) => this.hoverColors(d.data.name));
            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("transform", `translate(${d.x0}, ${d.y0})`)
                    .select("rect")
                    .attr("width", d.x1 - d.x0)
                    .attr("height", d.y1 - d.y0)
                    .attr("fill", (d, i) => this.colors(d.data.name));
            });

        cell.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", (d) => this.colors(d.data.name))
            .transition()
            .duration(800)
            .attr("fill-opacity", 1);

        cell.append("text")
            .attr("x", 5)
            .attr("y", 15)
            .text(d => d.data.name);
    }

    createSummaryTable() {
        const tableData = d3.select("#table-data");
        const tableRows = tableData
            .selectAll("tr")
            .data(this.data.children)
            .enter()
            .append("tr");

        tableRows.append("td").text(d => d.name);
        tableRows.append("td").text(d => d.albums);
    }
}
