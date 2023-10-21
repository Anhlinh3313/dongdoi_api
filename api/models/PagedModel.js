
module.exports = class PagedModel {
    constructor(pageIndex, pageSize, totalPages, data) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
        this.data = data;
    }
}