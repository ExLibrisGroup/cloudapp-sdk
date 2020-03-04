export interface Response {
    error?: any;
}

export interface StoreResponse extends Response {
    key: string,
    value: any;
}

export interface Entity extends Response {
    id: string;
    code?: string;
    type?: EntityType;
    link?: string;
}

export enum EntityType {
    BIB_MMS = 'BIB_MMS',
    LICENSE = 'LICENSE',
    USER = 'USER',
    ITEM = 'ITEM',
    COURSE = 'COURSE',
    READING_LIST = 'READING_LIST',
    REQUEST = 'REQUEST',
    CITATION = 'CITATION',
    AUTHORITY = 'AUTHORITY',
    HOLDING = 'HOLDING',
    /** Electronic collections */
    IEPA = 'IEPA',
    /** Library collections */
    IEC = 'IEC',
    PO_LINE = 'PO_LINE', 
    PORTFOLIO = 'PORTFOLIO',
    INVOICE = 'INVOICE',
    ELECTRONIC_SERVICE = 'ELECTRONIC_SERVICE',
    INVOICE_LINE = 'INVOICE_LINE', 
    LOAN = 'LOAN',
    REPRESENTATION = 'REPRESENTATION',
    REPRESENTATION_FILE = 'REPRESENTATION_FILE',
    VENDOR = 'VENDOR', 
    FUND = 'FUND', 
    REMINDER = 'REMINDER'
}

export interface PageInfo extends Response {
    entities: Entity[];
}

export interface InitData extends Response {
    user: { firstName: string, lastName: string },
    lang: string,
    color: string
}

export interface BasicResponse extends Response {
    success: boolean;
}

export interface RestResponse extends Response {
    body: any
}

export interface RestErrorResponse extends Response {
    ok: boolean,
    status: any,
    statusText: string,
    message: string,
    error: any
}

export interface RefreshPageResponse extends BasicResponse { }
export interface WriteSettingsResponse extends BasicResponse { }
export interface ReadSettingsResponse extends BasicResponse { }
export interface WriteConfigResponse extends BasicResponse { }
export interface ReadConfigResponse extends BasicResponse { }
