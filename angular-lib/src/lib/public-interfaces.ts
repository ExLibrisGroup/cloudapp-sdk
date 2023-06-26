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
    type: EntityType;
    link: string;
    description: string;
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
    REMINDER = 'REMINDER',
    BORROWING_REQUEST = 'BORROWING_REQUEST',
    LENDING_REQUEST = 'LENDING_REQUEST',
    SET = 'SET',
    PARTNER = 'PARTNER',
    /** Esploro Assets */
    IER = 'IER'
}

export interface PageInfo extends Response {
    entities: Entity[];
}

export enum UrlTypes {
    ALMA = 'alma'
}

export interface InitData extends Response {
    user: { 
        firstName: string, 
        lastName: string,
        primaryId: string,
        currentlyAtLibCode: string,
        currentlyAtCircDesk: string,
        currentlyAtDept: string,
        isAdmin: boolean
     },
    lang: string,
    instCode: string,
    urls: { [key in UrlTypes]: string },
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
