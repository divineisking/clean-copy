export class DataTransferMock {
    constructor(initial = {}) {
        this.store = { ...initial };
    }

    getData(type) {
        return this.store[type] ?? '';
    }

    setData(type, value) {
        this.store[type] = value;
    }
}
