import _ from "lodash";
import { decryptData } from "./wx-biz-data-crypt";
import { Application, Request, Response } from "express";
import { UserInfo, WXBizData, WXSessionInfo, WXInfo } from "./model";
import { APP_INFO } from "../../config";
import logger from "../../logger";
import request from "request-promise";
import { SOURCE_CLASSIC } from "../..//source-map";

async function wxLogin(req: Request): Promise<WXSessionInfo> {
  const { jsCode, appId } = req.query as any;
  return await request({
    method: "GET",
    uri: "https://api.weixin.qq.com/sns/jscode2session",
    qs: {
      appid: appId,
      secret: APP_INFO[appId],
      js_code: jsCode,
      grant_type: "authorization_code"
    },
    headers: {
      Accept: "application/json"
    },
    json: true
  });
}

async function getUserInfoByPhoneNumber(
  phoneNumber: string
): Promise<UserInfo> {
  const res = await request({
    method: "GET",
    uri: SOURCE_CLASSIC + "/api/user/GetUserByPhone/" + phoneNumber,
    headers: {
      Accept: "application/json"
    },
    json: true
  });
  return (
    res.Result &&
    (_.pick(res.Result, [
      "Id",
      "Name",
      "SpId",
      "Title",
      "Email",
      "SpDomain",
      "Telephone",
      "CustomerIds",
      "CustomerId",
      "PrivilegeCodes"
    ]) as UserInfo)
  );
}

export default function authRoute(app: Application) {
  app.get("/login", async (req: Request, res: Response) => {
    try {
      const wxSessionInfo = await wxLogin(req);
      if (wxSessionInfo.errmsg) {
        const { errmsg, errcode } = wxSessionInfo;
        throw { errcode, errmsg };
      }
      const session = req.session as any;
      session.wxInfo = {
        sessionKey: wxSessionInfo.session_key,
        appId: req.query.appId
      } as WXInfo;
      res.send(session.id);
    } catch (err) {
      logger.error("Failed to login:", err);
      res.sendStatus(401);
    }
  });

  app.post("/auth", async (req: Request, res: Response) => {
    const session = req.session as any;
    try {
      const { data, iv } = req.body;
      const { wxInfo } = session;
      if (!wxInfo) {
        res.sendStatus(401);
        return;
      }
      const { sessionKey, appId } = wxInfo as WXInfo;
      const bizData = decryptData(appId, sessionKey, data, iv) as WXBizData;
      const userInfo = await getUserInfoByPhoneNumber(bizData.phoneNumber);
      session.info = userInfo;
      session.wxInfo = {
        ...session.wxInfo,
        Telephone: bizData.phoneNumber
      };
      res.send(userInfo || { Telephone: bizData.phoneNumber });
    } catch (err) {
      if (session) {
        session.destroy(() => {
          logger.info(`Session [${session.id}] is destroyed`);
        });
      }
      logger.error("Failed to login:", err);
      res.sendStatus(401);
    }
  });

  app.get("/getUserInfo", async (req: Request, res: Response) => {
    const session = req.session as any;
    try {
      const { wxInfo } = session;
      if (!wxInfo) {
        res.sendStatus(401);
        return;
      }
      let userInfo = null;
      userInfo = await getUserInfoByPhoneNumber(wxInfo.Telephone);
      session.info = userInfo;
      res.send(userInfo || { Telephone: wxInfo.Telephone });
    } catch (err) {
      if (session) {
        session.destroy(() => {
          logger.info(`Session [${session.id}] is destroyed`);
        });
      }
      logger.error("Failed to login:", err);
      res.sendStatus(401);
    }
  });

  app.get("/logout", (req: Request, res: Response) => {
    const session = req.session as any;
    const wxInfo = session.wxInfo as WXInfo;
    session.destroy(() => {
      logger.info(wxInfo && `${wxInfo.Telephone} is logged out.`);
    });
    return res.sendStatus(200);
  });
}
