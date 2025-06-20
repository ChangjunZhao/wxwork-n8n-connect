// 暂时禁用中间件，使用客户端AuthGuard代替
// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//   function middleware(req) {
//     console.log("🔐 认证中间件执行：", {
//       path: req.nextUrl.pathname,
//       token: !!req.nextauth.token,
//       tokenContent: req.nextauth.token ? 'exists' : 'none'
//     });
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const isAuthenticated = !!token;
//         console.log("🔍 认证检查：", { 
//           path: req.nextUrl.pathname, 
//           authenticated: isAuthenticated,
//           token: token ? 'present' : 'missing'
//         });
        
//         // 如果没有认证，返回false触发重定向
//         return isAuthenticated;
//       },
//     },
//     pages: {
//       signIn: "/auth/signin",
//     },
//   }
// );

// export const config = {
//   matcher: [
//     /*
//      * 匹配除了以下路径外的所有路径：
//      * - auth 相关页面
//      * - api/auth NextAuth API
//      * - api/weixin 企业微信回调
//      * - 静态资源
//      */
//     "/((?!auth|api/auth|api/weixin|_next/static|_next/image|favicon.ico).*)",
//   ],
// };

console.log("⚠️ 中间件已禁用，使用客户端认证守卫"); 