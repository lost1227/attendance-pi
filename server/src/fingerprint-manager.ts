import GT511C3 from "gt511c3";
import { catchError, defer, from, map, Observable, of, repeat } from "rxjs";

export class IdentifyResult {
    constructor(
        public success: boolean,
        public id: number,
        public error?: string
    ) {}
}

export class FingerprintManager {
    private reader = new GT511C3("/dev/ttyAMA0");

    public async init() {
        await this.reader.init();
        console.log(
            "Opened fingerprint reader. version:%s serial:%s",
            this.reader.firmwareVersion,
            this.reader.deviceSerialNumber
        );

        // await this.reader.changeBaudRate(115200);
    }

    public async ledOn() {
        await this.reader.ledONOFF(this.reader.LED_ON);
    }

    public async ledOff() {
        await this.reader.ledONOFF(this.reader.LED_OFF);
    }

    public identify(): Observable<IdentifyResult> {
        let reader = this.reader;
        let getSingleResult = () => from(
            reader.waitFinger(1000)
                .then(() => reader.captureFinger(reader.NOT_BEST_IMAGE))
                .then(() => reader.identify())
        ).pipe(
            map(id => new IdentifyResult(true, id)),
            catchError(error => {
                let errorStr = error;
                if(typeof error == 'number') {
                    errorStr = this.reader.decodeError(error);
                }
                return of(new IdentifyResult(false, -1, errorStr));
            })
        );

        return defer(getSingleResult).pipe(repeat());
    }
}
