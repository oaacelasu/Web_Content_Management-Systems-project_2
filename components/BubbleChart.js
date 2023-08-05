class BubbleChart extends Chart {

    // Util function to calculate the maximum number of songs for scaling
    getMaxSongs() {
        return d3.max(this.data, d => d.songs);
    }

    // Util function to calculate the maximum price for scaling
    getMaxPrice() {
        return d3.max(this.data, d => d.price);
    }

    // Util function to calculate the maximum item count for scaling bubble size
    getMaxItemCount() {
        return d3.max(this.data, d => d.unitPrice);
    }

    // Prepare data for the bubble chart
    prepareData() {
        const nestedAlbums = this.albums['feed']['entry'];
        const songData = {};

        nestedAlbums.forEach(d => {
            const priceStr = d['im:price']['label'];
            const price = Number(priceStr.replace('$', ''));
            const songs = Number(d['im:itemCount']['label']);

            if (!(songs in songData)) {
                // Initialize the entry if it doesn't exist
                songData[songs] = {
                    totalPrice: 0,
                    totalSongs: 0,
                    totalAlbums: 0,
                };
            }

            // Accumulate the total price and total songs for each number of songs
            songData[songs].totalPrice += price;
            songData[songs].totalSongs += songs;
            songData[songs].totalAlbums += 1;
        });

        // Calculate the average price per song for each unique number of songs
        const mergedData = Object.keys(songData).map(songs => {
            const totalPrice = songData[songs].totalPrice;
            const totalSongs = songData[songs].totalSongs;
            const totalAlbums = songData[songs].totalAlbums;
            const averagePricePerSong = totalPrice / totalSongs;

            return {
                songs: Number(songs),
                price: totalPrice / totalAlbums,
                unitPrice: averagePricePerSong,
            };
        }).sort((a, b) => a.songs - b.songs);

        return mergedData;
    }


    // Create the bubble chart
    createBubbleChart() {
        const svg = d3.select("#bubble-chart-container")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        const xScale = d3.scaleLinear()
            .domain([0, this.getMaxSongs()])
            .range([this.padding, this.chartWidth + this.padding]);

        const yScale = d3.scaleLinear()
            .domain([0, this.getMaxPrice()])
            .range([this.chartHeight + this.padding, this.padding]);

        const rScale = d3.scaleSqrt()
            .domain([0, this.getMaxItemCount()])
            .range([0, 30]); // Adjust the range for desired bubble size

        const onBubbleMouseOver = (event, d) => {
            const bubble = d3.select(event.target);
            bubble.attr("fill", "#ff0000");
            bubble.attr("r", rScale(d.unitPrice) + 5);

            // Add crosshair lines
            svg.append("line")
                .attr("class", "crosshair-x")
                .attr("x1", xScale(d.songs))
                .attr("y1", yScale(d.price))
                .attr("x2", xScale(d.songs))
                .attr("y2", yScale(0))
                .attr("stroke", "#ccc")
                .attr("stroke-dasharray", "4")
                .style("pointer-events", "none");

            svg.append("line")
                .attr("class", "crosshair-y")
                .attr("x1", xScale(d.songs))
                .attr("y1", yScale(d.price))
                .attr("x2", xScale(0))
                .attr("y2", yScale(d.price))
                .attr("stroke", "#ccc")
                .attr("stroke-dasharray", "4")
                .style("pointer-events", "none");


            svg.append("text")
                .attr("class", "unit-price-label")
                .attr("x", xScale(d.songs))
                .attr("y", yScale(d.price))
                .attr("text-anchor", "middle")
                .attr("dy", 5)
                .attr("font-size", "12px")
                .attr("fill", "#ffffff")
                .text(`$${d.unitPrice.toFixed(2)}`);
        };

        const onBubbleMouseOut = (event, d) => {
            const bubble = d3.select(event.target);
            bubble.attr("fill", "#007bff");
            bubble.attr("r", rScale(d.unitPrice));


            // Remove crosshair lines on mouseout
            svg.select(".crosshair-x").remove();
            svg.select(".crosshair-y").remove();

            svg.select(".unit-price-label").remove();
        };

        const circles = svg.selectAll("circle")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.songs))
            .attr("cy", d => yScale(0))
            .attr("r", d => rScale(0))
            .attr("class", "bubble")
            .attr("fill", "#007bff")
            .attr("opacity", 0.5)
            .attr("stroke", "#000000")
            .on("mouseover", onBubbleMouseOver)
            .on("mouseout", onBubbleMouseOut);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.chartHeight + this.padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.padding}, 0)`)
            .call(yAxis);

        // Add labels for the axes
        svg.append("text")
            .attr("transform", `translate(${this.chartWidth / 2 + this.padding}, ${this.height - 5})`)
            .style("text-anchor", "middle")
            .text("Number of Songs");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (this.chartHeight / 2))
            .attr("y", 5)
            .style("text-anchor", "middle")
            .text("Album Price");

        // Add info for the bubbles
        svg.append("text")
            .attr("transform", `translate(${this.chartWidth / 2 + this.padding}, ${this.padding / 2})`)
            .style("text-anchor", "middle")
            .text("Average Price Per Song");

        // Transition the bubbles to their actual positions
        circles.transition()
            .duration(1000) // Adjust the duration as needed
            .attr("cy", d => yScale(d.price))
            .attr("r", d => rScale(d.unitPrice));

    }

    // Create summary table
    createSummaryTable() {
        const tableData = d3.select("#table-data");
        const tableRows = tableData
            .selectAll("tr")
            .data(this.data)
            .enter()
            .append("tr");

        tableRows.append("td").text(d => d.songs);
        tableRows.append("td").text(d => `$${d.price.toFixed(2)}`);
        tableRows.append("td").text(d => d.unitPrice.toFixed(2));
    }
}
