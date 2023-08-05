class Chart {
    constructor(albums) {
        this.albums = albums;
        this.data = this.prepareData();
        this.chartWidth = 800;
        this.chartHeight = 400;
        this.padding = 100;
        this.width = this.chartWidth + this.padding * 2;
        this.height = this.chartHeight + this.padding * 2;
    }
    prepareData() {
        // ... (existing implementation)
    }

    createTreeMap() {
        // ... (existing implementation)
    }

    createSummaryTable() {
        // ... (existing implementation)
    }
}
