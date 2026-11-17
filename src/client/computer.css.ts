/**
 * 电脑操控 Plus 客户端样式（基于 @kewen/dsh-ui v0.2.0 语义表面、单阶差与曲率双轨联动）：
 * - 对话信息面板行（.hs-info-row / .hs-info-ico / .hs-info-text / .hs-info-note）复用 dsh-harness-plus 面板骨架；
 * - 圆角矩形统一配对 corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round))，随 Harness Plus 开启/关闭在标准同心圆弧与宿主超椭圆间实时联动；
 * - 正圆（50%）与全圆弧胶囊（999px）永久锁定 corner-shape: round；
 * - 所有 UI 色彩严走 --dsw-alias-* / --dsh-* 语义变量，100% :hover 包裹于 @media (hover: hover)。
 */
export const computerCss = `
.cp-ic {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* 应用图标：彩色原图，和线条图标同占 16 格；macOS 图标自带留白，略放一点视觉等大 */
.hs-info-ico .cp-app-icon {
  display: block;
  width: 18px;
  height: 18px;
  margin: -1px;
}
/* 名字长就截断加省略号，右边的状态圆点不让位 */
.cp-app-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cp-app > .cp-app-status {
  flex: none;
}
.cp-app-status[data-active] {
  color: var(--dsw-alias-state-business-primary);
}

/* 画面（占位与实时框）：16:10，8px 圆角矩形走双轨曲率 */
.cp-screen {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  margin: 4px 8px 6px;
  padding: 0 16px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l1);
  background: var(--dsh-surface-sunken, var(--dsw-alias-interactive-bg-hover));
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-text-sm, 12px);
  line-height: 18px;
  text-align: center;
  transition: border-color var(--dsh-dur-hover, 120ms) ease, background-color var(--dsh-dur-hover, 120ms) ease;
}
/* 有画面：图片按原比例放进 16:10 的框里（竖窗口两边留底色），不裁不拉伸；框是光标的定位参照。
   把 overflow: clip 下沉到内层 corner-shape: round 容器（.cp-screen-clip），避免外层 superellipse + overflow: hidden 在 .hs-info-panel 内触发 kClipPath 离屏 RPDQ */
.cp-screen[data-has-frame] {
  position: relative;
  padding: 0;
}
.cp-screen-clip {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  corner-shape: round;
  overflow: clip;
}
.cp-screen-clip > img,
.cp-screen[data-has-frame] > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
/* 回合结束后冻结的最后一帧：稍微压暗，和正在操控的画面区分开 */
.cp-screen[data-frozen] img {
  opacity: .72;
}
.cp-screen[data-zoomable] {
  cursor: zoom-in;
}
@media (hover: hover) {
  .cp-screen[data-zoomable]:hover {
    border-color: var(--dsw-alias-border-l3);
  }
}
.cp-screen[data-zoomable]:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

/* 虚拟光标：箭头尖对准点位（svg 的尖在 2.5,1.5），滑动用 transform 过渡，不移动真实鼠标 */
.cp-cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  transition: transform .32s var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.cp-cursor > svg {
  position: absolute;
  left: -2.5px;
  top: -1.5px;
  overflow: visible;
  filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / .35)); /* dsh-allow-color */
}
.cp-cursor path {
  fill: var(--dsw-alias-state-business-primary);
  stroke: #fff; /* dsh-allow-color */
  stroke-width: 1.2;
  stroke-linejoin: round;
}
/* 点击涟漪：50% 正圆永久锁死 round */
.cp-ripple {
  position: absolute;
  left: -14px;
  top: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  corner-shape: round;
  border: 2px solid var(--dsw-alias-state-business-primary);
  opacity: 0;
  animation: cp-ripple .6s ease-out;
}
@keyframes cp-ripple {
  from { transform: scale(.3); opacity: .9; }
  to { transform: scale(1.4); opacity: 0; }
}

/* 完成徽标：正常完成时叠在冻结画面右下角，50% 正圆锁死 round */
.cp-done {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: grid;
  place-items: center;
  width: var(--dsh-control-xs, 20px);
  height: var(--dsh-control-xs, 20px);
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-state-success-primary);
  color: var(--dsh-solid-on-color, var(--dsw-alias-label-primary-foreground));
  box-shadow: 0 0 0 1.5px var(--dsw-alias-bg-layer-1), 0 2px 6px rgb(0 0 0 / .28);
  pointer-events: none;
  animation: cp-done-in var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.cp-done > svg {
  width: 13px;
  height: 13px;
  stroke-width: 2.2;
}
@keyframes cp-done-in {
  from { transform: scale(.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 放大查看：零模糊压暗遮罩 + 16px 双轨圆角视口，画面居中按比例放到最大 */
.cp-zoom {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 56px;
  background: var(--dsw-alias-bg-mask-1);
  cursor: zoom-out;
  animation: cp-zoom-in var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.cp-zoom-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--dsw-radius-lg, 16px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  cursor: default;
  pointer-events: none;
}
.cp-zoom-frame > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 8px 28px rgb(0 0 0 / .45)); /* dsh-allow-color */
}
.cp-zoom-frame[data-frozen] > img {
  opacity: .8;
}
.cp-zoom-frame .cp-done {
  width: 32px;
  height: 32px;
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1), 0 3px 10px rgb(0 0 0 / .35);
}
.cp-zoom-frame .cp-done > svg {
  width: 20px;
  height: 20px;
}
.cp-zoom-frame .cp-cursor > svg {
  width: 22px;
  height: 22px;
  left: -3.4px;
  top: -2px;
}
.cp-zoom-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsh-surface-floating);
  color: var(--dsw-alias-label-primary);
  box-shadow: var(--dsw-elevation-panel);
}
@media (hover: hover) {
  .cp-zoom-close:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover-solid, var(--dsh-surface-card));
  }
}
@keyframes cp-zoom-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ─── 插件详情页：环境与权限面板 + 应用访问管理（承载于 @kewen/dsh-ui Card / CardRow） ─── */
.cp-cfg {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-text-md, 13px);
  line-height: 1.55;
}
.cp-cfg-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cp-cfg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.cp-cfg-section h3 {
  margin: 0;
  font-size: var(--dsh-text-md, 13px);
  font-weight: 600;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
}
.cp-cfg-row-title {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}
.cp-cfg-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  vertical-align: -3px;
  height: var(--dsh-control-xs, 20px);
  padding: 0 8px 0 5px;
  margin: 0 2px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-surface-sunken, var(--dsw-alias-bg-module-platform));
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-text-xs, 11px);
  font-weight: 500;
  line-height: 1;
}
.cp-cfg-badge img {
  display: block;
  width: 14px;
  height: 14px;
  flex: none;
}
.cp-cfg-ver {
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-text-xs, 11px);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
/* 嵌套在 CardRow 内的终端命令槽：走单阶差凹陷表面 --dsh-surface-sunken，零框套框 */
.cp-cfg-cmd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 6px 6px 12px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: var(--dsh-surface-sunken);
}
.cp-cfg-cmd code {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-primary);
}
.cp-cfg-skeleton {
  flex: none;
  width: 96px;
  height: var(--dsh-control-sm, 28px);
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-surface-sunken, var(--dsw-alias-interactive-bg-hover));
}
.cp-cfg-action {
  min-width: 108px;
}
.cp-cfg-action[data-granted] {
  color: var(--dsh-state-ok-text, var(--dsw-alias-state-success-primary));
}
.cp-cfg-gear {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: .72;
}
.cp-cfg-hint {
  margin: 0;
  padding: 0 2px;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
}
.cp-cfg-err {
  margin: 6px 0 0;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-state-error-primary);
}
.cp-cfg-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cp-cfg-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cp-cfg-subhead {
  margin: 0;
  padding: 0 2px;
  font-size: var(--dsh-text-xs, 11px);
  font-weight: 600;
  color: var(--dsw-alias-label-tertiary);
}
.cp-cfg-app {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.cp-cfg-app-icon,
.cp-cfg-app-ph {
  width: 28px;
  height: 28px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  flex: none;
}
.cp-cfg-app-ph {
  background: var(--dsh-surface-sunken, var(--dsw-alias-interactive-bg-hover));
}
.cp-cfg-app-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cp-cfg-app-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.cp-cfg-app-name-row strong {
  font-size: var(--dsh-text-md, 13px);
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cp-cfg-app-id {
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-xs, 11px);
  font-weight: 400;
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 兜底审批卡片（当宿主未提供 conversation.approval.card 工厂插槽时由 Card + Button + Modal 承载） */
.cp-approval-fallback {
  padding: 8px 0;
}
.cp-approval-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
}
.cp-approval-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cp-approval-subject {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.cp-approval-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  flex: none;
}
.cp-approval-subject strong {
  font-size: var(--dsh-text-md, 13px);
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cp-approval-risk-btn {
  color: var(--dsh-state-warn-text, var(--dsw-alias-state-warn-primary));
}
.cp-approval-title {
  font-size: var(--dsh-text-md, 13px);
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.cp-approval-desc {
  margin: 0;
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary);
}
.cp-approval-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
.cp-approval-risk-copy {
  margin: 0;
  white-space: pre-line;
  font-size: var(--dsh-text-md, 13px);
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .cp-cursor { transition: none; }
  .cp-ripple { animation-duration: .01s; }
  .cp-done, .cp-zoom { animation: none; }
}
`
