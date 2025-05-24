# 剪贴板功能故障排除指南

## 常见问题与解决方案

### 问题1：点击复制按钮时出现错误 `Cannot read properties of undefined (reading 'writeText')`

**原因**：浏览器不支持或无法访问 Clipboard API

**解决方案**：
1. 系统已自动启用降级方案，会使用传统的复制方法
2. 如果仍然失败，会自动选中文本让您手动复制

### 问题2：复制功能在某些浏览器中不工作

**可能的原因和解决方案**：

#### 浏览器兼容性
- **Chrome 66+**: 完全支持 Clipboard API
- **Firefox 63+**: 完全支持 Clipboard API  
- **Safari 13.1+**: 完全支持 Clipboard API
- **旧版浏览器**: 自动使用 `execCommand` 降级方案

#### 安全限制
- **HTTPS要求**: 生产环境必须使用HTTPS（localhost除外）
- **用户手势**: 复制操作必须由用户主动触发（点击按钮）
- **焦点要求**: 页面必须处于活动状态

### 问题3：在某些设备上复制功能不可用

**移动设备处理**：
- iOS Safari: 支持 Clipboard API（iOS 13.4+）
- Android Chrome: 支持 Clipboard API
- 旧版移动浏览器: 使用文本选择降级方案

## 使用技巧

### 方法1：自动复制（推荐）
1. 点击回调地址右侧的复制图标 📋
2. 等待成功提示
3. 直接粘贴使用

### 方法2：手动复制（通用）
1. 点击回调地址输入框
2. 文本会自动选中
3. 按 `Ctrl+C` (Windows) 或 `Cmd+C` (Mac) 复制
4. 粘贴使用

### 方法3：右键复制（备用）
1. 右键点击回调地址输入框
2. 选择"全选"
3. 再次右键选择"复制"

## 技术实现说明

我们的复制功能采用了三层降级方案：

### 层级1：现代 Clipboard API
```javascript
if (navigator.clipboard && navigator.clipboard.writeText) {
  await navigator.clipboard.writeText(text);
}
```

### 层级2：传统 execCommand
```javascript
const textArea = document.createElement('textarea');
textArea.value = text;
document.body.appendChild(textArea);
textArea.select();
document.execCommand('copy');
document.body.removeChild(textArea);
```

### 层级3：手动选择降级
```javascript
const input = document.getElementById('callback-url');
input.focus();
input.select();
input.setSelectionRange(0, 99999);
```

## 环境要求

### 开发环境
- ✅ `http://localhost:9002` - 支持所有复制方法
- ✅ `http://127.0.0.1:9002` - 支持所有复制方法

### 生产环境  
- ✅ `https://yourdomain.com` - 支持所有复制方法
- ❌ `http://yourdomain.com` - 仅支持降级方案

## 故障诊断步骤

1. **检查浏览器版本**
   - 确保使用现代浏览器最新版本

2. **检查协议**
   - 生产环境确保使用HTTPS
   - 本地开发可以使用HTTP

3. **检查控制台**
   - 打开开发者工具查看错误信息
   - 查看是否有安全策略阻止

4. **测试降级方案**
   - 尝试手动选择和复制
   - 确认基础功能可用

## 最佳实践

### 用户体验
- 始终提供视觉反馈（Toast提示）
- 提供多种复制方式
- 清晰的错误提示和解决建议

### 开发建议
- 实现多层降级方案
- 处理所有可能的异常情况  
- 提供兜底的手动操作方式

### 测试建议
- 在不同浏览器中测试
- 测试HTTPS和HTTP环境
- 测试移动设备兼容性

## 相关链接

- [MDN - Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard)
- [Can I Use - Clipboard API](https://caniuse.com/async-clipboard)
- [Web.dev - Clipboard Access](https://web.dev/async-clipboard/) 