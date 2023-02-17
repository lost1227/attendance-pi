import { ServerState } from './server-state.model';

export enum MessageType {
    SERVER_STATE = "server-state",
    SWITCH_MODE = "switch-mode",
    ATTENDANCE_EVENT = "attendance-event"
}

export enum AppMode {
    CHECK_IN = "check-in",
    CHECK_OUT = "check-out",
    ENROLL = "enroll"
}

export enum AttendanceEventType {
    CHECK_IN = "check-in",
    CHECK_OUT = "check-out",
    ERROR_FINGERPRINT = "error-fingerprint"
};

export interface WebsocketMessage {
    type: MessageType
}

export class SwitchModeMessage implements WebsocketMessage {
    type = MessageType.SWITCH_MODE;
    constructor(
        public mode: AppMode
    ) {}
}

export class ServerStateMessage implements WebsocketMessage {
    public type = MessageType.SERVER_STATE;

    constructor(
        public state: ServerState
    ) {}
}

export class AttendanceEventMessage implements WebsocketMessage {
    public type = MessageType.ATTENDANCE_EVENT;

    constructor(
        public studentId: number,
        public event: AttendanceEventType
    ) {}
}
