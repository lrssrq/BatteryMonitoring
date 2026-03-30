# BatteryMonitoring

[English](README.md) | [中文](README.zh-CN.md)

BatteryMonitoring 是一个基于 Expo + React Native 的电池监测移动应用，面向电池数据采集、设备管理、告警与分析场景。

项目使用 Expo Router 进行页面路由，结合 MQTT 实时接收数据，并预留了与后端 API 协同的数据持久化与历史查询能力。

## 主要功能

- 实时 MQTT 数据接入与连接状态管理
- 电池数据展示与分析页面
- 告警页面与告警方式配置（本地/远程）
- 设备管理页面
- 数据历史页面
- 相机页面（扫码或相机能力）
- 登录与注册页面
- 多语言配置（中文、英文、法语、日语、德语、西语）

## 技术栈

- Expo 55
- React 19
- React Native 0.83
- TypeScript
- Expo Router
- MQTT（`mqtt` + 自定义连接封装）
- React Native Paper、Reanimated、Gesture Handler 等移动端常用组件库

## 路由与页面

`app/` 目录采用 Expo Router 约定式路由：

- `app/(drawer)/(tabs)/index.tsx`：主页
- `app/(drawer)/(tabs)/analysis.tsx`：分析页
- `app/(drawer)/(tabs)/alert.tsx`：告警页
- `app/(drawer)/(tabs)/me.tsx`：个人页
- `app/(otherscreens)/deviceManagement.tsx`：设备管理
- `app/(otherscreens)/dataHistory.tsx`：历史数据
- `app/(otherscreens)/camera.tsx`：相机功能
- `app/(otherscreens)/login.tsx`：登录
- `app/(otherscreens)/register.tsx`：注册

## 项目结构（核心目录）

```text
BatteryMonitoring/
  app/                  # 路由与页面
  assets/               # 图片、字体、模型文件
  components/           # 通用组件
  constants/            # 常量定义（语言、API 路径等）
  contexts/             # 全局上下文（认证、MQTT、设备、设置等）
  hooks/                # 自定义 Hook（如 MQTT 连接）
  lib/                  # 业务能力封装（auth/device/battery/background 等）
  services/             # 服务层（如 mqttService）
  docs/                 # 架构改进、测试指南等文档
  patches/              # patch-package 补丁
```

## 环境与依赖

### 1) 安装依赖

```bash
npm install
```

项目安装后会自动执行：

```bash
npm run postinstall
```

用于应用 `patch-package` 补丁。

### 2) 关键配置项

- 环境变量：`env.ts`
- 设备相关 API Path：`constants/DeviceAPIPath.ts`

## 本地启动

```bash
npm run start
```

或按平台启动：

```bash
npm run android
npm run ios
npm run web
```

## 与后端协作说明

本项目前端通过 REST API 与后端通信，并通过 MQTT 接收实时数据。当前仓库中的文档已给出改进方向，包括：

- 数据持久化到后端
- 20 条数据点推理前置检查
- 设备切换时 MQTT 主题隔离
- 离线缓存与后台任务同步

## 常见问题

### 1) 启动后无法连接后端

- 检查 `constants/env.ts` 的 `API_BASE_URL`
- 确认移动设备与后端是否在同一网络
- 确认后端服务端口可访问

### 2) MQTT 无数据

- 检查 broker 地址和端口
- 检查账号密码
- 检查订阅主题是否与发送端一致

### 3) 打包/运行报依赖问题

- 删除 `node_modules` 与锁文件后重新安装
- 确认 Node.js 版本与 Expo 55 兼容

## License

本项目基于 [MIT 许可证](LICENSE) 开源。
