export type UserInfo = {
  Id: string;
  SpId: string;
  SpDomain: string;
  Telephone: string;
  CustomerIds: number[];
  CustomerId: number;
  PrivilegeCodes: string[];
};

export interface WXBizData {
  phoneNumber: string;
  purePhoneNumber?: string;
  countryCode?: string;
  watermark: {
    appid: string;
    timestamp: any;
  };
}

export interface WXSessionInfo {
  openid: string;
  session_key: string;
  unionid: string;
  errcode: number;
  errmsg: string;
}

export interface WXInfo {
  sessionKey: string;
  Telephone?: string;
  appId: string;
}
