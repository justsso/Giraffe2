const {
  SERVICE_CLASSIC_WEBHOST = "172.26.71.1:8103",
  SERVICE_POP_CORE_APPHOST = "172.26.71.1:8114",
  SERVICE_LISA_APP = "172.26.71.1:8026",
  SERVICE_SIMBA = "172.26.71.1:8039"
} = process.env;

export enum API_METHOD {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE"
}

export interface SourceProxyConfig {
  target: string;
  whiteList?: [API_METHOD, string][];
}

export const SOURCE_CLASSIC = `http://${SERVICE_CLASSIC_WEBHOST}`;
export const SOURCE_SIMBA = `http://${SERVICE_SIMBA}`;

export const SourceMap: { [key: string]: SourceProxyConfig } = {
  POP: { target: `http://${SERVICE_POP_CORE_APPHOST}` },
  LISA: { target: `http://${SERVICE_LISA_APP}` },
  SIMBA: { target: `http://${SERVICE_SIMBA}` }
};
