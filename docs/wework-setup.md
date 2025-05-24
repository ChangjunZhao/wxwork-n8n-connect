# 企业微信配置指南

本文档说明如何配置企业微信应用以使用我们的回调接口。

## 1. 创建企业微信应用

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/)
2. 进入 "应用管理" → "自建" → "创建应用"
3. 填写应用信息并创建

## 2. 获取配置信息

在应用详情页面，记录以下信息：
- **企业ID (CorpID)**: 在"我的企业"中查看
- **应用ID (AgentID)**: 在应用详情页面查看
- **应用Secret**: 在应用详情页面查看

## 3. 配置接收消息

1. 在应用详情页面，点击 "接收消息" → "设置API接收"
2. 填写以下信息：

### URL 配置
```
格式: https://yourdomain.com/api/weixin/callback/{CorpID}/{AgentID}
示例: https://api.example.com/api/weixin/callback/ww1234567890abcdef/1000002
```

### Token 配置
- 自定义一个随机字符串，例如: `MyWeChatToken123`
- 记录此 Token，稍后需要在系统中配置

### EncodingAESKey 配置
- 企业微信会自动生成，或者点击"随机生成"
- 记录此密钥，稍后需要在系统中配置

## 4. 在系统中添加连接

使用获取的信息在我们的系统中创建新的企业微信连接：

```javascript
// 示例配置数据
{
  "name": "我的企业微信应用",
  "corpId": "ww1234567890abcdef",
  "agentId": "1000002", 
  "token": "MyWeChatToken123",
  "encodingAESKey": "abcdefghijklmnopqrstuvwxyz1234567890ABCDEF",
  "n8nWebhookUrl": "https://n8n.example.com/webhook/wechat" // 可选
}
```

## 5. 验证配置

1. 保存系统中的连接配置
2. 回到企业微信管理后台，点击"保存"按钮
3. 如果配置正确，应该显示"保存成功"

## 6. 测试功能

配置完成后，您可以：

1. **发送测试消息**: 在企业微信中向应用发送消息
2. **查看日志**: 在系统的"事件日志"页面查看接收到的消息
3. **检查 n8n 触发**: 如果配置了 n8n Webhook，检查工作流是否被触发

## 支持的消息类型

系统目前支持以下消息和事件类型：

### 消息类型
- **文本消息** (`text`): 用户发送的文本内容
- **图片消息** (`image`): 用户发送的图片
- **语音消息** (`voice`): 用户发送的语音
- **视频消息** (`video`): 用户发送的视频
- **文件消息** (`file`): 用户发送的文件

### 事件类型
- **关注事件** (`subscribe`): 用户关注应用
- **取消关注** (`unsubscribe`): 用户取消关注
- **菜单点击** (`click`): 用户点击自定义菜单
- **上报地理位置** (`location`): 用户上报地理位置

## 常见问题

### Q: 回调地址验证失败
A: 检查以下几点：
1. URL 格式是否正确
2. CorpID 和 AgentID 是否匹配
3. Token 是否正确
4. 服务器是否可以公网访问

### Q: 消息解密失败
A: 检查以下几点：
1. EncodingAESKey 是否正确
2. Token 是否正确
3. 消息格式是否符合企业微信标准

### Q: 日志中显示连接未找到
A: 检查以下几点：
1. 数据库中是否存在对应的连接配置
2. CorpID 和 AgentID 是否完全匹配

## 安全注意事项

1. **保护敏感信息**: Token 和 EncodingAESKey 应当安全存储
2. **使用 HTTPS**: 生产环境必须使用 HTTPS 协议
3. **验证来源**: 系统会自动验证消息签名，确保来自企业微信
4. **日志安全**: 敏感信息不会完整记录在日志中

## 参考链接

- [企业微信开发文档](https://developer.work.weixin.qq.com/)
- [接收消息与事件](https://developer.work.weixin.qq.com/document/path/90930)
- [消息加解密](https://developer.work.weixin.qq.com/document/path/90968) 