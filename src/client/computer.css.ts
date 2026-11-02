/**
 * 电脑操控组的样式。行的骨架（.hs-info-row / .hs-info-ico / .hs-info-text / .hs-info-note）沿用对话信息面板的，
 * 这里只管自己的部分：应用图标、名字截断、画面、光标、涟漪、完成徽标、放大层。数值从 dsh-harness-plus 原样搬来。
 */
export const computerCss = `
.cp-ic { width: 16px; height: 16px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
/* 应用图标：彩色原图，和线条图标同占 16 格；macOS 图标自带留白，放大一点看起来才一样大 */
.hs-info-ico .cp-app-icon { display: block; width: 18px; height: 18px; margin: -1px; }
/* 名字长就截断加省略号，右边的状态不让位 */
.cp-app-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-app > .cp-app-status { flex: none; }
.cp-app-status[data-active] { color: var(--dsw-alias-state-business-primary); }

/* 画面（占位）：16:10，左右和行文字之外的边对齐（行内 8） */
.cp-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  margin: 4px 8px 6px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}
/* 有画面：图片按原比例放进 16:10 的框里（竖窗口两边留底色），不裁不拉伸；框是光标的定位参照 */
.cp-screen[data-has-frame] { position: relative; padding: 0; overflow: hidden; }
.cp-screen[data-has-frame] > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
/* 回合结束后冻结的最后一帧：稍微压暗，和正在操控的画面区分开 */
.cp-screen[data-frozen] > img { opacity: .72; }
.cp-screen[data-zoomable] { cursor: zoom-in; }
.cp-screen[data-zoomable]:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }

/* 虚拟光标：箭头尖对准点位（svg 的尖在 2.5,1.5），滑动用 transform 过渡，不移动真实鼠标 */
.cp-cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  transition: transform .32s cubic-bezier(.2, .8, .2, 1);
}
.cp-cursor > svg {
  position: absolute;
  left: -2.5px;
  top: -1.5px;
  overflow: visible;
  filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / .35));
}
.cp-cursor path {
  fill: var(--dsw-alias-state-business-primary);
  stroke: #fff;
  stroke-width: 1.2;
  stroke-linejoin: round;
}
/* 点击涟漪：从点位扩散一圈后消失 */
.cp-ripple {
  position: absolute;
  left: -14px;
  top: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--dsw-alias-state-business-primary);
  opacity: 0;
  animation: cp-ripple .6s ease-out;
}
@keyframes cp-ripple {
  from { transform: scale(.3); opacity: .9; }
  to { transform: scale(1.4); opacity: 0; }
}

/* 完成徽标：这一轮正常完成时叠在冻结画面右下角，绿底白勾 */
.cp-done {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary, #22a06b);
  box-shadow: 0 0 0 1.5px #fff, 0 2px 6px rgb(0 0 0 / .3);
  pointer-events: none;
  animation: cp-done-in .22s cubic-bezier(.2, .9, .3, 1.3);
}
.cp-done > svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@keyframes cp-done-in {
  from { transform: scale(.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 放大查看：铺满 DSH 窗口、背景压暗，画面在留边后的区域里按比例放到最大（不是可拖动的浮窗） */
.cp-zoom {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 56px;
  background: rgb(0 0 0 / .62);
  cursor: zoom-out;
  animation: cp-zoom-in .16s ease-out;
}
.cp-zoom-frame {
  position: relative;
  width: 100%;
  height: 100%;
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
  filter: drop-shadow(0 8px 28px rgb(0 0 0 / .45));
}
.cp-zoom-frame[data-frozen] > img { opacity: .8; }
.cp-zoom-frame .cp-done { width: 32px; height: 32px; box-shadow: 0 0 0 2px #fff, 0 3px 10px rgb(0 0 0 / .35); }
.cp-zoom-frame .cp-done > svg { width: 22px; height: 22px; }
.cp-zoom-frame .cp-cursor > svg { width: 22px; height: 22px; left: -3.4px; top: -2px; }
.cp-zoom-close {
  all: unset;
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgb(255 255 255 / .14);
  color: #fff;
  cursor: pointer;
}
.cp-zoom-close svg { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; fill: none; }
@media (hover: hover) { .cp-zoom-close:hover { background: rgb(255 255 255 / .24); } }
.cp-zoom-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@keyframes cp-zoom-in { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .cp-cursor { transition: none; }
  .cp-ripple { animation-duration: .01s; }
  .cp-done, .cp-zoom { animation: none; }
}
`
