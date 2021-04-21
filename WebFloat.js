import WebmBase from "./WebmBase";


export default class WebmFloat extends WebmBase {
    constructor(name, type) {
        super(name, type || 'Float');
    }

    getFloatArrayType() {
        return this.source && this.source.length === 4 ? Float32Array : Float64Array;
    }

    updateBySource() {
        var byteArray = this.source.reverse();
        var floatArrayType = this.getFloatArrayType();
        var floatArray = new floatArrayType(byteArray.buffer);
        this.data = floatArray[0];
    }

    updateByData() {
        var floatArrayType = this.getFloatArrayType();
        var floatArray = new floatArrayType([this.data]);
        var byteArray = new Uint8Array(floatArray.buffer);
        this.source = byteArray.reverse();
    }

    getValue() {
        return this.data;
    }

    setValue(value) {
        this.setData(value);
    }
}