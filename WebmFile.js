import WebmContainer from "./WebmContainer";
import WebmFloat from "./WebFloat";

export default class WebmFile extends WebmContainer {

    /**
     * @param {Uint8Array|ArrayBuffer} source  Webm bytearray
     */
    constructor(source) {
        super("File", "File");
        let data;
        if (source instanceof ArrayBuffer) {
            data = new Uint8Array(source);
        } else if (source instanceof Uint8Array) {
            data = source;
        } else {
            throw new Error("Arguments error, source must be Uint8Array or ArrayBuffer");
        }
        this.setSource(data);
    }

    fixDuration(duration) {
        var segmentSection = this.getSectionById(0x8538067);
        if (!segmentSection) {
            console.error('[fix-webm-duration] Segment section is missing');
            return false;
        }

        var infoSection = segmentSection.getSectionById(0x549a966);
        if (!infoSection) {
            console.error('[fix-webm-duration] Info section is missing');
            return false;
        }

        var timeScaleSection = infoSection.getSectionById(0xad7b1);
        if (!timeScaleSection) {
            console.error('[fix-webm-duration] TimecodeScale section is missing');
            return false;
        }

        var durationSection = infoSection.getSectionById(0x489);
        if (durationSection) {
            if (durationSection.getValue() <= 0) {
                durationSection.setValue(duration);
                console.debug('[fix-webm-duration] Duration section is present, but the value is empty, fixed');
            } else {
                console.debug('[fix-webm-duration] Duration section is present');
                return false;
            }
        } else {
            // append Duration section
            durationSection = new WebmFloat('Duration', 'Float');
            durationSection.setValue(duration);
            infoSection.data.push({
                id: 0x489,
                data: durationSection
            });

            console.debug('[fix-webm-duration] Duration section is missing, fixed');
        }

        // set default time scale to 1 millisecond (1000000 nanoseconds)
        timeScaleSection.setValue(1000000);
        infoSection.updateByData();
        segmentSection.updateByData();
        this.updateByData();

        return true;
    }

    toBlob() {
        return new Blob([this.source.buffer], { type: 'video/webm' });
    }
}