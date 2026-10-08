import { onRequestGet as __api_verify__id__ts_onRequestGet } from "C:\\Users\\Tejas Gogavale\\OneDrive\\文档\\Desktop\\just\\functions\\api\\verify\\[id].ts"
import { onRequestPost as __api_auth_ts_onRequestPost } from "C:\\Users\\Tejas Gogavale\\OneDrive\\文档\\Desktop\\just\\functions\\api\\auth.ts"
import { onRequestPost as __api_certificates_ts_onRequestPost } from "C:\\Users\\Tejas Gogavale\\OneDrive\\文档\\Desktop\\just\\functions\\api\\certificates.ts"

export const routes = [
    {
      routePath: "/api/verify/:id",
      mountPath: "/api/verify",
      method: "GET",
      middlewares: [],
      modules: [__api_verify__id__ts_onRequestGet],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_ts_onRequestPost],
    },
  {
      routePath: "/api/certificates",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_certificates_ts_onRequestPost],
    },
  ]