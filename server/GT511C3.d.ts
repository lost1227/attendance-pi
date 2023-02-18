declare module "gt511c3" {
    export default class GT511C3 {
        public readonly NO_EXTRA_INFO: number;
        public readonly EXTRA_INFO: number;
        public readonly LED_OFF: number;
        public readonly LED_ON: number;
        public readonly NOT_BEST_IMAGE: number;
        public readonly BEST_IMAGE: number;

        public readonly NACK_TIMEOUT: number;
        public readonly NACK_INVALID_BAUDRATE: number;
        public readonly NACK_INVALID_POS: number;
        public readonly NACK_IS_NOT_USED: number;
        public readonly NACK_IS_ALREADY_USED: number;
        public readonly NACK_COMM_ERR: number;
        public readonly NACK_VERIFY_FAILED: number;
        public readonly NACK_IDENTIFY_FAILED: number;
        public readonly NACK_DB_IS_FULL: number;
        public readonly NACK_DB_IS_EMPTY: number;
        public readonly NACK_TURN_ERR: number;
        public readonly NACK_BAD_FINGER: number;
        public readonly NACK_ENROLL_FAILED: number;
        public readonly NACK_IS_NOT_SUPPORTED: number;
        public readonly NACK_DEV_ERR: number;
        public readonly NACK_CAPTURE_CANCELED: number;
        public readonly NACK_INVALID_PARAM: number;
        public readonly NACK_FINGER_IS_NOT_PRESSED: number;

        public firmwareVersion: string;
        public isoAreaMaxSize: number;
        public deviceSerialNumber: string;
        public serialPort: string;

        constructor(
            port: string,
            options?: {
                debug: boolean,
                baudrate: number
            }
        );

        /**
         * Open the serialport and initialize the fingerprint module.
         * After the init procedure global variables such as firmwareVersion, isoAreaMaxSize and
         * deviceSerialNumber are available.
         */
        public init(): Promise<void>;

        /**
         * Send the OPEN command to the fingerprint module.
         * @param extra_info Specify whether to request extra informations or not. Global variables
         * such as EXTRA_INFO or NO_EXTRA_INFO may be used.
         */
        public open(extra_info: number): Promise<void>;

        /**
         * Send the CLOSE command to the fingerprint module and close the serial port.
         */
        public close(): Promise<void>;

        /**
         * Close the serial port.
         */
        public closePort(): Promise<void>;

        /**
         * Send the USB_INTERNAL_CHECK command to the fingerprint module.
         */
        public usbInternalCheck(): Promise<void>;

        /**
         * Send the CMOS_LED command to the fingerprint module.
         * @param led_state Specify whether to switch the onboard leds on or off. Global variables
         * such as LED_OFF or LED_ON may be used.
         */
        public ledONOFF(led_state: number): Promise<void>;

        /**
         * Send the CHANGE_BAUDRATE command to the fingerprint module to change the module baudrate.
         * If the command is acknowledged, the serialport baudrate will be updated as well.
         * @param baudrate The new baudrate [9600, 19200, 38400, 57600, 115200]
         */
        public changeBaudRate(baudrate: number): Promise<void>;

        /**
         * Send the GET_ENROLL_COUNT command to the fingerprint module. Returns a promise with the
         * number of enrolled fingerprints in case of success.
         */
        public getEnrollCount(): Promise<number>;

        /**
         * Send the CHECK_ENROLLED command to the fingerprint module to check if a specified ID is
         * enrolled or not.
         * @param id Specify the fingerprint's ID to check [0..199]
         */
        public checkEnrolled(ID: number): Promise<void>;

        /**
         * Send the ENROLL_START command to the fingerprint module to start the enrollment procedure
         * for a specified ID.
         *
         * Note: the onboard leds must be switched ON before sending this command.
         *
         * @param ID Specify the fingerprint's ID to enroll [0..199]
         */
        public enrollStart(ID: number): Promise<void>;

        /**
         * Send the ENROLL_1 command to the fingerprint module to execute the first step of the
         * enrollment procedure.
         *
         * Note: the onboard leds must be switched ON before sending this command.
         */
        public enroll1(): Promise<void>;

        /**
         * Send the ENROLL_2 command to the fingerprint module to execute the first step of the
         * enrollment procedure.
         *
         * Note: the onboard leds must be switched ON before sending this command.
         */
        public enroll2(): Promise<void>;

        /**
         * Send the ENROLL_3 command to the fingerprint module to execute the first step of the
         * enrollment procedure.
         *
         * Note: the onboard leds must be switched ON before sending this command.
         */
        public enroll3(): Promise<void>;

        /**
         * Send the IS_PRESS_FINGER command to the fingerprint module to check if a finger is
         * correctly placed on the fingerprint sensor or not.
         *
         * Note: The onboard leds must be switched ON before sending this command.
         *
         * @returns A successful promise if the finger is placed, or an error if the finger is
         * not placed.
         */
        public isPressFinger(): Promise<void>;

        /**
         * Wait until a finger is correctly placed on the fingerprint sensor.
         *
         * Note: The onboard leds must be switched ON before sending this command.
         *
         * @param timeout Specify how many milliseconds to wait before firing a timeout event and
         * rejecting the promise.
         */
        public waitFinger(timeout: number): Promise<void>;

        /**
         * Wait until a finger is removed from the fingerprint sensor.
         *
         * Note: The onboard leds must be switched ON before sending this command.
         *
         * @param timeout Specify how many milliseconds to wait before firing a timeout event and
         * rejecting the promise.
         */
        public waitReleaseFinger(timeout: number): Promise<void>;

        /**
         * Execute a full enrollment procedure for the specified ID.
         * @param ID Specify the fingerprint's ID to enroll [0..199]
         */
        public enroll(ID: number): Promise<void>;

        /**
         * Send the DELETE_ID command to the fingerprint module to delete a specified ID.
         * @param ID Specify the fingerprint's ID to delete [0..199]
         */
        public deleteID(ID: number): Promise<void>;

        /**
         * Send the DELETE_ALL command to the fingerprint module to delete all the 200 IDs.
         */
        public deleteAll(): Promise<void>;

        /**
         * Send the VERIFY command to the fingerprint module to verify if the finger placed on the
         * fingerprint sensor matches the specified ID.
         *
         * Note: The onboard leds must be switched ON before sending this command.
         *
         * @param ID Specify the fingerprint's ID to verify [0..199]
         * @returns A successful promise if the finger matches, or an error if the finger does not.
         */
        public verify(ID: number): Promise<void>;

        /**
         * Send the IDENTIFY command to the fingerprint module to identify the finger placed on the
         * fingerprint sensor.
         *
         * Note: The onboard leds must be switched ON before sending this command.
         *
         * @returns The identified ID.
         */
        public identify(): Promise<number>;

        /**
         * Send the VERIFY_TEMPLATE command to the fingerprint module to verify the supplied
         * template matches the specified ID.
         * @param ID Specify the fingerprint's ID to check [0..199]
         * @param template A 498 byte Buffer containing the template to verify
         * @returns A successful promise if the template matches, or an error if the template
         * does not.
         */
        public verifyTemplate(ID: number, template: Buffer): Promise<void>;

        /**
         * Send the IDENTIFY_TEMPLATE command to the fingerprint module to identify the supplied
         * template.
         * @param template A 498 byte Buffer containing the template to identify
         * @returns The matched ID
         */
        public identifyTemplate(template: Buffer): Promise<number>;

        /**
         * Send the CAPTURE_FINGER command to the fingerprint module.
         * @param image_type Specify whether to capture the fingerprint at high resolution or not.
         * Global variables such as BEST_IMAGE or NOT_BEST_IMAGE may be used.
         */
        public captureFinger(image_type: number): Promise<void>;

        /**
         * Send the MAKE_TEMPLATE command to the fingerprint module to retrieve the template of the
         * finger placed on the fingerprint sensor.
         * @returns A 498 byte Buffer containing the created template.
         */
        public makeTemplate(): Promise<Buffer>;

        /**
         * Send the GET_IMAGE command to the fingerprint module to retrieve the image of the finger
         * placed on the fingerprint sensor.
         * @returns A 52116 byte Buffer containing the image.
         */
        public getImage(): Promise<Buffer>;

        /**
         * Send the GET_RAW_IMAGE command to the fingerprint module to retrieve the raw image of the
         * finger placed on the fingerprint sensor.
         * @returns A 19200 byte Buffer containing the image.
         */
        public getRawImage(): Promise<Buffer>;

        /**
         * Send the GET_TEMPLATE command to the fingerprint module to retrieve the template that
         * matches the specified ID.
         * @param ID Specify the fingerprint's ID [0..199]
         * @returns A 498 byte Buffer containing the template.
         */
        public getTemplate(ID: number): Promise<Buffer>;

        /**
         * Send the SET_TEMPLATE command to the fingerprint module to set the template for a
         * specified fingerprint ID.
         * @param ID Specify the fingerprint's ID [0..199]
         * @param template A 498 byte Buffer containing the template.
         */
        public setTemplate(ID: number, template: Buffer): Promise<void>;

        /**
         * Returns the string representation of the provided error code.
         */
        public decodeError(errorCode: number): string;
    }
}
