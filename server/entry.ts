import { authjsHandler, authjsSessionMiddleware } from "./authjs-handler";
import { getPrismaForD1 } from "./prisma-factory";
import { telefuncHandler } from "./telefunc-handler";
import { prismaMiddleware } from "./prisma-middleware";
import { registerApiRoutes } from "./routes";
import { createRequestContext, runWithRequestContext } from "../lib/request-context";
import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export default startApp() as unknown;

function startApp() {
  const app = new Hono();
  const apiApp = new Hono();

  app.use(async (c, next) => {
    const requestContext = createRequestContext(c.req.raw);
    (c as any).set("requestId", requestContext.requestId);
    (c as any).set("universalContext", {
      requestId: requestContext.requestId,
    } as any);

    await runWithRequestContext(requestContext, async () => {
      await next();
    });

    c.header("x-request-id", requestContext.requestId);
  });
  // api对外提供接口服务
  // `/api/*` 路由使用独立的 Hono 子应用，原因有两个：
  // 1. API 路由必须先于 `apply(app, [...])` 的页面兜底注册，否则支付回调会落到 SSR 404；
  // 2. API 路由又依赖 Prisma，因此需要在子应用内部单独注入上下文，不能只依赖 `apply()` 里的中间件链。
  //
  // 这样拆分后，结构会更清晰：
  // - `apiApp` 负责所有明确的 `/api/*` 路由及其所需中间件
  // - `apply(app, [...])` 继续负责页面、Auth.js、Telefunc 等通用链路
  apiApp.use("*", async (c, next) => {
    const database = (c.env as { DB?: D1Database } | undefined)?.DB;
    if (database) {
      const prisma = getPrismaForD1(database);

      (c as any).set("universalContext", {
        ...(c as any).get("universalContext"),
        prisma,
      });
    }

    await next();
  });

  registerApiRoutes(apiApp);

  // 先挂载 API 子应用，再挂页面/通用处理链，避免 `/api/*` 被页面兜底吞掉。
  app.route("/", apiApp);

  apply(app, [
    // Add Prisma instance to context
    prismaMiddleware,

    // Append Auth.js session to context
    authjsSessionMiddleware,

    // Auth.js route. See https://authjs.dev/getting-started/installation
    authjsHandler,

    // Telefunc route. See https://telefunc.com
    telefuncHandler,
  ]);

  return serve(app, {
    port,
  });
}
