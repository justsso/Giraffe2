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
        openid: wxSessionInfo.openid,
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
      userInfo.openid = wxInfo.openid;
      res.send(
        userInfo || { Telephone: bizData.phoneNumber, openid: wxInfo.openid }
      );
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

  // TODO: 将接口数据转换掉
  app.get("/api/buildings", (req: Request, res: Response) => {
    const buildings = [
      {
        id: 1,
        buildingImg: "/assets/img/pic_bg.png",
        buildingName: "建筑名称",
        distributionBoxNum: 123,
        alarmCount: 12
      },
      {
        id: 2,
        buildingImg: "/assets/img/pic_bg.png",
        buildingName: "建筑名称2",
        distributionBoxNum: 76,
        alarmCount: 8
      },
      {
        id: 3,
        buildingImg: "/assets/img/pic_bg.png",
        buildingName: "建筑名称3",
        distributionBoxNum: 3,
        alarmCount: 0
      }
      // {
      //   id: 4,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称",
      //   distributionBoxNum: 123,
      //   alarmCount: 12
      // },
      // {
      //   id: 5,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称2",
      //   distributionBoxNum: 76,
      //   alarmCount: 8
      // },
      // {
      //   id: 6,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称3",
      //   distributionBoxNum: 3,
      //   alarmCount: 0
      // },
      // {
      //   id: 7,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称",
      //   distributionBoxNum: 123,
      //   alarmCount: 12
      // },
      // {
      //   id: 8,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称2",
      //   distributionBoxNum: 76,
      //   alarmCount: 8
      // },
      // {
      //   id: 9,
      //   buildingImg: "/assets/img/pic_bg.png",
      //   buildingName: "建筑名称3",
      //   distributionBoxNum: 3,
      //   alarmCount: 0
      // }
    ];
    res.send(buildings);
  });

  app.post(`/api/building/:buildingId`, (req: Request, res: Response) => {
    const buildingData = {
      id: 0,
      parentId: 0,
      name: "宝星园小区",
      code: "string",
      type: 0,
      buildingArea: 0,
      industryId: 0,
      finishingDate: "2021-01-09T08:01:06.282Z",
      subType: 0,
      logoKey: "string",
      buildingImg:
        "https://se-test-static.energymost.com/to/module/Pop-UI/v8.0.5347/login-bg.90c8ff1f.jpg",
      buildingName: "宝星园小区",
      distributionBox: 98,
      location: {
        buildingId: 0,
        latitude: 0,
        longitude: 0,
        province: "string",
        districts: ["string"]
      },
      customerId: 0,
      customerName: "string",
      riskFactor: 0,
      status: 0,
      isLogbook: 0
    };
    res.send(buildingData);
  });

  app.get("/api/rooms/:buildingId", (req: Request, res: Response) => {
    const data = [
      {
        id: 1,
        title: "B2层",
        distributionBox: [
          {
            id: 21,
            img: "/assets/img/pic_bg.png",
            title: "消防动力双电源箱消防动力双电源箱消防动力双电源箱",
            code: "A00302BC",
            isCommunicate: true,
            alarmType: "1", // 故障
            floor: "29层",
            alarmTime: "2020/12/21 14:07"
          }
        ],
        alarmCount: 2
      },
      {
        id: 2,
        title: "B1层",
        distributionBox: [
          {
            id: 21,
            img: "/assets/img/pic_bg.png",
            title: "消防动力双电源箱",
            code: "A00302BC",
            isCommunicate: true,
            alarmType: "2", // 故障
            floor: "29层",
            alarmTime: "2020/12/21 14:07"
          }
        ],
        alarmCount: 0
      },
      {
        id: 3,
        title: "05层",
        distributionBox: [
          {
            id: 21,
            img: "/assets/img/pic_bg.png",
            title: "动力双电源箱",
            code: "A00302BC",
            isCommunicate: true,
            alarmType: "1", // 故障
            floor: "29层",
            alarmTime: "2020/12/21 14:07"
          }
        ],
        alarmCount: 2
      }
    ];
    res.send(data);
  });
}
