# ♿OreDwaita♿

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Rollup](https://img.shields.io/badge/Rollup-4.x-EC4A3F?logo=rollup.js)](https://rollup.io/)
[![Storybook](https://img.shields.io/badge/Storybook-10.x-FF4785?logo=storybook)](https://storybook.js.org/)

OreDwaita 是一套在设计上将 MSCPOreSwiss 融入 Adwaita 设计语言的 React 组件库。

## ✨ 特性

- **⚛️ React 19 + TypeScript 5** 全类型组件（80+ 导出，42 个模块）
- **🎨 语义化设计 Token**：CSS 自定义属性（`--ore-*`）分层组织——调色板 → 语义层 → light/dark 主题，暗色模式为藏青色调
- **🧱 GNOME HIG 控件解剖**：9px 按钮圆角、48px HeaderBar、开关/行控件/对话框均按 HIG 结构实现
- **🟩 立体 bevel 按钮**：`suggested`/`destructive` 自带高光立体面，默认按钮黑白反色 hover
- **♿ 无障碍优先 ♿**：对话框/弹层焦点陷阱与 Escape 关闭（叠加弹层只关栈顶）、Tab 键盘导航、菜单方向键/Home/End 导航、Switch/菜单可访问名称、Toast `role="status"` 播报、jsx-a11y lint 规则集、`prefers-reduced-motion` 全量降级
- **🌍 内置文案字典**：全组件的可访问名称与提示文案（关闭、后退、新建标签页、展开/折叠等）统一收敛到 `ThemeProvider` 的 `labels` 字典，支持子集覆盖完成本地化，组件级 prop 可再精修；`accentColor` 一键注入品牌色
- **🎛️ 受控 / 非受控双模式**：Switch、CheckButton、Scale、SpinButton、Entry、TextArea、DropDown、ListBox、Calendar、DatePicker、ColorPicker、Expander、Paned、TabBar、ExpanderRow、SpinRow、ComboRow 等均提供 `defaultChecked` / `defaultValue` / `defaultExpanded` / `defaultPosition` 等初始值用法，`closeIcon` / `backIcon` / `actions` 等支持图标与操作区自定义
- **🪟 弹层 portal 化**：Dialog / BottomSheet / PreferencesDialog / Tab overview / Popover 均挂载到 `document.body`，不受 `overflow` / `transform` 祖先裁剪；Popover 按锚点实时定位并自动视口翻转与夹紧
- **📦 Rollup 4 双格式产物**：ESM 按模块输出（真正 tree-shaking）+ 单文件 CJS；样式提取为静态 `dist/oredwaita.css`；全量 sourcemap（`.map` 随包发布）
- **🧪 Vitest 5 + Testing Library**：539 条单测，a11y 断言以可访问名称与键盘交互为主
- **📚 Storybook 10** 交互文档
- **🔒 token 守卫**：`check-tokens` 禁止组件 SCSS 出现裸色值（hex/rgba/具名色），`contrast-audit` 直接解析 SCSS token 做 WCAG 对比度审计并纳入 `yarn lint` 门禁

## 📦 安装

```bash
yarn add oredwaita
# peers: react 19, react-dom 19（clsx / lucide-react 随库自动安装）
```

```tsx
import { Button, ThemeProvider } from 'oredwaita';
import 'oredwaita/styles.css';

export const App = () => (
  <ThemeProvider defaultColorScheme="system">
    <Button variant="suggested">主操作</Button>
  </ThemeProvider>
);
```

**样式导入是必需的**：样式以静态 CSS 文件（`oredwaita/styles.css`）交付，不随 JS 运行时注入——SSR 首屏、CSS 缓存与按需打包都因此受益，不要漏掉这一行 import。

## 🧩 组件总览

- **窗口与导航**：Window / ApplicationWindow / HeaderBar / ToolbarView / Leaflet / Flap / NavigationView / NavigationSplitView / OverlaySplitView / ViewSwitcher / TabView / TabBar / TabOverview / Sidebar / BottomSheet / BreakpointBin
- **对话框与弹层**：Dialog / AlertDialog / MessageDialog / AboutDialog / ShortcutsDialog / PreferencesDialog / Popover / PopoverMenu / MenuButton / Tooltip
- **表单控件**：Button / SplitButton / ToggleButton / ToggleGroup / CheckButton / RadioButton / Switch / Scale / SpinButton / Entry / TextArea / SearchEntry / SearchBar / DropDown / DatePicker / ColorPicker，以及 ActionRow / EntryRow / ComboRow / SwitchRow / SpinRow / PasswordEntryRow / ExpanderRow / LinkRow / ButtonRow / ShortcutRow 等 HIG 行控件
- **数据展示**：Card（CardHeader / CardBody / CardFooter）/ ColumnView / ListBox / Calendar / Carousel / Image / Avatar / Badge / ProgressBar / LevelBar / Separator / StatusPage
- **反馈与布局**：Banner / Toast / Spinner / Expander / Paned / Bin / Clamp / Squeezer / WrapBox / PreferencesGroup / PreferencesPage / PreferencesWindow

## 🎨 设计 Token（`src/styles/oredwaita.scss`）

| 语义 | Light | Dark |
|---|---|---|
| accent 填充 | `#3C8527`（hover `#489e31`） | 同左 |
| accent 文字/图标 | `#35751f` | `#489e31` |
| destructive | `#D10133`（hover `#E60039`） | 同左（文字 `#ff4d6d`） |
| warning | `#d2d300` 底 + `#111` 字 | 同左 |
| 窗口/视图 | `#f8f9fa` / `#fff` | `#10121a` / `#0c0e16` |
| HeaderBar | `#ffffff` | 藏青 `#1e2a38` |
| 边框 | `rgba(17,17,17,.14)` / 强边 `#111` | `rgba(255,255,255,.14)` / 强边 `rgba(255,255,255,.9)` |

签名 token：`--ore-gradient`（135° `#050505→#1e2a38` hero 渐变）、`--ore-shadow-hard`（弹窗硬投影）、`--ore-shadow-hard-sm`（Toast）、`--ore-accent-hover`、`--ore-red-bright`、布局宽度 `--ore-width-small/medium/large`。

字体：`--ore-font-sans` system-ui 栈、`--ore-font-mono` 等宽元数据栈、`--ore-font-display` 展示衬线（**由应用侧自行加载字体文件**）。

动效：全局缓动 `cubic-bezier(0.16, 1, 0.3, 1)`；`prefers-reduced-motion` 下全量关闭。

### Hero 形态（可选）

- `<StatusPage className="ore-status-page--hero">` — 渐变底 + 展示字体标题
- `<Banner className="ore-banner--gradient">` — 渐变横幅
- `<HeaderBar className="ore-header-bar--hero">` — 渐变窗口 chrome
- `<ProgressBar shimmer />` — 不确定态流光
- 容器加 `ore-stagger` 类 — 子项 50ms 递增入场（`--ore-stagger-step` 可覆盖）

## 🌍 定制与国际化

所有组件的内置文案（关闭、后退、新建标签页、展开/折叠行等）都来自 `ThemeProvider` 的 `labels` 字典，默认给出完整的英文文案。按需传入键的子集即可完成本地化，未覆盖的键自动回退内置默认：

```tsx
import { ThemeProvider, ApplicationWindow } from 'oredwaita';

export const App = () => (
  <ThemeProvider
    labels={{
      close: '关闭',
      back: '返回',
      newTab: '新建标签页',
      closeTab: (title) => `关闭 ${title}`,
      searchPlaceholder: '搜索…',
    }}
  >
    <ApplicationWindow title="设置" />
  </ThemeProvider>
);
```

文案解析优先级为 `组件 prop ?? labels 字典 ?? 内置默认`——组件级 prop 拥有最高优先级，适合对单处文案精修。图标与操作区同样可在组件上覆盖：

```tsx
<Dialog open title="关于" onClose={close} closeIcon={<X size={16} />} closeLabel="关掉" />
<HeaderBar showBackButton backIcon="↩" backLabel="返回上一级" />
<Banner
  title="System Maintenance Scheduled Tonight"
  actions={
    <Button variant="flat" size="sm" onClick={dismiss}>
      Dismiss
    </Button>
  }
/>
```

品牌主题色也随 Provider 一步注入：`accentColor` 会把品牌色写入 `--ore-accent-*` 设计 token（含 hover/选中混合色），light/dark 两态自动生效：

```tsx
<ThemeProvider accentColor="#3584e4">…</ThemeProvider>
```

## 🎛️ 非受控用法

表单类与导航类组件在受控用法之外均提供 `default*` 初始值：组件内部自持状态，回调只作通知，无需在页面里为每个开关维护 state。

```tsx
<Switch defaultChecked />                                  // 开关初始为开
<CheckButton defaultChecked label="开机自启" />             // 复选初始选中
<TabBar tabs={tabs} defaultActiveTabId="editor" onTabChange={log} /> // 初始选中，内部自由切换
<ExpanderRow title="高级选项" defaultExpanded />            // 初始展开
<SpinRow title="端口" defaultValue={8080} />                // 数值行初始值
<Scale defaultValue={40} showValue />                       // 滑杆初始值
<Entry defaultValue="ore" />                                // 单行输入初始值
<DropDown items={items} defaultValue="display" />           // 下拉初始选中
<DatePicker defaultValue={new Date()} />                    // 日期初始值
```

需要精确接管时改传 `checked` / `activeTabId` / `value` 即回到受控模式，两种用法可以按页面粒度自由混用。

## 💻 开发

```bash
yarn install
yarn start          # Storybook @ http://localhost:6006
yarn ci             # lint（token 卫生 + WCAG 对比度 + jsx-a11y）+ 类型 + 单测
yarn build          # Rollup 产物 → dist/（ESM 按模块 + index.cjs + oredwaita.css）
yarn test:unit      # 单测
```

发布：`.github/workflows/release.yml` 在 `v*` tag 上跑 `yarn ci` + `yarn build` 并发布 npm（含 npm provenance；需在 GitHub 仓库配置 `NPM_TOKEN`）。

### 新增组件

1. 在 `src/components/` 建目录：`X.tsx` / `X.scss` / `X.test.tsx` / `X.stories.tsx` / `index.ts`
2. SCSS 一律消费 `--ore-*` token，**禁止裸色值**（hex / rgba / 具名色，`scripts/check-tokens.mjs` 会在 CI 拦截）
3. 交互元素提供可访问名称（`getByRole` 可查），键盘可达
4. 从 `src/components/index.ts` 导出

## 📁 结构

```
src/
├── components/       # 42 个组件模块（BEM: ore-*）
│   ├── Button/       # bevel / 反色 hover 主签名
│   ├── HeaderBar/    # 48px 窗口 chrome + hero 形态
│   ├── Rows/         # ActionRow / EntryRow 等
│   ├── Leaflet/ …    # Leaflet / Flap / Clamp 等布局原语
│   └── Oredwaita.stories.tsx  # 全景演示（light/dark 切换）
├── styles/
│   └── oredwaita.scss  # 唯一颜色事实来源（palette + 语义层 + light/dark）
└── index.ts          # 库入口（加载 token + 导出 hooks）
scripts/
├── check-tokens.mjs    # token 卫生守卫（接入 yarn lint）
└── contrast-audit.mjs  # WCAG 对比度审计（接入 yarn lint）
```

## 📄 License

MIT
