export default class WebmBase {
    constructor(name, type) {
        this.name = name || 'Unknown';
        this.type = type || 'Unknown';
    }

    updateBySource() { }

    setSource(source) {
        this.source = source;
        this.updateBySource();
    };
    updateByData() { };
    setData(data) {
        this.data = data;
        this.updateByData();
    };
}