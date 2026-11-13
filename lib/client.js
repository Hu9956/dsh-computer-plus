window.__ModuleLoader__.load({
	id: "@kewen/dsh-computer-plus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region ../packages/dsh-ui/src/icons.tsx
		/**
		* 统一 SVG 图标基础样式（02.6 & 08.3）：
		* - 16x16 视框、1.5px 线条、圆头圆角、currentColor 着色、默认 1em 随字号缩放；
		* - .dsh-icon-inline（vertical-align: -0.125em）对齐正文光学中心；
		* - .dsh-spin 加载旋转在 prefers-reduced-motion 下保留 1.8s 慢速旋转防假死。
		*/
		const iconBaseCss = `
@keyframes dsh-spin {
  to { transform: rotate(360deg); }
}
.dsh-icon,
.dsh-i {
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  overflow: visible;
}
.dsh-icon-inline,
.dsh-i {
  vertical-align: -0.125em;
}
.dsh-spin {
  transform-origin: 50% 50%;
  animation: dsh-spin var(--dsh-dur-spin, 800ms) linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .dsh-spin {
    animation-duration: 1.8s !important;
    animation-iteration-count: infinite !important;
  }
}
html[data-dsh-reduce-motion] .dsh-spin {
  animation-duration: 1.8s !important;
  animation-iteration-count: infinite !important;
}
`;
		function buildSvgProps({ size, inline = true, className, width, height, ...rest }, extraClass) {
			const classes = ["dsh-icon"];
			if (inline) classes.push("dsh-icon-inline");
			if (extraClass) classes.push(extraClass);
			if (className) classes.push(className);
			const ariaHidden = rest["aria-label"] !== void 0 || rest["aria-labelledby"] !== void 0 ? rest["aria-hidden"] : rest["aria-hidden"] ?? true;
			return {
				viewBox: "0 0 16 16",
				width: width ?? size ?? "1em",
				height: height ?? size ?? "1em",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				focusable: "false",
				...rest,
				"aria-hidden": ariaHidden,
				className: classes.join(" ")
			};
		}
		function CheckIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...buildSvgProps(props),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 8.5 6.5 12 13 4.5" })
			});
		}
		function SearchIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "7",
					cy: "7",
					r: "4.25"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10.25 10.25 13.5 13.5" })]
			});
		}
		function CloseIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...buildSvgProps(props),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8" })
			});
		}
		function EyeIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "2"
				})]
			});
		}
		function EyeOffIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "8",
						r: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 2.5l11 11" })
				]
			});
		}
		function InfoIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "5.75"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 7.5v3.5M8 5.1v.01" })]
			});
		}
		function SuccessIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "5.75"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.4 8.2 7.2 10l3.5-3.8" })]
			});
		}
		function WarnIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.5 14 13H2z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 6.5v3M8 11.25v.01" })]
			});
		}
		function ErrorIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "5.75"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4.9v3.6M8 11v.01" })]
			});
		}
		function SpinnerIcon(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...buildSvgProps(props, "dsh-spin"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "5.75",
					strokeOpacity: .24
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.75 8a5.75 5.75 0 0 0-5.75-5.75" })]
			});
		}
		//#endregion
		//#region ../packages/dsh-ui/src/Button.tsx
		const Button = (0, react.forwardRef)(function Button({ variant = "ghost", size = "md", icon, trailingIcon, loading = false, tip, disabled, className, children, ...rest }, ref) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref,
				type: "button",
				disabled: Boolean(disabled || loading),
				"aria-busy": loading || void 0,
				"data-hs-tip": tip,
				className: `hs-btn hs-btn-${variant === "danger" ? "danger-ghost" : variant}${variant === "danger" ? " hs-btn-danger" : ""} hs-btn-${size}${loading ? " is-loading" : ""}${className ? ` ${className}` : ""}`,
				...rest,
				children: [
					loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-btn-icon",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpinnerIcon, { inline: false })
					}) : icon != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-btn-icon",
						children: icon
					}),
					children,
					trailingIcon != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-btn-chev",
						children: trailingIcon
					})
				]
			});
		});
		const buttonCss = `
@keyframes dsh-spin {
  to { transform: rotate(360deg); }
}
.hs-btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  corner-shape: round;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--dsh-text-lg, 14px);
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  padding: 0 16px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, opacity var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-btn:disabled { cursor: not-allowed; opacity: .4; }
.hs-btn:active:not(:disabled) {
  transform: scale(.98);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-btn:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.hs-btn-md { height: var(--dsh-control-md, 36px); }
.hs-btn-sm {
  height: var(--dsh-control-sm, 28px);
  font-size: var(--dsh-text-sm, 12px);
  line-height: 18px;
  padding: 0 12px;
  border-radius: 999px;
  corner-shape: round;
}
.hs-btn-primary {
  border: 1px solid transparent;
  background-clip: padding-box;
  background-color: var(--dsh-brand-fill, var(--dsw-alias-button-primary-fill));
  color: var(--dsw-alias-label-primary-foreground);
}
.hs-btn-outline {
  border: .5px solid var(--dsw-alias-border-l3);
  background: transparent;
}
.hs-btn-toolbar {
  background: var(--dsh-toolbar-fill, var(--dsw-alias-button-tool-bar-fill));
}
.hs-btn-toolbar:not([aria-pressed="true"]):active:not(:disabled) {
  background: var(--dsh-toolbar-fill-active);
}
.hs-btn-toolbar[aria-pressed="true"] {
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
  font-weight: 500;
}
.hs-btn-ghost:active:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-active);
}
.hs-btn-danger-ghost,
.hs-btn-danger {
  color: var(--dsw-alias-state-error-primary);
  background: transparent;
}
.hs-btn-danger-ghost:active:not(:disabled),
.hs-btn-danger:active:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
}
.hs-btn-danger-solid {
  border: 1px solid transparent;
  background-clip: padding-box;
  background-color: var(--dsh-danger-solid-bg, var(--dsw-alias-state-error-primary));
  color: var(--dsh-solid-on-color, var(--dsw-alias-label-primary-foreground));
}
@media (hover: hover) {
  .hs-btn-primary:hover:not(:disabled) {
    background-color: var(--dsh-brand-fill-hover, var(--dsw-alias-button-primary-hover));
  }
  .hs-btn-outline:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .hs-btn-toolbar:not([aria-pressed="true"]):hover:not(:disabled) {
    background: var(--dsh-toolbar-fill-hover, var(--dsw-alias-button-tool-bar-hover));
  }
  .hs-btn-ghost:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .hs-btn-danger-ghost:hover:not(:disabled),
  .hs-btn-danger:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover-danger);
  }
  .hs-btn-danger-solid:hover:not(:disabled) {
    background-color: var(--dsh-danger-solid-hover, var(--dsh-danger-solid-bg));
  }
}
.hs-btn:not(.hs-btn-primary):not(.hs-btn-danger-solid)[aria-expanded="true"] {
  background: var(--dsw-alias-interactive-bg-active);
  border-color: var(--dsw-alias-border-l4);
}
.hs-btn-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  flex: none;
}
.hs-btn-chev {
  display: inline-flex;
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
  opacity: .72;
}
.hs-btn[aria-expanded="true"] .hs-btn-chev {
  transform: rotate(180deg);
}
.hs-spinner {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  corner-shape: round;
  border: 1.6px solid currentColor;
  border-right-color: transparent;
  animation: dsh-spin var(--dsh-dur-spin, 800ms) linear infinite;
  flex: none;
}
.hs-btn.is-loading {
  cursor: progress;
  opacity: .78;
  pointer-events: none;
}
.dsh-chip {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: var(--dsh-control-sm, 28px);
  padding: 0 12px;
  border-radius: 999px;
  corner-shape: round;
  border: .5px solid var(--dsw-alias-border-l3);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: var(--dsh-text-sm, 12px);
  white-space: nowrap;
  flex: none;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease, border-color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-chip:active:not(:disabled) {
  transform: scale(.98);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-chip:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
@media (hover: hover) {
  .dsh-chip:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}
.dsh-chip[aria-pressed="true"] {
  background: var(--dsw-alias-state-business-tertiary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, transparent);
  color: var(--dsw-alias-state-business-primary);
  font-weight: 500;
}
.dsh-chip.is-warn[aria-pressed="true"] {
  background: var(--dsw-alias-state-warn-tertiary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);
  color: var(--dsh-state-warn-text);
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/host-bridge.ts
		/**
		* CJK 输入法选词态守卫：兼容原生 KeyboardEvent 与 React SyntheticEvent（isComposing === true || keyCode === 229）。
		*/
		function isImeComposing(event) {
			if (!event) return false;
			if (event.isComposing === true || event.keyCode === 229) return true;
			if (event.nativeEvent?.isComposing === true || event.nativeEvent?.keyCode === 229) return true;
			return false;
		}
		//#endregion
		//#region ../packages/dsh-ui/src/motion.ts
		const DEFAULT_ITEM_SELECTOR = "[role=\"tab\"], button";
		const DEFAULT_INDICATOR_CLASS = "dsh-seg-ind";
		function measureSelected(container, itemSelector) {
			const sel = Array.from(container.querySelectorAll(itemSelector)).find((el) => el.getAttribute("aria-selected") === "true");
			if (!sel) return null;
			let width = sel.offsetWidth || 0;
			let left = sel.offsetLeft || 0;
			if (width === 0 && typeof sel.getBoundingClientRect === "function") {
				const itemRect = sel.getBoundingClientRect();
				width = Math.round(itemRect.width);
				if (typeof container.getBoundingClientRect === "function") {
					const parentRect = container.getBoundingClientRect();
					left = Math.round(itemRect.left - parentRect.left);
				}
			}
			return {
				el: sel,
				left,
				width
			};
		}
		/**
		* 08.2 滑动选中指示块（Segmented / UnderlineTabs / Popover 分类条通用）：
		* - 注入独立 aria-hidden 指示节点并挂载 data-ind 属性接管选中底；
		* - 首次挂载与 ResizeObserver 变化瞬时到位（无过渡动画）；
		* - aria-selected 切换时以 --dsh-dur-expand + --dsh-ease-out 驱动 transform 与 width 平滑滑动；
		* - 返回幂等 dispose() 断开观察器并移除节点。
		*/
		function attachSlidingIndicator(container, options) {
			if (!container || !container.ownerDocument) return () => {};
			const doc = container.ownerDocument;
			const win = doc.defaultView;
			const itemSelector = options?.itemSelector ?? DEFAULT_ITEM_SELECTOR;
			const indicatorClass = options?.indicatorClass ?? DEFAULT_INDICATOR_CLASS;
			const ind = doc.createElement("span");
			ind.className = indicatorClass;
			ind.setAttribute("aria-hidden", "true");
			if (typeof container.prepend === "function") container.prepend(ind);
			else container.insertBefore(ind, container.firstChild);
			container.setAttribute("data-ind", "");
			const expandTransition = "transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), width var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1))";
			let disposed = false;
			const place = (instant) => {
				if (disposed) return;
				const measured = measureSelected(container, itemSelector);
				if (!measured || measured.width <= 0) {
					ind.style.opacity = "0";
					return;
				}
				if (instant) {
					ind.setAttribute("data-instant", "");
					ind.style.transition = "none";
				} else {
					ind.removeAttribute("data-instant");
					ind.style.transition = expandTransition;
				}
				ind.style.opacity = "";
				ind.style.setProperty("--ind-x", `${measured.left}px`);
				ind.style.setProperty("--ind-w", `${measured.width}px`);
				ind.style.width = `${measured.width}px`;
				ind.style.transform = `translateX(${measured.left}px)`;
				if (instant) {
					ind.offsetWidth;
					ind.removeAttribute("data-instant");
				}
			};
			const MutationCtor = win?.MutationObserver ?? globalThis.MutationObserver;
			const mo = MutationCtor ? new MutationCtor(() => {
				place(false);
			}) : null;
			mo?.observe(container, {
				attributes: true,
				attributeFilter: ["aria-selected"],
				subtree: true
			});
			const ResizeCtor = win?.ResizeObserver ?? globalThis.ResizeObserver;
			const ro = ResizeCtor ? new ResizeCtor(() => {
				place(true);
			}) : null;
			ro?.observe(container);
			place(true);
			const fonts = doc.fonts;
			if (fonts?.ready) fonts.ready.then(() => {
				if (!disposed) place(true);
			});
			return () => {
				if (disposed) return;
				disposed = true;
				mo?.disconnect();
				ro?.disconnect();
				ind.remove();
				container.removeAttribute("data-ind");
			};
		}
		function isIndicatorOptions(value) {
			if (typeof value !== "object" || value === null) return false;
			return "itemSelector" in value || "indicatorClass" in value;
		}
		function useSlidingIndicator(ref, depOrOptions, maybeOptions) {
			const resolvedOptions = maybeOptions !== void 0 ? maybeOptions : isIndicatorOptions(depOrOptions) ? depOrOptions : void 0;
			const itemSelector = resolvedOptions?.itemSelector;
			const indicatorClass = resolvedOptions?.indicatorClass;
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (!el) return void 0;
				return attachSlidingIndicator(el, {
					itemSelector,
					indicatorClass
				});
			}, [
				ref,
				itemSelector,
				indicatorClass
			]);
		}
		const ROVING_KEYS = /* @__PURE__ */ new Set([
			"ArrowRight",
			"ArrowDown",
			"ArrowLeft",
			"ArrowUp",
			"Home",
			"End"
		]);
		/**
		* 08.1 Roving Tabindex 方向键漫游（← / → / ↑ / ↓ / Home / End）：
		* 自动跳过禁用与隐藏项，同步 tabindex="0/-1"，移动焦点并触发选中。
		*/
		function handleRovingKeyDown(event, itemSelector = "[role=\"tab\"], [role=\"radio\"], button") {
			if (isImeComposing(event)) return;
			if (!ROVING_KEYS.has(event.key)) return;
			const container = event.currentTarget;
			if (!container) return;
			const allItems = Array.from(container.querySelectorAll(itemSelector));
			const enabledItems = allItems.filter((el) => {
				if (el.disabled) return false;
				if (el.getAttribute("aria-disabled") === "true") return false;
				if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
				if (el.style?.display === "none") return false;
				return true;
			});
			if (enabledItems.length === 0) return;
			const activeEl = container.ownerDocument?.activeElement ?? event.target;
			let currentIndex = enabledItems.findIndex((el) => el === activeEl || activeEl !== null && typeof el.contains === "function" && el.contains(activeEl));
			if (currentIndex < 0) currentIndex = enabledItems.findIndex((el) => el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-checked") === "true" || el.getAttribute("tabindex") === "0");
			if (currentIndex < 0) currentIndex = 0;
			event.preventDefault();
			let nextIndex = currentIndex;
			if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % enabledItems.length;
			else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
			else if (event.key === "Home") nextIndex = 0;
			else if (event.key === "End") nextIndex = enabledItems.length - 1;
			const nextEl = enabledItems[nextIndex];
			if (!nextEl) return;
			for (const item of allItems) item.setAttribute("tabindex", item === nextEl ? "0" : "-1");
			nextEl.focus?.();
			nextEl.click?.();
		}
		//#endregion
		//#region ../packages/dsh-ui/src/choices.tsx
		/**
		* 04-B 独立布尔开关（36x20 全圆弧胶囊 + 16px 正圆滑块）：
		* 关态滑块采用官方 --dsw-alias-switch-thumb 防止深色模式发黑，开态轨道切为 --dsh-brand-fill 并翻转反色滑块。
		*/
		const StandaloneSwitch = (0, react.forwardRef)(function StandaloneSwitch({ checked, onChange, label, disabled = false, className, onClick, ...rest }, ref) {
			const handleClick = (event) => {
				onClick?.(event);
				if (event.defaultPrevented || disabled) return;
				onChange(!checked);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref,
				type: "button",
				role: "switch",
				"aria-checked": checked,
				"aria-label": label ?? rest["aria-label"],
				disabled,
				className: `hs-fb-switch${className ? ` ${className}` : ""}`,
				onClick: handleClick,
				...rest,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "hs-fb-thumb",
					"aria-hidden": "true"
				})
			});
		});
		(0, react.forwardRef)(function Checkbox({ checked, onChange, label, disabled = false, className, wrapperClassName, onClick, ...rest }, ref) {
			const nextValue = checked !== true;
			const trigger = () => {
				if (disabled) return;
				onChange?.(nextValue);
			};
			const buttonNode = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref,
				type: "button",
				role: "checkbox",
				"aria-checked": checked === "mixed" ? "mixed" : checked,
				disabled,
				className: `dsh-checkbox${className ? ` ${className}` : ""}`,
				onClick: (event) => {
					onClick?.(event);
					if (event.defaultPrevented) return;
					event.stopPropagation();
					trigger();
				},
				...rest,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {
					size: 11,
					inline: false,
					className: "dsh-chk-tick"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					width: 11,
					height: 11,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					focusable: "false",
					"aria-hidden": "true",
					className: "dsh-icon dsh-chk-dash",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.5 8h9" })
				})]
			});
			if (label === void 0) return buttonNode;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: `dsh-check-label${disabled ? " is-disabled" : ""}${wrapperClassName ? ` ${wrapperClassName}` : ""}`,
				onClick: (event) => {
					event.preventDefault();
					trigger();
				},
				children: [buttonNode, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
			});
		});
		(0, react.forwardRef)(function Radio({ checked, onSelect, label, disabled = false, className, wrapperClassName, tabIndex, onClick, ...rest }, ref) {
			const trigger = () => {
				if (disabled) return;
				onSelect?.();
			};
			const buttonNode = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref,
				type: "button",
				role: "radio",
				"aria-checked": checked,
				disabled,
				tabIndex,
				className: `dsh-radio${className ? ` ${className}` : ""}`,
				onClick: (event) => {
					onClick?.(event);
					if (event.defaultPrevented) return;
					event.stopPropagation();
					trigger();
				},
				...rest
			});
			if (label === void 0) return buttonNode;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: `dsh-check-label${disabled ? " is-disabled" : ""}${wrapperClassName ? ` ${wrapperClassName}` : ""}`,
				onClick: (event) => {
					event.preventDefault();
					trigger();
				},
				children: [buttonNode, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
			});
		});
		(0, react.forwardRef)(function RadioCard({ checked, title, description, preview, onSelect, disabled = false, className, onClick, children, ...rest }, ref) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref,
				type: "button",
				role: "radio",
				"aria-checked": checked,
				disabled,
				className: `dsh-rcard${className ? ` ${className}` : ""}`,
				onClick: (event) => {
					onClick?.(event);
					if (event.defaultPrevented || disabled) return;
					onSelect?.();
				},
				...rest,
				children: [
					preview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rcard-fig",
						children: preview
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-rcard-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-rcard-mark",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {
								size: 10,
								inline: false
							})
						})]
					}),
					description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-rcard-sub",
						children: description
					}),
					children
				]
			});
		});
		(0, react.forwardRef)(function Slider({ value, min = 0, max = 100, step = 1, onChange, label, formatValue, showValue = label !== void 0 || formatValue !== void 0, wrapperClassName, className, style, ...rest }, ref) {
			const span = max - min;
			const pct = span > 0 ? (Math.min(max, Math.max(min, value)) - min) / span * 100 : 0;
			const rangeStyle = {
				...style,
				"--pct": `${pct.toFixed(1)}%`
			};
			const inputEl = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				ref,
				type: "range",
				min,
				max,
				step,
				value,
				"aria-label": typeof label === "string" && !rest["aria-label"] ? label : rest["aria-label"],
				style: rangeStyle,
				className: `dsh-range${className ? ` ${className}` : ""}`,
				onChange: (event) => onChange(Number(event.target.value)),
				...rest
			});
			if (label === void 0 && !showValue) return inputEl;
			const displayVal = formatValue ? formatValue(value) : String(value);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-slider-row${wrapperClassName ? ` ${wrapperClassName}` : ""}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-slider-head",
					children: [label !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), showValue && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-slider-val",
						children: displayVal
					})]
				}), inputEl]
			});
		});
		const choicesCss = `
.hs-fb-switch {
  box-sizing: border-box;
  position: relative;
  width: 36px;
  height: 20px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-border-l3);
  cursor: pointer;
  flex: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.hs-fb-switch[aria-checked="true"] {
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
}
.hs-fb-switch:disabled { opacity: .45; cursor: not-allowed; }
.hs-fb-switch:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.hs-fb-thumb {
  display: block;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-switch-thumb);
  box-shadow: 0 1px 2px rgb(0 0 0 / .14);
  transition: transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), background-color var(--dsh-dur-hover, 120ms) ease, box-shadow var(--dsh-dur-hover, 120ms) ease;
}
.hs-fb-switch[aria-checked="true"] .hs-fb-thumb {
  background: var(--dsw-alias-label-primary-foreground);
  box-shadow: none;
  transform: translateX(16px);
}

.dsh-radio-group {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}
.dsh-check-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: var(--dsh-text-md, 13px);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  user-select: none;
}
.dsh-check-label.is-disabled { opacity: .42; cursor: not-allowed; }
.dsh-check-label:not(.is-disabled):active .dsh-checkbox,
.dsh-check-label:not(.is-disabled):active .dsh-radio {
  transform: scale(.94);
}
.dsh-checkbox,
.dsh-radio {
  all: unset;
  position: relative;
  box-sizing: border-box;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  flex: none;
  display: inline-grid;
  place-items: center;
  border: 1.25px solid var(--dsh-control-border);
  background: var(--dsw-alias-bg-base);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--dsh-dur-hover, 120ms) ease, border-color var(--dsh-dur-hover, 120ms) ease, border-width var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-checkbox:disabled,
.dsh-radio:disabled { opacity: .42; cursor: not-allowed; }
.dsh-checkbox:focus-visible,
.dsh-radio:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.dsh-checkbox::after,
.dsh-radio::after {
  content: "";
  position: absolute;
  inset: -4px;
}
@media (pointer: coarse) {
  .dsh-checkbox::after,
  .dsh-radio::after {
    inset: -6px;
  }
}
.dsh-checkbox {
  border-radius: 5px;
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
}
.dsh-checkbox::after {
  border-radius: 8px;
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
}
.dsh-radio,
.dsh-radio::after {
  border-radius: 50%;
  corner-shape: round;
}
@media (hover: hover) {
  .dsh-check-label:not(.is-disabled):hover .dsh-checkbox:not([aria-checked="true"]):not([aria-checked="mixed"]),
  .dsh-check-label:not(.is-disabled):hover .dsh-radio:not([aria-checked="true"]),
  .dsh-checkbox:not(:disabled):not([aria-checked="true"]):not([aria-checked="mixed"]):hover,
  .dsh-radio:not(:disabled):not([aria-checked="true"]):hover {
    border-color: var(--dsw-alias-label-secondary);
  }
}
.dsh-checkbox svg {
  opacity: 0;
  transform: scale(.65);
  transition: opacity var(--dsh-dur-hover, 120ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), transform var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-checkbox .dsh-chk-dash { display: none; }
.dsh-checkbox:is([aria-checked="true"], [aria-checked="mixed"]) {
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  border-color: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-label-primary-foreground);
}
.dsh-checkbox:is([aria-checked="true"], [aria-checked="mixed"]) svg {
  opacity: 1;
  transform: scale(1);
}
.dsh-checkbox[aria-checked="mixed"] .dsh-chk-tick { display: none; }
.dsh-checkbox[aria-checked="mixed"] .dsh-chk-dash { display: inline; }
.dsh-radio[aria-checked="true"] {
  border: 5px solid var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  background: var(--dsw-alias-label-primary-foreground);
}

.dsh-rcard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.dsh-rcard {
  all: unset;
  --dsh-r-outer: var(--dsw-radius-lg, 16px);
  --dsh-pad: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: var(--dsh-pad) var(--dsh-pad) 10px;
  border-radius: var(--dsh-r-outer);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-base);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--dsh-dur-hover, 120ms) ease, box-shadow var(--dsh-dur-hover, 120ms) ease;
}
.dsh-rcard:disabled { opacity: .45; cursor: not-allowed; }
.dsh-rcard:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
@media (hover: hover) {
  .dsh-rcard:hover:not(:disabled) { border-color: var(--dsw-alias-border-l4); }
}
.dsh-rcard[aria-checked="true"] {
  border-color: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  box-shadow: 0 0 0 1px var(--dsh-brand-fill, var(--dsw-alias-brand-primary)) inset;
}
.dsh-rcard-fig {
  position: relative;
  height: 50px;
  border-radius: max(0px, calc(var(--dsh-r-outer) - var(--dsh-pad)));
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background:
    linear-gradient(var(--dsw-alias-label-caption), var(--dsw-alias-label-caption)) 10px 10px / 44% 3.5px no-repeat,
    linear-gradient(var(--dsw-alias-label-caption), var(--dsw-alias-label-caption)) 10px 19px / 68% 3.5px no-repeat,
    var(--dsw-alias-bg-module-platform);
}
.dsh-rcard-fig-bar {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 7px;
  height: 15px;
  border-radius: 999px;
  corner-shape: round;
  border: .5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
}
.dsh-rcard-fig.is-glass .dsh-rcard-fig-bar {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, var(--dsw-alias-bg-base));
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent);
}
.dsh-rcard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.dsh-rcard-mark {
  box-sizing: border-box;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  border-radius: 50%;
  corner-shape: round;
  border: 1.25px solid var(--dsh-control-border);
  display: grid;
  place-items: center;
  color: transparent;
  font-size: var(--dsh-text-2xs, 10px);
  flex: none;
  transition: background var(--dsh-dur-hover, 120ms) ease, border-color var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-rcard[aria-checked="true"] .dsh-rcard-mark {
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  border-color: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-label-primary-foreground);
}
.dsh-rcard-sub {
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.4;
  color: var(--dsw-alias-label-tertiary);
}

.dsh-slider-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsh-slider-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-primary);
}
.dsh-slider-val {
  font-family: var(--ds-font-family-code);
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-state-business-primary);
}
.dsh-range {
  --pct: 50%;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  margin: 4px 0;
  border-radius: 999px;
  corner-shape: round;
  background: linear-gradient(
    to right,
    var(--dsw-alias-state-business-primary) 0%,
    var(--dsw-alias-state-business-primary) var(--pct),
    var(--dsw-alias-border-l3) var(--pct),
    var(--dsw-alias-border-l3) 100%
  );
  outline: none;
  cursor: pointer;
}
.dsh-range:disabled { opacity: .45; cursor: not-allowed; }
.dsh-range:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.dsh-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsh-slider-thumb-bg);
  border: .5px solid var(--dsw-alias-border-l3);
  box-shadow: 0 1px 4px rgb(0 0 0 / .24);
  transition: transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-range::-moz-range-thumb {
  box-sizing: border-box;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsh-slider-thumb-bg);
  border: .5px solid var(--dsw-alias-border-l3);
  box-shadow: 0 1px 4px rgb(0 0 0 / .24);
  transition: transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
@media (hover: hover) {
  .dsh-range:not(:disabled)::-webkit-slider-thumb:hover { transform: scale(1.1); }
  .dsh-range:not(:disabled)::-moz-range-thumb:hover { transform: scale(1.1); }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/containers.tsx
		function Card({ className, children, ...rest }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `dsh-card${className ? ` ${className}` : ""}`,
				...rest,
				children
			});
		}
		function CardRow({ title, description, subtitle, action, stack = false, interactive = false, className, children, ...rest }) {
			const sub = description ?? subtitle;
			const cls = `dsh-card-row${stack ? " is-stack" : ""}${interactive ? " is-interactive" : ""}${className ? ` ${className}` : ""}`;
			if (stack) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cls,
				...rest,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-card-head-line",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-card-title",
							children: title
						}), action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-card-action",
							children: action
						})]
					}),
					sub !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-card-sub dsh-card-desc",
						children: sub
					}),
					children
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cls,
				...rest,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-card-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-card-title",
							children: title
						}),
						sub !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-card-sub dsh-card-desc",
							children: sub
						}),
						children
					]
				}), action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-card-action",
					children: action
				})]
			});
		}
		const containersCss = `
@keyframes dsh-spin {
  to { transform: rotate(360deg); }
}

.dsh-card {
  --dsh-row-inset: 14px;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsh-surface-card);
  overflow: hidden;
}
.dsh-card-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  min-height: var(--dsh-row-md, 44px);
  padding: 12px var(--dsh-row-inset, 14px);
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.dsh-card-row.is-stack {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
.dsh-card-row.is-interactive { cursor: pointer; }
.dsh-fold { position: relative; }
.dsh-card-row + .dsh-card-row::before,
.dsh-card-row + .dsh-fold::before,
.dsh-fold + .dsh-card-row::before,
.dsh-fold + .dsh-fold::before {
  content: "";
  position: absolute;
  top: 0;
  left: var(--dsh-row-inset, 14px);
  right: var(--dsh-row-inset, 14px);
  border-top: .5px solid var(--dsw-alias-border-l1);
  pointer-events: none;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.dsh-card-body { min-width: 0; flex: 1; }
.dsh-card-head-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dsh-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dsh-text-md, 13px);
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.dsh-card-sub,
.dsh-card-desc {
  margin-top: 2px;
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.45;
  color: var(--dsw-alias-label-secondary);
}
.dsh-card-action {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dsh-fold-trigger {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: var(--dsh-row-md, 44px);
  padding: 10px var(--dsh-row-inset, 14px);
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-fold-trigger:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.dsh-fold-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.dsh-fold-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
@media (hover: hover) {
  .dsh-card-row.is-interactive:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .dsh-fold-trigger:not([aria-disabled="true"]):hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
  .dsh-card-row.is-interactive:hover::before,
  .dsh-card-row.is-interactive:hover + .dsh-card-row::before,
  .dsh-card-row.is-interactive:hover + .dsh-fold::before,
  .dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):hover)::before,
  .dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):hover) + .dsh-card-row::before,
  .dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):hover) + .dsh-fold::before {
    opacity: 0;
  }
}
.dsh-card-row.is-interactive:active {
  background: var(--dsw-alias-interactive-bg-active);
}
.dsh-fold-trigger:not([aria-disabled="true"]):active {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
}
.dsh-card-row.is-interactive:active::before,
.dsh-card-row.is-interactive:active + .dsh-card-row::before,
.dsh-card-row.is-interactive:active + .dsh-fold::before,
.dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):active)::before,
.dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):active) + .dsh-card-row::before,
.dsh-fold:has(> .dsh-fold-trigger:not([aria-disabled="true"]):active) + .dsh-fold::before {
  opacity: 0;
}
.dsh-fold-chev {
  display: inline-flex;
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
}
.dsh-fold[data-open="true"] .dsh-fold-trigger,
.dsh-fold[data-streaming="true"] .dsh-fold-trigger {
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.dsh-fold[data-streaming="true"] .dsh-fold-trigger { cursor: default; }
.dsh-fold[data-open="true"] .dsh-fold-chev,
.dsh-fold[data-streaming="true"] .dsh-fold-chev {
  transform: rotate(90deg);
}
.dsh-fold-grid {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-fold[data-open="true"] .dsh-fold-grid,
.dsh-fold[data-streaming="true"] .dsh-fold-grid {
  grid-template-rows: 1fr;
}
.dsh-fold-inner {
  min-height: 0;
  overflow: hidden;
}
.dsh-fold-body {
  border-top: .5px solid var(--dsw-alias-border-l1);
  background: var(--dsh-surface-sunken);
}

.hs-sidebar-box {
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  padding: 10px 12px;
  background: var(--dsh-surface-canvas);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hs-sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hs-ghead-wrap,
.hs-phead-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.hs-ghead-btn,
.hs-phead-btn {
  all: unset;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: var(--dsh-row-sm, 32px);
  padding: 0 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease;
}
.hs-ghead-btn:focus-visible,
.hs-phead-btn:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.hs-ghead-btn {
  padding-right: 36px;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
}
.hs-phead-btn {
  gap: 10px;
  font-size: var(--dsh-text-md, 13px);
  color: var(--dsw-alias-label-primary);
}
.hs-phead-btn:active { background: var(--hs-press, var(--dsw-alias-interactive-bg-active)); }
.hs-ghead-chev,
.hs-phead-chev {
  display: inline-flex;
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), opacity var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease;
}
.hs-phead-chev {
  opacity: 0;
  margin-left: -4px;
}
.hs-ghead-btn[aria-expanded="false"] .hs-ghead-chev,
.hs-phead-btn[aria-expanded="false"] .hs-phead-chev {
  transform: rotate(-90deg);
}
.hs-pslot {
  width: 18px;
  height: 18px;
  flex: none;
  display: grid;
  place-items: center;
}
.hs-pslot > * {
  grid-area: 1 / 1;
  display: inline-grid;
  place-items: center;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-pfolder-open,
.hs-pfolder-closed { color: var(--dsw-alias-label-secondary); }
.hs-phead-btn[aria-expanded="true"] .hs-pfolder-closed,
.hs-phead-btn[aria-expanded="false"] .hs-pfolder-open { display: none; }
.hs-pgrip { opacity: 0; color: var(--dsw-alias-label-tertiary); }
.hs-pmark {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-phead-btn[aria-expanded="true"] .hs-pmark { display: none; }
.hs-ghead-count {
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-caption);
  font-variant-numeric: tabular-nums;
}
.hs-ghead-acts {
  position: absolute;
  right: 4px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-pacts {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 15px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-ghead-wrap:focus-within .hs-ghead-acts,
.hs-phead-wrap:focus-within .hs-pacts { opacity: 1; pointer-events: auto; }
.hs-phead-wrap:focus-within .hs-phead-btn { padding-right: 57px; }
.hs-phead-wrap:focus-within .hs-pfolder-open,
.hs-phead-wrap:focus-within .hs-pfolder-closed,
.hs-phead-wrap:focus-within .hs-pmark { opacity: 0; }
.hs-phead-wrap:focus-within .hs-pgrip,
.hs-phead-wrap:focus-within .hs-phead-chev { opacity: 1; }
.hs-group-rows[hidden] { display: none; }

.hs-conv-wrap,
.hs-list-wrap { position: relative; }
.hs-conv-row {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: 20px 16px;
  column-gap: 8px;
  row-gap: 2px;
  align-items: center;
  height: var(--dsh-row-lg, 48px);
  padding: 5px 6px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-weight: 400;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.hs-conv-row:focus-visible,
.hs-list-row:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.hs-conv-row[aria-current="true"],
.hs-list-row[aria-current="true"] {
  background: var(--hs-sel, var(--dsw-alias-interactive-bg-active));
  font-weight: 400;
}
.hs-conv-row:active,
.hs-list-row:active {
  background: var(--hs-press, var(--dsw-alias-interactive-bg-active));
}
.hs-conv-title {
  grid-row: 1;
  grid-column: 1;
  font-size: var(--dsh-text-md, 13px);
  font-weight: 400;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-conv-state {
  grid-row: 1;
  grid-column: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.hs-mark {
  width: 14px;
  height: 14px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hs-mark.is-spin {
  color: var(--dsw-alias-state-business-primary);
  transform-origin: 50% 50%;
  animation: dsh-spin var(--dsh-dur-spin, 800ms) linear infinite;
}
.hs-mark .hs-spin-track { stroke: color-mix(in srgb, currentColor 22%, transparent); }
.hs-mark .hs-spin-arc { stroke-linecap: butt; }
.hs-mark.is-warn { color: var(--dsw-alias-state-warn-primary); }
.hs-mark.is-ok { color: var(--dsw-alias-state-success-primary); }
.hs-conv-sub {
  grid-row: 2;
  grid-column: 1 / -1;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-sub-ico {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 3px;
  vertical-align: -1.5px;
}
.hs-conv-acts {
  position: absolute;
  right: 5px;
  top: 27px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-list-wrap > .hs-conv-acts {
  top: 50%;
  transform: translateY(-50%);
}
.hs-conv-acts .hs-obtn svg {
  width: 12px;
  height: 12px;
}
.hs-obtn {
  all: unset;
  position: relative;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  display: inline-grid;
  place-items: center;
  border-radius: var(--dsw-radius-xs, 4px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: color var(--dsh-dur-hover, 120ms) ease;
}
.hs-obtn::after { content: ""; position: absolute; inset: -4px; }
.hs-obtn:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.hs-conv-wrap:focus-within .hs-conv-acts,
.hs-list-wrap:focus-within .hs-conv-acts { opacity: 1; pointer-events: auto; }
.hs-conv-wrap:focus-within .hs-conv-sub { margin-right: 74px; }
.hs-conv-wrap:focus-within:has(.hs-done) .hs-conv-sub { margin-right: 95px; }
.hs-list-wrap:focus-within .hs-conv-state { display: none; }
.hs-list-wrap:focus-within .hs-list-title { margin-right: 66px; }
.hs-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: var(--dsh-row-sm, 32px);
  padding: 0 6px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-size: var(--dsh-text-md, 13px);
  font-weight: 400;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.hs-list-row.is-in-proj { padding-left: 18px; }
.hs-list-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-row-num-read {
  font-size: var(--dsh-text-2xs, 10px);
  color: var(--dsw-alias-label-caption);
  font-variant-numeric: tabular-nums;
}
.hs-row-meta {
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}
@media (hover: hover) {
  .hs-ghead-btn:hover,
  .hs-ghead-btn:hover .hs-ghead-chev { color: var(--dsw-alias-label-primary); }
  .hs-ghead-wrap:hover .hs-ghead-acts,
  .hs-phead-wrap:hover .hs-pacts { opacity: 1; pointer-events: auto; }
  .hs-phead-btn:hover { background: var(--hs-hover, var(--dsw-alias-interactive-bg-hover)); }
  .hs-phead-wrap:hover .hs-phead-btn { padding-right: 57px; }
  .hs-phead-wrap:hover .hs-pfolder-open,
  .hs-phead-wrap:hover .hs-pfolder-closed,
  .hs-phead-wrap:hover .hs-pmark { opacity: 0; }
  .hs-phead-wrap:hover .hs-pgrip,
  .hs-phead-wrap:hover .hs-phead-chev { opacity: 1; }
  .hs-conv-row:not([aria-current="true"]):hover,
  .hs-list-row:not([aria-current="true"]):hover {
    background: var(--hs-hover, var(--dsw-alias-interactive-bg-hover));
  }
  .hs-conv-wrap:hover .hs-conv-acts,
  .hs-list-wrap:hover .hs-conv-acts { opacity: 1; pointer-events: auto; }
  .hs-conv-wrap:hover .hs-conv-sub { margin-right: 74px; }
  .hs-conv-wrap:hover:has(.hs-done) .hs-conv-sub { margin-right: 95px; }
  .hs-list-wrap:hover .hs-conv-state { display: none; }
  .hs-list-wrap:hover .hs-list-title { margin-right: 66px; }
  .hs-obtn:hover { color: var(--dsw-alias-label-primary); }
}
@media (hover: none) {
  .hs-ghead-acts,
  .hs-pacts { opacity: 1; pointer-events: auto; }
  .hs-phead-btn { padding-right: 57px; }
  .hs-conv-wrap:has([aria-current="true"]) .hs-conv-acts,
  .hs-list-wrap:has([aria-current="true"]) .hs-conv-acts { opacity: 1; pointer-events: auto; }
  .hs-conv-wrap:has([aria-current="true"]) .hs-conv-sub { margin-right: 74px; }
  .hs-conv-wrap:has([aria-current="true"]):has(.hs-done) .hs-conv-sub { margin-right: 95px; }
  .hs-list-wrap:has([aria-current="true"]) .hs-conv-state { display: none; }
  .hs-list-wrap:has([aria-current="true"]) .hs-list-title { margin-right: 66px; }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/MenuSurface.tsx
		/** @jsxImportSource react */
		const MenuSurface = (0, react.forwardRef)(function MenuSurface({ compact = false, material = "translucent", footer, origin, className, style, children, ...rest }, ref) {
			const id = (0, react.useId)();
			const backingRef = (0, react.useRef)(null);
			(typeof document !== "undefined" ? react.useLayoutEffect : react.useEffect)(() => {
				if (backingRef.current !== null && typeof document !== "undefined") document.body.appendChild(backingRef.current);
			}, [material]);
			const anchor = {
				"--dsh-menu-anchor": `--dsh-menu-${id.replaceAll(":", "")}`,
				...origin !== void 0 ? { "--dsh-pop-origin": origin } : {}
			};
			const size = compact ? " hs-msurf-compact" : "";
			const canPortal = material === "translucent" && typeof document !== "undefined" && Boolean(document.body);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				...rest,
				ref,
				"data-menu-material": material,
				className: `hs-msurf${size}${className ? ` ${className}` : ""}`,
				style: {
					...style,
					...anchor
				},
				children: [
					material === "translucent" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: "hs-msurf-material"
					}),
					children,
					footer !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "hs-msurf-footer",
						children: footer
					})
				]
			}), canPortal && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: backingRef,
				"aria-hidden": "true",
				"data-menu-backing": "",
				className: `hs-msurf-backing${size}`,
				style: {
					...anchor,
					visibility: style?.visibility
				}
			}), document.body)] });
		});
		const menuSurfaceCss = `
@keyframes dsh-menu-pop {
  from { opacity: 0; transform: scale(.96) translateY(-2px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.hs-msurf {
  --dsh-r-outer: var(--dsw-radius-lg, 16px);
  --dsh-pad: 4px;
  --dsh-menu-anchor: none;
  --dsh-pop-origin: top left;
  box-sizing: border-box;
  padding: var(--dsh-pad);
  display: flex;
  flex-direction: column;
  gap: 1px;
  anchor-name: var(--dsh-menu-anchor);
  isolation: isolate;
  transform-origin: var(--dsh-pop-origin, top left);
}
:where(.hs-msurf) { position: relative; }
.hs-msurf,
.hs-msurf-backing {
  border-radius: var(--dsw-radius-lg, 16px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
}
.hs-msurf-compact,
.hs-msurf.hs-msurf-compact {
  --dsh-r-outer: var(--dsw-radius-md, 12px);
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
}
.hs-msurf[data-side="bottom"][data-align="start"] { --dsh-pop-origin: top left; }
.hs-msurf[data-side="bottom"][data-align="end"] { --dsh-pop-origin: top right; }
.hs-msurf[data-side="top"][data-align="start"] { --dsh-pop-origin: bottom left; }
.hs-msurf[data-side="top"][data-align="end"] { --dsh-pop-origin: bottom right; }
.hs-msurf[data-side="right"] { --dsh-pop-origin: left top; }
.hs-msurf[data-pop-anim="true"] {
  animation: dsh-menu-pop var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
/* 实底把菜单主题色叠在同一元素的不透明基底上，不创建 backdrop-filter 或跨 DOM 的 backing。 */
.hs-msurf[data-menu-material="solid"] {
  background: linear-gradient(var(--dsw-menu-surface-fill), var(--dsw-menu-surface-fill)), var(--dsw-alias-bg-base);
}
.hs-msurf[data-menu-material="translucent"] {
  box-shadow: var(--dsh-glass-outer, var(--dsh-glass-shadow));
}
/* 静态无 data-menu-material 标记的 .hs-msurf（如预览台标本）直接展示同一套待办栏共享毛玻璃，不与内部 .hs-msurf-material 叠两层滤镜 */
.hs-msurf:not([data-menu-material]) {
  background: var(--dsh-menu-surface-fill, var(--dsw-menu-surface-fill));
  -webkit-backdrop-filter: var(--dsh-menu-backdrop-filter, var(--dsw-menu-backdrop-filter));
  backdrop-filter: var(--dsh-menu-backdrop-filter, var(--dsw-menu-backdrop-filter));
  box-shadow: var(--dsh-glass-shadow);
}
.hs-msurf-material {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  corner-shape: inherit;
  background: var(--dsh-menu-surface-fill, var(--dsw-menu-surface-fill));
  -webkit-backdrop-filter: var(--dsh-menu-backdrop-filter, var(--dsw-menu-backdrop-filter));
  backdrop-filter: var(--dsh-menu-backdrop-filter, var(--dsw-menu-backdrop-filter));
  box-shadow: var(--dsh-glass-inset, none);
  pointer-events: none;
}
/* 同心菜单项（标准 16 - 4 = 12px / 紧凑 12 - 4 = 8px）与 12px 两端留白分割线（4px 容器内距 + 8px 缩进） */
.hs-msurf-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: var(--dsh-row-sm, 32px);
  padding: 6px 8px;
  border: 0;
  border-radius: max(0px, calc(var(--dsh-r-outer) - 4px));
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--dsh-text-md, 13px);
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.hs-msurf-compact .hs-msurf-item {
  min-height: var(--dsh-control-sm, 28px);
  padding: 4px 8px;
  font-size: var(--dsh-text-sm, 12px);
  line-height: 18px;
}
.hs-msurf-item:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.hs-msurf-sep {
  margin: 3px calc(12px - var(--dsh-pad, 4px));
  border-top: .5px solid var(--dsw-alias-border-l2);
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-msurf-footer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  margin-top: 3px;
  display: flex;
  flex-direction: column;
}
.hs-msurf-footer::before {
  content: "";
  display: block;
  margin: 0 calc(12px - var(--dsh-pad, 4px)) 3px;
  border-top: .5px solid var(--dsw-alias-border-l2);
}
@media (hover: hover) {
  .hs-msurf-item:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .hs-msurf-item:hover + .hs-msurf-sep,
  .hs-msurf-sep:has(+ .hs-msurf-item:hover) {
    opacity: 0;
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .hs-msurf,
  .hs-msurf[data-menu-material],
  .hs-msurf:not([data-menu-material]) {
    background: var(--dsh-surface-floating, var(--dsw-alias-bg-layer-2));
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    border: 1px solid var(--dsw-alias-border-l4);
    box-shadow: var(--dsw-elevation-prominent);
  }
  .hs-msurf-material {
    background: var(--dsh-surface-floating, var(--dsw-alias-bg-layer-2));
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }
}
html[data-dsh-reduce-trans] .hs-msurf,
html[data-dsh-reduce-trans] .hs-msurf[data-menu-material],
html[data-dsh-reduce-trans] .hs-msurf:not([data-menu-material]) {
  background: var(--dsh-surface-floating, var(--dsw-alias-bg-layer-2));
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border: 1px solid var(--dsw-alias-border-l4);
  box-shadow: var(--dsw-elevation-prominent);
}
html[data-dsh-reduce-trans] .hs-msurf-material {
  background: var(--dsh-surface-floating, var(--dsw-alias-bg-layer-2));
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: none;
}
.hs-msurf-backing { display: none; }
html[data-platform=darwin] .hs-msurf-backing {
  display: block;
  position: fixed;
  position-anchor: var(--dsh-menu-anchor);
  top: anchor(top);
  left: anchor(left);
  width: anchor-size(width, 0px);
  height: anchor-size(height, 0px);
  z-index: -1;
  background: var(--dsw-alias-bg-base);
  pointer-events: none;
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/anchored-position.ts
		/**
		* 统一浮层锚定定位：对齐官方 ui-primitives 的 useAnchoredPosition。
		*
		* open 时测量锚点和面板，side 决定贴上/贴下（隔 gap），align 决定左对齐/右对齐；
		* 夹在视口内（四边留 margin，顶边额外避开窗口标题栏 --dsh-frame-top-clearance）。
		* 只跟随能移动锚点的滚动（窗口 / 锚点祖先），窗口缩放、面板自身尺寸变化也会重算。
		*/
		function useAnchoredPosition(options) {
			const { open, anchorRef, panelRef, side = "bottom", align = "start", gap, margin } = options;
			const [position, setPosition] = (0, react.useState)(null);
			(0, react.useLayoutEffect)(() => {
				if (!open) {
					setPosition(null);
					return;
				}
				const measure = () => {
					const anchor = anchorRef.current?.getBoundingClientRect();
					if (anchor === void 0) return;
					const panel = panelRef.current;
					const width = panel?.offsetWidth ?? 0;
					const height = panel?.offsetHeight ?? 0;
					let left = align === "end" ? anchor.right - width : anchor.left;
					let top = side === "top" ? anchor.top - gap - height : anchor.bottom + gap;
					if (width > 0) left = Math.min(Math.max(left, margin), window.innerWidth - width - margin);
					if (height > 0) top = Math.min(Math.max(top, topMargin(margin)), window.innerHeight - height - margin);
					setPosition((current) => current?.left === left && current?.top === top ? current : {
						left,
						top
					});
				};
				const onScroll = (event) => {
					const anchor = anchorRef.current;
					if (anchor === null) return;
					const target = event.target;
					if (target === window || target === document || target instanceof Node && target !== anchor && target.contains(anchor)) measure();
				};
				measure();
				window.addEventListener("scroll", onScroll, true);
				window.addEventListener("resize", measure);
				const panel = panelRef.current;
				let observer = null;
				if (typeof ResizeObserver !== "undefined" && panel !== null) {
					observer = new ResizeObserver(measure);
					observer.observe(panel);
				}
				return () => {
					observer?.disconnect();
					window.removeEventListener("scroll", onScroll, true);
					window.removeEventListener("resize", measure);
				};
			}, [
				open,
				anchorRef,
				panelRef,
				side,
				align,
				gap,
				margin
			]);
			return position;
		}
		function topMargin(margin) {
			const root = document.documentElement;
			const clearance = Number.parseFloat(getComputedStyle(root).getPropertyValue("--dsh-frame-top-clearance"));
			return Number.isNaN(clearance) ? margin : Math.max(margin, (root.hasAttribute("data-fullscreen") ? 0 : clearance) + 20);
		}
		(0, react.forwardRef)(function Input({ size = "md", invalid = false, onEnter, onKeyDown, className, ...rest }, ref) {
			const sizeClass = size === "lg" ? " dsh-input-lg" : size === "dialog" ? " dsh-input-dialog" : "";
			const errorClass = invalid ? " is-error dsh-input-error" : "";
			const handleKeyDown = (event) => {
				onKeyDown?.(event);
				if (event.defaultPrevented) return;
				if (event.key === "Enter" && onEnter && !isImeComposing(event)) onEnter(event.currentTarget.value, event);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				ref,
				"aria-invalid": invalid || rest["aria-invalid"] || void 0,
				onKeyDown: onEnter || onKeyDown ? handleKeyDown : void 0,
				className: `dsh-input${sizeClass}${errorClass}${className ? ` ${className}` : ""}`,
				...rest
			});
		});
		(0, react.forwardRef)(function SearchInput({ value, onChange, clearLabel = "清空搜索", leadingIcon, onEnter, onKeyDown, disabled, className, ...rest }, ref) {
			const localRef = (0, react.useRef)(null);
			const resolvedIcon = leadingIcon === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, {
				size: 14,
				inline: false
			}) : leadingIcon;
			const handleKeyDown = (event) => {
				onKeyDown?.(event);
				if (event.defaultPrevented) return;
				if (event.key === "Enter" && onEnter && !isImeComposing(event)) onEnter(value, event);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-search${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`,
				children: [
					resolvedIcon !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-search-ico",
						"aria-hidden": "true",
						children: resolvedIcon
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: (node) => {
							localRef.current = node;
							if (typeof ref === "function") ref(node);
							else if (ref) ref.current = node;
						},
						type: "text",
						value,
						disabled,
						onChange: (event) => onChange(event.target.value),
						onKeyDown: onEnter || onKeyDown ? handleKeyDown : void 0,
						...rest
					}),
					value.length > 0 && !disabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsh-search-clear",
						"aria-label": clearLabel,
						onClick: () => {
							onChange("");
							localRef.current?.focus?.();
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {
							size: 12,
							inline: false
						})
					})
				]
			});
		});
		(0, react.forwardRef)(function PasswordInput({ invalid = false, visible, defaultVisible = false, onVisibleChange, revealLabel = "显示密钥", hideLabel = "隐藏密钥", trailingAction, onEnter, onKeyDown, disabled, className, ...rest }, ref) {
			const [uncontrolledVisible, setUncontrolledVisible] = (0, react.useState)(defaultVisible);
			const isShown = visible !== void 0 ? visible : uncontrolledVisible;
			const toggleVisible = () => {
				if (disabled) return;
				const next = !isShown;
				if (visible === void 0) setUncontrolledVisible(next);
				onVisibleChange?.(next);
			};
			const handleKeyDown = (event) => {
				onKeyDown?.(event);
				if (event.defaultPrevented) return;
				if (event.key === "Enter" && onEnter && !isImeComposing(event)) onEnter(event.currentTarget.value, event);
			};
			const boxNode = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-pwd-box${invalid ? " is-error" : ""}${disabled ? " is-disabled" : ""}${trailingAction === void 0 && className ? ` ${className}` : ""}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					ref,
					type: isShown ? "text" : "password",
					disabled,
					"aria-invalid": invalid || rest["aria-invalid"] || void 0,
					onKeyDown: onEnter || onKeyDown ? handleKeyDown : void 0,
					...rest
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dsh-pwd-eye",
					disabled,
					"aria-label": isShown ? hideLabel : revealLabel,
					"aria-pressed": isShown,
					onClick: toggleVisible,
					children: isShown ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EyeOffIcon, {
						size: 15,
						inline: false
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EyeIcon, {
						size: 15,
						inline: false
					})
				})]
			});
			if (trailingAction === void 0) return boxNode;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `dsh-pwd-wrap${className ? ` ${className}` : ""}`,
				children: [boxNode, trailingAction]
			});
		});
		(0, react.forwardRef)(function Textarea({ invalid = false, code = false, className, ...rest }, ref) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
				ref,
				"aria-invalid": invalid || rest["aria-invalid"] || void 0,
				className: `dsh-textarea${code ? " is-code" : ""}${invalid ? " is-error" : ""}${className ? ` ${className}` : ""}`,
				...rest
			});
		});
		const inputsCss = `
.dsh-input {
  box-sizing: border-box;
  width: 100%;
  height: var(--dsh-control-md, 36px);
  padding: 0 14px;
  border-radius: 999px;
  corner-shape: round;
  border: .5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--dsh-text-md, 13px);
  outline: none;
}
.dsh-input::placeholder { color: var(--dsw-alias-label-caption); }
.dsh-input:disabled { opacity: .5; cursor: not-allowed; }
.dsh-input:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -1px;
}
.dsh-input[aria-invalid="true"],
.dsh-input.is-error,
.dsh-input-error {
  border-color: var(--dsw-alias-state-error-primary);
}
.dsh-input[aria-invalid="true"]:focus-visible,
.dsh-input.is-error:focus-visible,
.dsh-input-error:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-error-primary);
  outline-offset: -1px;
}
.dsh-input-dialog {
  height: var(--dsh-control-md, 36px);
  padding: 0 14px;
  border-radius: 999px;
  corner-shape: round;
}
.dsh-input-lg {
  height: var(--dsh-control-lg, 44px);
  padding: 0 18px;
  border-radius: 999px;
  corner-shape: round;
  font-size: var(--dsh-text-lg, 14px);
}

.dsh-search {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--dsh-control-md, 36px);
  padding: 0 8px 0 14px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-bg-base);
  border: .5px solid var(--dsw-alias-border-l3);
}
.dsh-search.is-disabled { opacity: .5; cursor: not-allowed; }
.dsh-search:focus-within {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -1px;
}
.dsh-search-ico {
  display: inline-grid;
  place-items: center;
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-text-md, 13px);
}
.dsh-search input {
  all: unset;
  flex: 1;
  min-width: 0;
  font-size: var(--dsh-text-md, 13px);
  color: var(--dsw-alias-label-primary);
}
.dsh-search input::placeholder { color: var(--dsw-alias-label-tertiary); }
.dsh-search-clear {
  all: unset;
  position: relative;
  width: var(--dsh-control-xs, 20px);
  height: var(--dsh-control-xs, 20px);
  border-radius: 50%;
  corner-shape: round;
  display: grid;
  place-items: center;
  flex: none;
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-search-clear::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  corner-shape: round;
}
@media (pointer: coarse) {
  .dsh-search-clear::after { inset: -8px; }
}
.dsh-search-clear:active {
  transform: scale(.94);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-search-clear:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
@media (hover: hover) {
  .dsh-search-clear:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}

.dsh-pwd-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsh-pwd-box {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: var(--dsh-control-md, 36px);
  padding: 0 4px 0 14px;
  border-radius: 999px;
  corner-shape: round;
  border: .5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
}
.dsh-pwd-box.is-disabled { opacity: .5; cursor: not-allowed; }
.dsh-pwd-box.is-error { border-color: var(--dsw-alias-state-error-primary); }
.dsh-pwd-box:focus-within {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -1px;
}
.dsh-pwd-box.is-error:focus-within {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-error-primary);
  outline-offset: -1px;
}
.dsh-pwd-box input {
  all: unset;
  flex: 1;
  min-width: 0;
  font-family: var(--ds-font-family-code);
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-primary);
}
.dsh-pwd-box input::placeholder { color: var(--dsw-alias-label-caption); }
.dsh-pwd-eye {
  all: unset;
  box-sizing: border-box;
  width: var(--dsh-control-sm, 28px);
  height: var(--dsh-control-sm, 28px);
  border-radius: 50%;
  corner-shape: round;
  display: grid;
  place-items: center;
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pwd-eye:disabled { cursor: not-allowed; }
.dsh-pwd-eye:active:not(:disabled) {
  transform: scale(.95);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pwd-eye:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
@media (hover: hover) {
  .dsh-pwd-eye:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}

.dsh-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.dsh-select-wrap.is-open { z-index: 45; }
.dsh-select {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
  height: var(--dsh-control-md, 36px);
  padding: 0 11px 0 14px;
  border-radius: 999px;
  corner-shape: round;
  border: .5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--dsh-text-md, 13px);
  text-align: left;
  cursor: pointer;
  outline: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-select-sm {
  height: var(--dsh-control-sm, 28px);
  font-size: var(--dsh-text-sm, 12px);
  padding: 0 10px 0 12px;
  gap: 6px;
  border-radius: 999px;
  corner-shape: round;
}
.dsh-select.is-error,
.dsh-select[aria-invalid="true"] {
  border-color: var(--dsw-alias-state-error-primary);
}
.dsh-select-val {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-select-val.is-placeholder { color: var(--dsw-alias-label-caption); }
@media (hover: hover) {
  .dsh-select:hover:not(:disabled) { border-color: var(--dsw-alias-border-l4); }
}
.dsh-select[aria-expanded="true"] { border-color: var(--dsw-alias-border-l4); }
.dsh-select:not(:disabled):active {
  transform: scale(.99);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-select:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -1px;
}
.dsh-select.is-error:focus-visible,
.dsh-select[aria-invalid="true"]:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-error-primary);
  outline-offset: -1px;
}
.dsh-select:disabled { opacity: .45; cursor: not-allowed; }
.dsh-select-arrow {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-select[aria-expanded="true"] .dsh-select-arrow {
  transform: rotate(180deg);
  color: var(--dsw-alias-label-primary);
}
.hs-msurf.dsh-select-portal-menu {
  max-height: 240px;
  overflow: hidden;
}
.dsh-select-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 232px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.dsh-select-list::-webkit-scrollbar { display: none; }
.hs-msurf.dsh-select-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  min-width: 156px;
  max-height: 240px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  z-index: 46;
  opacity: 0;
  pointer-events: none;
  transform-origin: top center;
  transform: scale(.97) translateY(-3px);
  transition: opacity var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), transform var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-msurf.dsh-select-menu::-webkit-scrollbar { display: none; }
.dsh-select-wrap.is-open > .hs-msurf.dsh-select-menu {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1) translateY(0);
}

.dsh-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 76px;
  padding: 10px 14px;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--dsh-text-md, 13px);
  line-height: 1.5;
  resize: vertical;
  outline: none;
}
.dsh-textarea::placeholder { color: var(--dsw-alias-label-caption); }
.dsh-textarea:disabled { opacity: .5; cursor: not-allowed; }
.dsh-textarea.is-code {
  font-family: var(--ds-font-family-code);
  font-size: var(--dsh-text-sm, 12px);
}
.dsh-textarea.is-error,
.dsh-textarea[aria-invalid="true"] {
  border-color: var(--dsw-alias-state-error-primary);
}
.dsh-textarea:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -1px;
}
.dsh-textarea.is-error:focus-visible,
.dsh-textarea[aria-invalid="true"]:focus-visible {
  border-color: transparent;
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-error-primary);
  outline-offset: -1px;
}

@media (pointer: coarse) and (max-width: 768px) {
  .dsh-input,
  .dsh-search input,
  .dsh-pwd-box input,
  .dsh-textarea,
  .comp-textarea {
    font-size: var(--dsh-text-xl, 16px);
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/navigation.tsx
		const navigationCss = `
.dsh-seg {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  padding: 2px;
  gap: 2px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-surface-sunken);
}
.dsh-seg button,
.dsh-seg-item {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: calc(var(--dsh-control-sm, 28px) - 4px);
  padding: 0 12px;
  border-radius: 999px;
  corner-shape: round;
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 400;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-seg button:disabled,
.dsh-seg-item:disabled { opacity: .45; cursor: not-allowed; }
.dsh-seg button:focus-visible,
.dsh-seg-item:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
@media (hover: hover) {
  .dsh-seg button:hover:not(:disabled),
  .dsh-seg-item:hover:not(:disabled) {
    color: var(--dsw-alias-label-primary);
  }
}
.dsh-seg button[aria-selected="true"],
.dsh-seg-item[aria-selected="true"],
.dsh-seg-ind {
  background: var(--dsh-surface-floating);
  box-shadow: 0 1px 2px rgb(0 0 0 / .08);
}
.dsh-seg button[aria-selected="true"],
.dsh-seg-item[aria-selected="true"] {
  color: var(--dsw-alias-label-primary);
}
.dsh-seg[data-ind] button[aria-selected="true"],
.dsh-seg[data-ind] .dsh-seg-item[aria-selected="true"] {
  background: transparent;
  box-shadow: none;
}
.dsh-seg-ind {
  position: absolute;
  z-index: -1;
  top: 2px;
  left: 0;
  height: calc(var(--dsh-control-sm, 28px) - 4px);
  border-radius: 999px;
  corner-shape: round;
  pointer-events: none;
  width: var(--ind-w, 0);
  transform: translateX(var(--ind-x, 0));
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), width var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-seg-ind[data-instant] { transition: none; }

.dsh-utabs {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 4px;
  border-bottom: .5px solid var(--dsw-alias-border-l2);
}
.dsh-utab {
  all: unset;
  box-sizing: border-box;
  height: var(--dsh-control-md, 36px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: -.5px;
  border-bottom: 2px solid transparent;
  font-size: var(--dsh-text-md, 13px);
  font-weight: 500;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--dsh-dur-hover, 120ms) ease, border-color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-utab:disabled { opacity: .45; cursor: not-allowed; }
.dsh-utab:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
@media (hover: hover) {
  .dsh-utab:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
}
.dsh-utab[aria-selected="true"] {
  color: var(--dsw-alias-label-primary);
  border-bottom-color: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
}
.dsh-utabs[data-ind] .dsh-utab[aria-selected="true"] {
  border-bottom-color: transparent;
}
.dsh-utabs-ind {
  position: absolute;
  left: 0;
  bottom: -.5px;
  height: 2px;
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  pointer-events: none;
  width: var(--ind-w, 0);
  transform: translateX(var(--ind-x, 0));
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)), width var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-utabs-ind[data-instant] { transition: none; }
.dsh-utab-pane[hidden] { display: none; }
`;
		//#endregion
		//#region ../packages/dsh-ui/src/ScrollArea.tsx
		const LONG_LIST_RATIO = 2;
		const THUMB_PAD = 4;
		const FOLLOW_BOTTOM_THRESHOLD = 40;
		const USER_SCROLL_COOLDOWN_MS = 150;
		function setBoolAttr(el, name, on) {
			if (on) el.setAttribute(name, "");
			else el.removeAttribute(name);
		}
		function assignRef(ref, value) {
			if (!ref) return;
			if (typeof ref === "function") ref(value);
			else ref.current = value;
		}
		/**
		* 05 ScrollArea 命令式挂载器（供 React 组件与预览台同源调用）：
		* - 动态计算 scrollTop 与可滚高度，切换视口 data-fade-top / data-fade-bottom 驱动 7 段幂律边缘渐隐；
		* - 内容 > 2 屏时在外框启用悬浮细滑块 .dsh-scroll-thumb（aria-hidden，支持指针拖拽，4px -> 6px）；
		* - 可选 followBottom 流式自动贴底（距底 <= 40px 自动跟随，用户主动上滚 150ms 冷却防抢滚动条）。
		*/
		function attachScrollArea(viewport, options) {
			const frame = viewport.parentElement;
			const thumb = frame?.querySelector(".dsh-scroll-thumb") ?? null;
			const followBottom = Boolean(options?.followBottom);
			const now = options?.now ?? (() => Date.now());
			let hideTimer = null;
			let drag = null;
			let lastScrollTop = viewport.scrollTop || 0;
			let lastScrollHeight = viewport.scrollHeight || 0;
			let nearBottom = lastScrollHeight - (viewport.clientHeight || 0) - lastScrollTop <= FOLLOW_BOTTOM_THRESHOLD;
			let cooldownUntil = 0;
			let programmaticScroll = false;
			const metrics = () => {
				const clientH = viewport.clientHeight || 0;
				const scrollH = viewport.scrollHeight || 0;
				const track = Math.max(0, clientH - THUMB_PAD * 2);
				return {
					clientH,
					scrollH,
					track,
					h: scrollH > 0 ? Math.max(24, track * clientH / scrollH) : 24,
					maxScroll: Math.max(0, scrollH - clientH)
				};
			};
			const sync = () => {
				const { clientH, scrollH, track, h, maxScroll } = metrics();
				const topPos = viewport.scrollTop || 0;
				const hasTop = topPos > 2;
				const hasBot = clientH > 0 && topPos + clientH < scrollH - 2;
				setBoolAttr(viewport, "data-fade-top", hasTop);
				setBoolAttr(viewport, "data-fade-bottom", hasBot);
				if (!thumb) return;
				const isLong = clientH > 0 && scrollH > clientH * LONG_LIST_RATIO;
				thumb.hidden = !isLong;
				if (!isLong) return;
				const thumbTop = (viewport.offsetTop || 0) + THUMB_PAD + (track - h) * (maxScroll > 0 ? topPos / maxScroll : 0);
				thumb.style.height = `${h}px`;
				thumb.style.transform = `translateY(${thumbTop}px)`;
			};
			const maybeStickToBottom = () => {
				if (!followBottom) return;
				const curScrollH = viewport.scrollHeight || 0;
				const curClientH = viewport.clientHeight || 0;
				const curTop = viewport.scrollTop || 0;
				if (curScrollH <= lastScrollHeight) {
					lastScrollHeight = curScrollH;
					nearBottom = curScrollH - curClientH - curTop <= FOLLOW_BOTTOM_THRESHOLD;
					return;
				}
				const prevDistance = lastScrollHeight - curClientH - curTop;
				const shouldStick = (nearBottom || prevDistance <= FOLLOW_BOTTOM_THRESHOLD) && now() >= cooldownUntil;
				lastScrollHeight = curScrollH;
				if (shouldStick) {
					programmaticScroll = true;
					viewport.scrollTop = Math.max(0, curScrollH - curClientH);
					lastScrollTop = viewport.scrollTop;
					nearBottom = true;
					programmaticScroll = false;
				} else nearBottom = curScrollH - curClientH - curTop <= FOLLOW_BOTTOM_THRESHOLD;
			};
			const onScroll = () => {
				const curTop = viewport.scrollTop || 0;
				const curScrollH = viewport.scrollHeight || 0;
				const curClientH = viewport.clientHeight || 0;
				if (!programmaticScroll && curTop < lastScrollTop - 1) cooldownUntil = now() + USER_SCROLL_COOLDOWN_MS;
				lastScrollTop = curTop;
				lastScrollHeight = curScrollH;
				nearBottom = curScrollH - curClientH - curTop <= FOLLOW_BOTTOM_THRESHOLD;
				sync();
				if (frame) {
					frame.setAttribute("data-scroll-active", "");
					if (hideTimer !== null) clearTimeout(hideTimer);
					hideTimer = setTimeout(() => {
						frame.removeAttribute("data-scroll-active");
					}, 900);
				}
			};
			const onWheel = (event) => {
				const deltaY = event.deltaY;
				if (typeof deltaY === "number" && deltaY < 0) cooldownUntil = now() + USER_SCROLL_COOLDOWN_MS;
			};
			const onThumbDown = (event) => {
				event.preventDefault();
				if (!thumb) return;
				thumb.setPointerCapture?.(event.pointerId);
				thumb.setAttribute("data-dragging", "");
				drag = {
					y: event.clientY,
					scroll: viewport.scrollTop || 0
				};
			};
			const onThumbMove = (event) => {
				if (!drag) return;
				const { track, h, maxScroll } = metrics();
				const next = drag.scroll + (event.clientY - drag.y) * maxScroll / Math.max(1, track - h);
				viewport.scrollTop = Math.min(maxScroll, Math.max(0, next));
				sync();
			};
			const endDrag = () => {
				drag = null;
				thumb?.removeAttribute("data-dragging");
			};
			viewport.addEventListener("scroll", onScroll, { passive: true });
			viewport.addEventListener("wheel", onWheel, { passive: true });
			thumb?.addEventListener("pointerdown", onThumbDown);
			thumb?.addEventListener("pointermove", onThumbMove);
			thumb?.addEventListener("pointerup", endDrag);
			thumb?.addEventListener("pointercancel", endDrag);
			const win = viewport.ownerDocument?.defaultView;
			const ResizeCtor = win?.ResizeObserver ?? globalThis.ResizeObserver;
			const ro = ResizeCtor ? new ResizeCtor(() => {
				maybeStickToBottom();
				sync();
			}) : null;
			ro?.observe(viewport);
			const MutationCtor = win?.MutationObserver ?? globalThis.MutationObserver;
			const mo = followBottom && MutationCtor ? new MutationCtor(() => {
				maybeStickToBottom();
				sync();
			}) : null;
			mo?.observe(viewport, {
				childList: true,
				subtree: true,
				characterData: true
			});
			sync();
			return () => {
				if (hideTimer !== null) clearTimeout(hideTimer);
				ro?.disconnect();
				mo?.disconnect();
				viewport.removeEventListener("scroll", onScroll);
				viewport.removeEventListener("wheel", onWheel);
				thumb?.removeEventListener("pointerdown", onThumbDown);
				thumb?.removeEventListener("pointermove", onThumbMove);
				thumb?.removeEventListener("pointerup", endDrag);
				thumb?.removeEventListener("pointercancel", endDrag);
			};
		}
		const ScrollArea = (0, react.forwardRef)(function ScrollArea({ maxHeight, fadeSize, followBottom = false, className, style, viewportClassName, viewportStyle, viewportRef, onScroll, children, ...rest }, ref) {
			const innerViewportRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const el = innerViewportRef.current;
				if (!el) return void 0;
				return attachScrollArea(el, { followBottom });
			}, [followBottom]);
			const resolvedViewportStyle = {
				...viewportStyle,
				...maxHeight !== void 0 ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : {},
				...fadeSize !== void 0 ? { "--dsh-fade-size": typeof fadeSize === "number" ? `${fadeSize}px` : fadeSize } : {}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref,
				className: `dsh-scroll-frame${className ? ` ${className}` : ""}`,
				style,
				...rest,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: (node) => {
						innerViewportRef.current = node;
						assignRef(viewportRef, node);
					},
					className: `dsh-scroll-area${viewportClassName ? ` ${viewportClassName}` : ""}`,
					style: resolvedViewportStyle,
					onScroll,
					children
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsh-scroll-thumb",
					"aria-hidden": "true",
					hidden: true
				})]
			});
		});
		const scrollAreaCss = `
.dsh-scroll-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.dsh-scroll-demo-frame {
  position: relative;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsh-surface-card);
  overflow: hidden;
}
.dsh-scroll-area {
  --dsh-fade-size: 26px;
  --_ft: 0px;
  --_fb: 0px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.dsh-scroll-area::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.dsh-scroll-area[data-fade-top] { --_ft: var(--dsh-fade-size); }
.dsh-scroll-area[data-fade-bottom] { --_fb: var(--dsh-fade-size); }
.dsh-scroll-area[data-fade-top],
.dsh-scroll-area[data-fade-bottom] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0px, rgb(0 0 0 / .05) calc(var(--_ft) * .15), rgb(0 0 0 / .15) calc(var(--_ft) * .30), rgb(0 0 0 / .30) calc(var(--_ft) * .45), rgb(0 0 0 / .50) calc(var(--_ft) * .60), rgb(0 0 0 / .70) calc(var(--_ft) * .75), rgb(0 0 0 / .85) calc(var(--_ft) * .87), #000 var(--_ft), #000 calc(100% - var(--_fb)), rgb(0 0 0 / .85) calc(100% - var(--_fb) * .87), rgb(0 0 0 / .70) calc(100% - var(--_fb) * .75), rgb(0 0 0 / .50) calc(100% - var(--_fb) * .60), rgb(0 0 0 / .30) calc(100% - var(--_fb) * .45), rgb(0 0 0 / .15) calc(100% - var(--_fb) * .30), rgb(0 0 0 / .05) calc(100% - var(--_fb) * .15), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0px, rgb(0 0 0 / .05) calc(var(--_ft) * .15), rgb(0 0 0 / .15) calc(var(--_ft) * .30), rgb(0 0 0 / .30) calc(var(--_ft) * .45), rgb(0 0 0 / .50) calc(var(--_ft) * .60), rgb(0 0 0 / .70) calc(var(--_ft) * .75), rgb(0 0 0 / .85) calc(var(--_ft) * .87), #000 var(--_ft), #000 calc(100% - var(--_fb)), rgb(0 0 0 / .85) calc(100% - var(--_fb) * .87), rgb(0 0 0 / .70) calc(100% - var(--_fb) * .75), rgb(0 0 0 / .50) calc(100% - var(--_fb) * .60), rgb(0 0 0 / .30) calc(100% - var(--_fb) * .45), rgb(0 0 0 / .15) calc(100% - var(--_fb) * .30), rgb(0 0 0 / .05) calc(100% - var(--_fb) * .15), transparent 100%);
}
.dsh-scroll-thumb {
  position: absolute;
  top: 0;
  right: 3px;
  width: 4px;
  min-height: 24px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-scrollbar-thumb, var(--dsw-alias-scrollbar-bg-l1));
  opacity: 0;
  touch-action: none;
  transition: opacity var(--dsh-dur-pop, 150ms) ease, width var(--dsh-dur-hover, 120ms) ease;
}
.dsh-scroll-thumb::after {
  content: "";
  position: absolute;
  inset: -2px -3px -2px -6px;
}
.dsh-scroll-thumb[hidden] { display: none; }
.dsh-scroll-frame[data-scroll-active] > .dsh-scroll-thumb,
.dsh-scroll-demo-frame[data-scroll-active] .dsh-scroll-thumb,
.dsh-scroll-demo-frame[data-demo-pinned] .dsh-scroll-thumb,
.dsh-scroll-thumb[data-dragging] {
  opacity: 1;
}
.dsh-scroll-thumb[data-dragging] {
  width: 6px;
  background: var(--dsh-scrollbar-thumb-hover, var(--dsw-alias-scrollbar-hover-l1));
}
@media (hover: hover) {
  .dsh-scroll-frame:hover > .dsh-scroll-thumb,
  .dsh-scroll-demo-frame:hover .dsh-scroll-thumb {
    opacity: 1;
  }
  .dsh-scroll-thumb:hover {
    width: 6px;
    background: var(--dsh-scrollbar-thumb-hover, var(--dsw-alias-scrollbar-hover-l1));
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/controls.tsx
		/**
		* 03 纯图标正圆按钮（36 / 28 / 20px 全系 50% 正圆 + 永久锁定 corner-shape: round）：
		* 20px 微按钮内置透明 ::after 热区外扩（桌面 28x28 / 触屏 36x36，紧密操作栏自动收窄至 -1px 防碰撞），
		* 按压采用 60ms scale(0.96) 迅捷下压与 150ms 无过冲回弹。
		*/
		const IconButton = (0, react.forwardRef)(function IconButton({ size, shape = "round", variant, tip, className, children, ...rest }, ref) {
			const resolvedSize = size ?? (shape === "xs" ? "xs" : "sm");
			const resolvedVariant = variant ?? (shape === "sm" && size === void 0 ? "outline" : "ghost");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref,
				type: "button",
				"data-hs-tip": tip,
				className: `dsh-ibtn ${resolvedSize === "md" ? "dsh-ibtn-md icon-btn-md" : resolvedSize === "xs" ? "dsh-ibtn-xs icon-btn-xs" : `dsh-ibtn-round icon-btn-round${shape === "sm" ? " dsh-ibtn-sm" : ""}`}${resolvedVariant === "outline" ? " icon-btn-outline" : resolvedVariant === "danger-solid" ? " icon-btn-danger-solid" : resolvedVariant === "danger-ghost" ? " icon-btn-danger-ghost" : ""}${className ? ` ${className}` : ""}`,
				...rest,
				children
			});
		});
		const iconButtonCss = `
.dsh-ibtn,
.icon-btn-md,
.icon-btn-round,
.icon-btn-xs {
  all: unset;
  position: relative;
  box-sizing: border-box;
  border-radius: 50%;
  corner-shape: round;
  display: inline-grid;
  place-items: center;
  flex: none;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease, color var(--dsh-dur-hover, 120ms) ease, transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-ibtn:disabled,
.icon-btn-md:disabled,
.icon-btn-round:disabled,
.icon-btn-xs:disabled {
  opacity: .4;
  cursor: not-allowed;
}
.dsh-ibtn:focus-visible,
.icon-btn-md:focus-visible,
.icon-btn-round:focus-visible,
.icon-btn-xs:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.dsh-ibtn-md,
.icon-btn-md {
  width: var(--dsh-control-md, 36px);
  height: var(--dsh-control-md, 36px);
  font-size: var(--dsh-text-xl, 16px);
}
.dsh-ibtn-round,
.dsh-ibtn-sm,
.icon-btn-round {
  width: var(--dsh-control-sm, 28px);
  height: var(--dsh-control-sm, 28px);
  font-size: var(--dsh-text-lg, 14px);
}
.dsh-ibtn-xs,
.icon-btn-xs {
  width: var(--dsh-control-xs, 20px);
  height: var(--dsh-control-xs, 20px);
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
}
.dsh-ibtn-xs::after,
.icon-btn-xs::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  corner-shape: round;
}
@media (pointer: coarse) {
  .dsh-ibtn-xs::after,
  .icon-btn-xs::after {
    inset: -8px;
  }
}
.hs-ghead-acts .dsh-ibtn-xs::after,
.hs-ghead-acts .icon-btn-xs::after,
.hs-conv-acts .dsh-ibtn-xs::after,
.hs-conv-acts .icon-btn-xs::after {
  inset: -1px;
}
.icon-btn-outline {
  border: .5px solid var(--dsw-alias-border-l3);
}
.icon-btn-danger-ghost {
  color: var(--dsw-alias-state-error-primary);
}
.icon-btn-danger-solid {
  background: var(--dsh-danger-solid-bg, var(--dsw-alias-state-error-primary));
  color: var(--dsh-solid-on-color, var(--dsw-alias-label-primary-foreground));
}
@media (hover: hover) {
  .dsh-ibtn:not(.icon-btn-danger-solid):not(.icon-btn-danger-ghost):hover:not(:disabled),
  .icon-btn-md:not(.icon-btn-danger-solid):hover:not(:disabled),
  .icon-btn-round:not(.icon-btn-danger-solid):hover:not(:disabled),
  .icon-btn-xs:not(.icon-btn-danger-solid):hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
  .icon-btn-danger-ghost:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover-danger);
    color: var(--dsw-alias-state-error-primary);
  }
  .icon-btn-danger-solid:hover:not(:disabled) {
    background: var(--dsh-danger-solid-hover, var(--dsh-danger-solid-bg));
  }
}
.dsh-ibtn:not(.icon-btn-danger-solid):not(.icon-btn-danger-ghost):active:not(:disabled),
.icon-btn-md:not(.icon-btn-danger-solid):active:not(:disabled),
.icon-btn-round:not(.icon-btn-danger-solid):active:not(:disabled),
.icon-btn-xs:not(.icon-btn-danger-solid):active:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-active);
  transform: scale(.96);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.icon-btn-danger-ghost:active:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
  transform: scale(.96);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.icon-btn-danger-solid:active:not(:disabled) {
  transform: scale(.96);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
`;
		const controlsCss = [
			iconButtonCss,
			inputsCss,
			choicesCss,
			navigationCss,
			containersCss,
			scrollAreaCss
		].join("\n");
		//#endregion
		//#region ../packages/dsh-ui/src/feedback.tsx
		function StateDot({ state = "idle", pulse = false, label, className, ...rest }) {
			let dot;
			if (state === "busy") dot = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `dsh-sdot-spin${label === void 0 && className ? ` ${className}` : ""}`,
				"aria-hidden": "true"
			});
			else if (state === "done") dot = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `dsh-sdot-step${label === void 0 && className ? ` ${className}` : ""}`,
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {})
			});
			else dot = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `dsh-sdot${state === "ok" ? " is-ok" : state === "warn" ? " is-warn" : state === "error" ? " is-err" : ""}${pulse ? " is-pulse" : ""}${label === void 0 && className ? ` ${className}` : ""}`,
				"aria-hidden": "true"
			});
			if (label !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				...rest,
				className: `dsh-sdot-item${className ? ` ${className}` : ""}`,
				children: [dot, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				...rest,
				className: "dsh-sdot-wrap",
				children: dot
			});
		}
		function Badge({ variant = "outline", className, children, ...rest }) {
			const variantCls = variant === "outline" ? "" : variant === "subtle" || variant === "neutral" ? " dsh-badge-subtle dsh-badge-neutral" : variant === "error" || variant === "danger" ? " dsh-badge-error dsh-badge-danger" : ` dsh-badge-${variant}`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				...rest,
				className: `dsh-badge${variantCls}${className ? ` ${className}` : ""}`,
				children
			});
		}
		function Banner({ tone = "info", icon, action, className, children, ...rest }) {
			const toneCls = tone === "error" ? "is-err is-error" : `is-${tone}`;
			const defaultIcon = tone === "ok" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SuccessIcon, {}) : tone === "warn" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, {}) : tone === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InfoIcon, {});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				role: tone === "error" || tone === "warn" ? "alert" : "status",
				...rest,
				className: `dsh-banner ${toneCls}${className ? ` ${className}` : ""}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-banner-ico",
						"aria-hidden": "true",
						children: icon ?? defaultIcon
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-banner-text",
						children
					}),
					action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-banner-act",
						children: action
					})
				]
			});
		}
		function EmptyState({ icon, title, description, action, className, children, ...rest }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				...rest,
				className: `dsh-empty${className ? ` ${className}` : ""}`,
				children: [
					icon !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-empty-ico",
						"aria-hidden": "true",
						children: icon
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-empty-title",
						children: title
					}),
					description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-empty-sub",
						children: description
					}),
					children,
					action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-empty-act",
						children: action
					})
				]
			});
		}
		function LoadingState({ title = "正在加载…", description, className, children, ...rest }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				role: "status",
				"aria-live": "polite",
				...rest,
				className: `dsh-empty dsh-loading${className ? ` ${className}` : ""}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-loading-spin dsh-sdot-spin",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpinnerIcon, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-empty-title",
						children: title
					}),
					description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsh-empty-sub",
						children: description
					}),
					children
				]
			});
		}
		const feedbackCss = `
@keyframes dsh-spin {
  to { transform: rotate(360deg); }
}
@keyframes dsh-sdot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .45; transform: scale(.86); }
}

/* StateDot */
.dsh-sdot-wrap {
  display: inline-flex;
  align-items: center;
}
.dsh-sdot-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-secondary);
}
.dsh-sdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  corner-shape: round;
  flex: none;
  background: var(--dsw-alias-label-caption);
}
.dsh-sdot.is-ok { background: var(--dsw-alias-state-success-primary); }
.dsh-sdot.is-warn { background: var(--dsw-alias-state-warn-primary); }
.dsh-sdot.is-err { background: var(--dsw-alias-state-error-primary); }
.dsh-sdot.is-pulse {
  animation: dsh-sdot-pulse 1.6s ease-in-out infinite;
}
.dsh-sdot-spin {
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border-radius: 50%;
  corner-shape: round;
  border: 1.6px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 26%, transparent);
  border-top-color: var(--dsw-alias-state-business-primary);
  animation: dsh-spin var(--dsh-dur-spin, 800ms) linear infinite;
  flex: none;
}
.dsh-sdot-step {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-state-success-primary);
  color: var(--dsh-solid-on-color, var(--dsw-alias-label-primary-foreground));
  display: inline-grid;
  place-items: center;
  font-size: var(--dsh-text-2xs, 10px);
  font-weight: 700;
  flex: none;
}
.dsh-sdot-step svg {
  width: 10px;
  height: 10px;
  stroke-width: 2;
}

/* Badge (20px capsule round) */
.dsh-badge {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--dsh-control-xs, 20px);
  padding: 0 8px;
  border-radius: 999px;
  corner-shape: round;
  font-size: var(--dsh-text-xs, 11px);
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  border: .5px solid var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  white-space: nowrap;
}
.dsh-badge-subtle,
.dsh-badge-neutral {
  border-color: transparent;
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-secondary);
}
.dsh-badge-solid {
  border-color: transparent;
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-label-primary-foreground);
}
.dsh-badge-info {
  border-color: transparent;
  background: var(--dsw-alias-state-business-tertiary);
  color: var(--dsw-alias-state-business-primary);
}
.dsh-badge-ok {
  border-color: transparent;
  background: var(--dsw-alias-state-success-tertiary);
  color: var(--dsh-state-ok-text, var(--dsw-alias-state-success-primary));
}
.dsh-badge-warn {
  border-color: transparent;
  background: var(--dsw-alias-state-warn-tertiary);
  color: var(--dsh-state-warn-text, var(--dsw-alias-state-warn-primary));
}
.dsh-badge-error,
.dsh-badge-danger {
  border-color: transparent;
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  color: var(--dsw-alias-state-error-primary);
}

/* Meter (bar / level / 20-segment context gauge) */
.dsh-meter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-meter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-secondary);
}
.dsh-meter-label {
  flex: none;
  min-width: 76px;
}
.dsh-meter-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-bg-module-platform);
  overflow: hidden;
}
.dsh-meter-fill {
  height: 100%;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-state-business-primary);
  transition: width var(--dsh-dur-hover, 120ms) ease, background-color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-meter-fill.is-ok { background: var(--dsw-alias-state-success-primary); }
.dsh-meter-fill.is-warn { background: var(--dsw-alias-state-warn-primary); }
.dsh-meter-fill.is-err { background: var(--dsw-alias-state-error-primary); }
.dsh-meter-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: var(--dsw-alias-state-warn-primary);
}
.dsh-meter-num {
  flex: none;
  min-width: 36px;
  text-align: right;
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-sm, 12px);
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-meter-seg-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.dsh-meter-seg-label {
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-secondary);
}
.comp-ctx-btn {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--dsh-control-xs, 20px);
  padding: 0 5px;
  margin: 0 -5px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
.comp-ctx-btn:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
@media (hover: hover) {
  .comp-ctx-btn:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}
.comp-ctx-meter,
.dsh-meter-segments {
  position: relative;
  display: inline-block;
  width: 59px;
  height: 6px;
  color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, currentColor 22%, transparent);
  -webkit-mask-image: repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px);
  mask-image: repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px);
}
.dsh-meter-segments.is-ok { color: var(--dsw-alias-state-success-primary); }
.dsh-meter-segments.is-warn { color: var(--dsw-alias-state-warn-primary); }
.dsh-meter-segments.is-err { color: var(--dsw-alias-state-error-primary); }
.comp-ctx-meter > span,
.dsh-meter-segments > span {
  position: absolute;
  inset: 0 auto 0 0;
  width: 23px;
  background: currentColor;
}
.dsh-meter-seg-val {
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-sm, 12px);
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
}

/* Banner (12px inline status banner) */
.dsh-banner-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-banner {
  box-sizing: border-box;
  min-height: var(--dsh-row-md, 44px);
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px 7px 12px;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: .5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-state-business-tertiary);
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.45;
  color: var(--dsw-alias-label-primary);
}
.dsh-banner.is-info { background: var(--dsw-alias-state-business-tertiary); }
.dsh-banner.is-ok { background: var(--dsw-alias-state-success-tertiary); }
.dsh-banner.is-warn { background: var(--dsw-alias-state-warn-tertiary); }
.dsh-banner.is-err,
.dsh-banner.is-error { background: var(--dsw-alias-interactive-bg-hover-danger); }
.dsh-banner-ico {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  font-size: var(--dsh-text-xl, 16px);
}
.dsh-banner.is-info .dsh-banner-ico { color: var(--dsw-alias-state-business-primary); }
.dsh-banner.is-ok .dsh-banner-ico { color: var(--dsh-state-ok-text, var(--dsw-alias-state-success-primary)); }
.dsh-banner.is-warn .dsh-banner-ico { color: var(--dsh-state-warn-text, var(--dsw-alias-state-warn-primary)); }
.dsh-banner.is-err .dsh-banner-ico,
.dsh-banner.is-error .dsh-banner-ico { color: var(--dsw-alias-state-error-primary); }
.dsh-banner-text {
  flex: 1;
  min-width: 0;
}
.dsh-banner-act {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* EmptyState & LoadingState (12px sunken slot) */
.dsh-empty {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  border: 1px dashed var(--dsw-alias-border-l3);
  background: var(--dsh-surface-sunken);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
}
.dsh-empty.dsh-loading {
  border-style: solid;
}
.dsh-empty-ico {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsh-surface-card);
  border: .5px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-tertiary);
  display: grid;
  place-items: center;
  margin-bottom: 2px;
}
.dsh-loading-spin {
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  border: 0;
  color: var(--dsw-alias-state-business-primary);
  margin-bottom: 4px;
}
.dsh-empty-title {
  margin: 0;
  font-size: var(--dsh-text-md, 13px);
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  text-wrap: balance;
}
.dsh-empty-sub {
  margin: 0;
  max-width: 28em;
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
  text-wrap: pretty;
}
.dsh-empty-act {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .dsh-sdot.is-pulse {
    animation: none;
  }
  .dsh-sdot-spin,
  .dsh-loading-spin {
    animation-duration: 1.8s !important;
    animation-iteration-count: infinite !important;
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/Modal.tsx
		/**
		* 统一阻断式模态弹窗（README 06.3）：
		* - 16px (--dsw-radius-lg) + --dsh-corner-shape 双轨曲率 + --dsh-surface-floating 抬升实底 + --dsw-elevation-prominent；
		* - 零模糊纯压暗遮罩 var(--dsw-alias-bg-mask-1)；
		* - 打开期间为 document.body 其余兄弟节点挂 inert 属性锁死背景 Tab 与读屏焦点，关闭时完整复原 inert 并归还焦点至触发元素；
		* - Escape 关闭自动接入 isImeComposing 守卫，防止中文输入法取消候选词时误关弹窗；
		* - 右上角 28px 正圆关闭钮（CloseIcon SVG，零字符图标），底栏统一 28px (sm) 按钮布局（左侧辅助动作 + toolbar 取消 + 最右 primary / danger-solid 主操作）。
		*/
		function Modal({ open, onClose, title, description, warning, closeLabel = "关闭", hideCloseButton = false, closeOnBackdrop = true, closeOnEscape = true, footer, auxiliaryAction, cancelLabel, onCancel, confirmLabel, onConfirm, confirmTone = "primary", confirmDisabled = false, confirmLoading = false, portal = true, overlayClassName, className, style, children, ...rest }) {
			const titleId = (0, react.useId)();
			const descId = (0, react.useId)();
			const overlayRef = (0, react.useRef)(null);
			const dialogRef = (0, react.useRef)(null);
			const onCloseRef = (0, react.useRef)(onClose);
			onCloseRef.current = onClose;
			(0, react.useEffect)(() => {
				if (!open || typeof document === "undefined") return;
				const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
				const overlayEl = overlayRef.current;
				const restored = [];
				if (document.body && overlayEl && overlayEl.parentElement === document.body) for (const sibling of Array.from(document.body.children)) {
					if (sibling === overlayEl || sibling.tagName === "SCRIPT" || sibling.tagName === "STYLE" || sibling.hasAttribute("data-dsh-toast")) continue;
					const inertEl = sibling;
					restored.push({
						el: inertEl,
						hadAttr: inertEl.hasAttribute("inert"),
						prevProp: Boolean(inertEl.inert)
					});
					inertEl.inert = true;
					inertEl.setAttribute("inert", "");
				}
				const dialogEl = dialogRef.current;
				if (dialogEl && (!document.activeElement || !dialogEl.contains(document.activeElement))) (dialogEl.querySelector("[autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled):not(.dsh-modal-close)") ?? dialogEl).focus?.();
				const onKeyDown = (event) => {
					if (!closeOnEscape) return;
					if (event.key !== "Escape") return;
					if (isImeComposing(event)) return;
					event.stopPropagation();
					onCloseRef.current();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
					for (const { el, hadAttr, prevProp } of restored) {
						el.inert = prevProp;
						if (hadAttr) el.setAttribute("inert", "");
						else el.removeAttribute("inert");
					}
					if (previousFocus && previousFocus.isConnected !== false) previousFocus.focus?.();
				};
			}, [open, closeOnEscape]);
			if (!open) return null;
			const renderedFooter = footer !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-modal-foot modal-foot",
				children: footer
			}) : auxiliaryAction !== void 0 || cancelLabel !== void 0 || confirmLabel !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsh-modal-foot modal-foot",
				children: [
					auxiliaryAction !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-modal-aux",
						children: auxiliaryAction
					}),
					cancelLabel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hs-btn hs-btn-toolbar hs-btn-sm",
						onClick: () => (onCancel ?? onClose)(),
						children: cancelLabel
					}),
					confirmLabel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `hs-btn ${confirmTone === "danger" ? "hs-btn-danger-solid" : "hs-btn-primary"} hs-btn-sm${confirmLoading ? " is-loading" : ""}`,
						disabled: confirmDisabled || confirmLoading,
						onClick: onConfirm,
						children: [confirmLoading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "hs-btn-icon",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpinnerIcon, {})
						}), confirmLabel]
					})
				]
			}) : null;
			const a11yLabel = rest["aria-label"] ?? (typeof title === "string" ? title : void 0);
			const overlayNode = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: overlayRef,
				"data-dsh-modal-overlay": "",
				className: `dsh-modal-overlay${overlayClassName ? ` ${overlayClassName}` : ""}`,
				onPointerDown: (event) => {
					if (closeOnBackdrop && event.target === event.currentTarget) onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					...rest,
					ref: dialogRef,
					role: "dialog",
					"aria-modal": "true",
					"aria-label": a11yLabel,
					"aria-labelledby": a11yLabel === void 0 ? titleId : rest["aria-labelledby"],
					"aria-describedby": description !== void 0 ? descId : rest["aria-describedby"],
					tabIndex: -1,
					className: `dsh-modal${className ? ` ${className}` : ""}`,
					style,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-modal-head modal-head",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: titleId,
								className: "dsh-modal-title modal-title",
								children: title
							}), !hideCloseButton && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-modal-close icon-btn-round",
								"aria-label": closeLabel,
								onClick: onClose,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
							})]
						}),
						description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							id: descId,
							className: "dsh-modal-desc modal-desc",
							children: description
						}),
						warning !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "modal-warn-box",
							role: "note",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "modal-warn-ico",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, {})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: warning })]
						}),
						children,
						renderedFooter
					]
				})
			});
			if (portal && typeof document !== "undefined" && Boolean(document.body)) return (0, react_dom.createPortal)(overlayNode, document.body);
			return overlayNode;
		}
		const modalCss = `
@keyframes dsh-dialog-in {
  from { opacity: 0; transform: scale(.97) translateY(4px); }
  to { opacity: 1; transform: none; }
}

/* 零模糊纯压暗遮罩：绝不对全屏聊天区施加高开销 backdrop-filter */
.dsh-modal-overlay,
.live-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsw-alias-bg-mask-1);
  overscroll-behavior: contain;
}
.live-overlay {
  z-index: 150;
  display: none;
}
.live-overlay.is-open {
  display: flex;
}

/* 16px 抬升实底模态框（--dsh-surface-floating + --dsw-elevation-prominent） */
.dsh-modal,
.live-dialog,
.modal-static {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-lg, 16px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: var(--dsh-surface-floating);
  color: var(--dsw-alias-label-primary);
  box-shadow: var(--dsw-elevation-prominent);
  outline: none;
}
.dsh-modal,
.live-dialog {
  width: min(420px, calc(100vw - 32px));
  padding: 20px;
  animation: dsh-dialog-in var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.live-dialog {
  width: min(400px, calc(100vw - 32px));
}
.modal-static {
  width: 100%;
  padding: 18px;
}
.modal-pane[hidden] {
  display: none;
}

/* 浅色模式下弹窗自身已是纯白底，内部胶囊输入框切为微凹底保持层次；深色模式保持深底凹陷 */
.dsh-modal .dsh-input,
.modal-static .dsh-input,
.live-dialog .dsh-input {
  background: var(--dsh-surface-sunken);
}
body[data-ds-dark-theme] .dsh-modal .dsh-input,
body[data-ds-dark-theme] .modal-static .dsh-input,
body[data-ds-dark-theme] .live-dialog .dsh-input,
html[data-theme="dark"] body .dsh-modal .dsh-input,
html[data-theme="dark"] body .modal-static .dsh-input,
html[data-theme="dark"] body .live-dialog .dsh-input {
  background: var(--dsw-alias-bg-base);
}

.dsh-modal-head,
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dsh-modal-title,
.modal-title {
  margin: 0;
  font-size: var(--dsh-text-xl, 16px);
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary);
  text-wrap: balance;
}
.dsh-modal-close {
  all: unset;
  box-sizing: border-box;
  flex: none;
  width: var(--dsh-control-sm, 28px);
  height: var(--dsh-control-sm, 28px);
  border-radius: 50%;
  corner-shape: round;
  display: inline-grid;
  place-items: center;
  font-size: var(--dsh-text-lg, 14px);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    background var(--dsh-dur-hover, 120ms) ease,
    color var(--dsh-dur-hover, 120ms) ease,
    transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-modal-close:active {
  background: var(--dsw-alias-interactive-bg-active);
  transform: scale(.96);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-modal-close:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
@media (hover: hover) {
  .dsh-modal-close:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}

.dsh-modal-desc,
.modal-desc {
  margin: 6px 0 14px;
  font-size: var(--dsh-text-md, 13px);
  line-height: 1.55;
  color: var(--dsw-alias-label-secondary);
  text-wrap: pretty;
}
.modal-warn-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: var(--dsw-radius-md, 12px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: var(--dsw-alias-interactive-bg-hover-danger);
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-text-sm, 12px);
  line-height: 1.5;
}
.modal-warn-ico {
  flex: none;
  margin-top: 1px;
  color: var(--dsw-alias-state-error-primary);
  display: inline-grid;
  place-items: center;
  font-size: var(--dsh-text-xl, 16px);
}
.dsh-modal-foot,
.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.dsh-modal-aux {
  margin-right: auto;
  display: inline-flex;
  align-items: center;
}

/* HoverCard（富内容悬浮预览卡 · 官方 16px 浮层表面，供预览台与退化卡片复用） */
.dsh-hovercard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 640px) {
  .dsh-hovercard-grid {
    grid-template-columns: 1fr;
  }
}
.dsh-hovercard {
  box-sizing: border-box;
  padding: 10px 13px;
  border-radius: var(--dsw-radius-lg, 16px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--dsh-surface-floating);
  color: var(--dsw-alias-label-primary);
  box-shadow: var(--dsw-elevation-panel);
}
.dsh-hovercard.is-clickable {
  cursor: pointer;
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.dsh-hovercard[tabindex]:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
@media (hover: hover) {
  .dsh-hovercard.is-clickable:hover {
    background: color-mix(in srgb, var(--dsh-surface-floating), var(--dsw-alias-label-primary) 4%);
  }
}
.dsh-hc-title {
  font-size: var(--dsh-text-md, 13px);
  font-weight: 500;
  line-height: 1.4;
}
.dsh-hc-sub {
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-xs, 11px);
  line-height: 1.45;
  color: var(--dsw-alias-label-tertiary);
  overflow-wrap: anywhere;
  word-break: normal;
}
@media (prefers-reduced-motion: reduce) {
  .dsh-modal,
  .live-dialog {
    animation: none;
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/Popover.tsx
		function mergeRefs(...refs) {
			return (node) => {
				for (const r of refs) {
					if (!r) continue;
					if (typeof r === "function") r(node);
					else r.current = node;
				}
			};
		}
		const HIDDEN_POS = {
			left: 0,
			top: 0,
			visibility: "hidden"
		};
		(0, react.forwardRef)(function Popover({ open = true, onClose, anchorRef, side = "bottom", align = "start", gap = 6, portal, material = "translucent", origin, searchable, searchValue, defaultSearchValue = "", onSearchChange, onSearchEnter, searchPlaceholder = "搜索…", searchAriaLabel = "搜索列表", clearSearchLabel = "清空搜索", autoFocusSearch = false, categories, activeCategory, defaultCategory, onCategoryChange, categoryAriaLabel = "分类筛选", headerExtra, maxBodyHeight = 280, footer, className, style, children, ...rest }, forwardedRef) {
			const panelRef = (0, react.useRef)(null);
			const searchInputRef = (0, react.useRef)(null);
			const tabsRef = (0, react.useRef)(null);
			const [uncontrolledSearch, setUncontrolledSearch] = (0, react.useState)(defaultSearchValue);
			const resolvedSearch = searchValue !== void 0 ? searchValue : uncontrolledSearch;
			const showSearch = Boolean(searchable) || searchValue !== void 0 || onSearchChange !== void 0;
			const [uncontrolledCat, setUncontrolledCat] = (0, react.useState)(() => defaultCategory ?? categories?.[0]?.id ?? "");
			const resolvedCat = activeCategory !== void 0 ? activeCategory : uncontrolledCat;
			useSlidingIndicator(tabsRef, resolvedCat, {
				itemSelector: ".dsh-pop-tab",
				indicatorClass: "dsh-pop-tabs-ind"
			});
			const isAnchored = anchorRef !== void 0;
			const shouldPortal = portal ?? isAnchored;
			const anchoredPos = useAnchoredPosition({
				open: open && isAnchored,
				anchorRef: anchorRef ?? { current: null },
				panelRef,
				side,
				align,
				gap,
				margin: 12
			});
			(0, react.useEffect)(() => {
				if (!open || !autoFocusSearch || !showSearch) return;
				searchInputRef.current?.focus?.();
			}, [
				open,
				autoFocusSearch,
				showSearch
			]);
			(0, react.useEffect)(() => {
				if (!open || !onClose || typeof document === "undefined") return;
				const onPointerDown = (event) => {
					const target = event.target;
					if (!(target instanceof Node)) return;
					if (panelRef.current?.contains(target) === true) return;
					if (anchorRef?.current?.contains(target) === true) return;
					onClose();
				};
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					if (isImeComposing(event)) return;
					onClose();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [
				open,
				onClose,
				anchorRef
			]);
			if (!open) return null;
			const updateSearch = (next) => {
				if (searchValue === void 0) setUncontrolledSearch(next);
				onSearchChange?.(next);
			};
			const handleSearchKeyDown = (event) => {
				if (isImeComposing(event)) return;
				if (event.key === "Enter") onSearchEnter?.(resolvedSearch);
				else if (event.key === "Escape") if (resolvedSearch.length > 0) {
					event.stopPropagation();
					updateSearch("");
				} else onClose?.();
			};
			const selectCategory = (id) => {
				if (activeCategory === void 0) setUncontrolledCat(id);
				onCategoryChange?.(id);
			};
			const hasTopBar = categories !== void 0 && categories.length > 0 || headerExtra !== void 0;
			const mergedStyle = isAnchored ? {
				...anchoredPos ?? HIDDEN_POS,
				...style
			} : { ...style };
			const surface = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(MenuSurface, {
				...rest,
				ref: mergeRefs(panelRef, forwardedRef),
				material,
				origin,
				"data-side": isAnchored ? side : rest["data-side"],
				"data-align": isAnchored ? align : rest["data-align"],
				className: `dsh-pop${isAnchored ? " dsh-pop-anchored" : ""}${className ? ` ${className}` : ""}`,
				style: mergedStyle,
				children: [
					showSearch && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-pop-search",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-pop-search-ico",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: searchInputRef,
								type: "text",
								className: "dsh-pop-search-input",
								value: resolvedSearch,
								placeholder: searchPlaceholder,
								"aria-label": searchAriaLabel,
								onChange: (e) => updateSearch(e.target.value),
								onKeyDown: handleSearchKeyDown
							}),
							resolvedSearch.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsh-pop-search-clear dsh-search-clear",
								"aria-label": clearSearchLabel,
								onClick: () => {
									updateSearch("");
									searchInputRef.current?.focus?.();
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
							})
						]
					}),
					hasTopBar && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-pop-top",
						children: [categories !== void 0 && categories.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							ref: tabsRef,
							className: "dsh-pop-tabs",
							role: "tablist",
							"aria-label": categoryAriaLabel,
							onKeyDown: (e) => handleRovingKeyDown(e, ".dsh-pop-tab"),
							children: categories.map((cat) => {
								const selected = cat.id === resolvedCat;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									tabIndex: selected ? 0 : -1,
									"aria-selected": selected,
									disabled: cat.disabled,
									className: "dsh-pop-tab",
									onClick: () => selectCategory(cat.id),
									children: cat.label
								}, cat.id);
							})
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), headerExtra !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-pop-extra",
							children: headerExtra
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScrollArea, {
						maxHeight: maxBodyHeight,
						className: "dsh-pop-scroll",
						viewportClassName: "dsh-pop-body",
						children
					}),
					footer !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsh-pop-footer",
						children: footer
					})
				]
			});
			if (shouldPortal && typeof document !== "undefined" && Boolean(document.body)) return (0, react_dom.createPortal)(surface, document.body);
			return surface;
		});
		const popoverCss = `
/* Popover 复合弹出面板（外框 16px - 边距 6px = 列表项 10px 严格同心） */
.dsh-pop {
  --dsh-r-outer: var(--dsw-radius-lg, 16px);
  --dsh-pad: 6px;
  padding: var(--dsh-pad);
  gap: 2px;
}
.dsh-pop-anchored {
  position: fixed;
  z-index: 1100;
  min-width: 240px;
  max-width: min(380px, calc(100vw - 24px));
}

/* 顶栏无框搜索条（严守 1-Border Rule：浮层内不重复画胶囊边框，底线两端留白 8px） */
.dsh-pop-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: var(--dsh-row-sm, 32px);
  padding: 0 6px 5px 8px;
  margin-bottom: 2px;
}
.dsh-pop-search::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  border-top: .5px solid var(--dsw-alias-border-l1);
  pointer-events: none;
}
.dsh-pop-search-ico {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  font-size: var(--dsh-text-lg, 14px);
  color: var(--dsw-alias-label-tertiary);
}
.dsh-pop-search-input {
  all: unset;
  flex: 1;
  min-width: 0;
  font-size: var(--dsh-text-md, 13px);
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
}
.dsh-pop-search-input::placeholder {
  color: var(--dsw-alias-label-tertiary);
}
@media (pointer: coarse) and (max-width: 768px) {
  .dsh-pop-search-input {
    font-size: var(--dsh-text-xl, 16px);
  }
}
.dsh-pop-search-clear {
  all: unset;
  position: relative;
  flex: none;
  width: var(--dsh-control-xs, 20px);
  height: var(--dsh-control-xs, 20px);
  border-radius: 50%;
  corner-shape: round;
  display: grid;
  place-items: center;
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    background var(--dsh-dur-hover, 120ms) ease,
    color var(--dsh-dur-hover, 120ms) ease,
    transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-search-clear::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  corner-shape: round;
}
@media (pointer: coarse) {
  .dsh-pop-search-clear::after {
    inset: -8px;
  }
}
.dsh-pop-search-clear:active {
  transform: scale(.94);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-search-clear:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}

/* 顶栏滑动胶囊分类筛选条 */
.dsh-pop-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  position: relative;
  padding: 0 2px 5px;
  margin-bottom: 2px;
}
.dsh-pop-top::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  border-top: .5px solid var(--dsw-alias-border-l1);
  pointer-events: none;
}
.dsh-pop-extra {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
}
.dsh-pop-tabs {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.dsh-pop-tab {
  all: unset;
  box-sizing: border-box;
  height: calc(var(--dsh-control-sm, 28px) - 4px);
  padding: 0 9px;
  border-radius: 999px;
  corner-shape: round;
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background var(--dsh-dur-hover, 120ms) ease,
    color var(--dsh-dur-hover, 120ms) ease;
}
.dsh-pop-tab:disabled {
  opacity: .4;
  cursor: not-allowed;
}
.dsh-pop-tab:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.dsh-pop-tab[aria-selected="true"],
.dsh-pop-tabs-ind {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-pop-tab[aria-selected="true"] {
  color: var(--dsw-alias-label-primary);
}
.dsh-pop-tabs[data-ind] .dsh-pop-tab[aria-selected="true"] {
  background: transparent;
}
.dsh-pop-tabs-ind {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  height: calc(var(--dsh-control-sm, 28px) - 4px);
  border-radius: 999px;
  corner-shape: round;
  pointer-events: none;
  width: var(--ind-w, 0);
  transform: translateX(var(--ind-x, 0));
  transition:
    transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)),
    width var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-tabs-ind[data-instant] {
  transition: none;
}
.dsh-pop-pin[aria-pressed="true"] {
  color: var(--dsw-alias-state-business-primary);
}

/* ScrollArea 主体列表区 */
.dsh-pop-scroll {
  min-height: 0;
}
.dsh-pop-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* 10px 同心列表行与星标收藏按钮 */
.dsh-pop-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: var(--dsh-row-sm, 32px);
  padding: 4px 8px;
  border-radius: max(0px, calc(var(--dsh-r-outer) - var(--dsh-pad)));
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-size: var(--dsh-text-md, 13px);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
}
.dsh-pop-row.is-selected,
.dsh-pop-row[aria-selected="true"] {
  background: var(--dsw-alias-interactive-bg-active);
}
.dsh-pop-row.is-disabled,
.dsh-pop-row[aria-disabled="true"] {
  opacity: .42;
  cursor: not-allowed;
}
.dsh-pop-row:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.dsh-pop-title {
  font-weight: 500;
}
.dsh-pop-alias {
  flex: none;
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
}
.dsh-pop-desc {
  flex: 0 1 auto;
  min-width: 0;
  margin-left: auto;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
}
.dsh-pop-row > * {
  min-width: 0;
  white-space: nowrap;
}
.dsh-pop-row > span:not(.hs-fb-icon):not(.dsh-pop-alias) {
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-pop-row:has(> .dsh-pop-desc) > span:not(.hs-fb-icon):not(.dsh-pop-alias):not(.dsh-pop-desc) {
  flex: 0 1 auto;
  flex-shrink: 0;
  max-width: 62%;
}

.dsh-pop-star {
  all: unset;
  position: relative;
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  corner-shape: round;
  display: grid;
  place-items: center;
  color: var(--dsw-alias-label-caption);
  font-size: var(--dsh-text-md, 13px);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    background var(--dsh-dur-hover, 120ms) ease,
    color var(--dsh-dur-hover, 120ms) ease,
    transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-star::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  corner-shape: round;
}
@media (pointer: coarse) {
  .dsh-pop-star::after {
    inset: -8px;
  }
}
.dsh-pop-star:active {
  transform: scale(.93);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-star:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.dsh-pop-star[aria-pressed="true"] {
  color: var(--dsw-alias-state-warn-primary);
}

/* 可折叠底部快捷开关组 */
.dsh-pop-group {
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.dsh-pop-group::before {
  content: "";
  display: block;
  margin: 0 8px 3px;
  border-top: .5px solid var(--dsw-alias-border-l2);
}
.dsh-pop-ghead {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 500;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.dsh-pop-ghead:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.dsh-pop-gchev {
  display: inline-flex;
  font-size: var(--dsh-text-2xs, 10px);
  color: var(--dsw-alias-label-tertiary);
  transition: transform var(--dsh-dur-expand, 220ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.dsh-pop-ghead[aria-expanded="false"] .dsh-pop-gchev {
  transform: rotate(-90deg);
}
.dsh-pop-gbody[hidden] {
  display: none;
}

/* 底部快捷键提示底栏 */
.dsh-pop-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px 2px;
  margin-top: 2px;
  font-size: var(--dsh-text-xs, 11px);
  line-height: 1.4;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-pop-footer::before {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  top: 0;
  border-top: .5px solid var(--dsw-alias-border-l1);
  pointer-events: none;
}

@media (hover: hover) {
  .dsh-pop-search-clear:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
  .dsh-pop-tab:not(:disabled):hover {
    color: var(--dsw-alias-label-primary);
  }
  .dsh-pop-row:not(.is-disabled):not([aria-disabled="true"]):hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .dsh-pop-star:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
  }
  .dsh-pop-ghead:hover {
    color: var(--dsw-alias-label-primary);
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/primitives-safe.tsx
		const fallbackCss = `
.hs-fb-anchor {
  position: relative;
  display: inline-flex;
}
.hs-fb-menu {
  position: fixed;
  z-index: 1100;
  box-sizing: border-box;
  min-width: 144px;
  max-width: 360px;
  padding: 4px;
  display: flex;
  flex-direction: column;
}
.hs-fb-heading {
  padding: 6px 8px 3px;
  font-size: var(--dsh-text-xs, 11px);
  line-height: 15px;
  color: var(--dsw-alias-label-tertiary);
}
/* 菜单分割线两端留白 12px（容器 4px 内距 + 8px 缩进），与菜单项文字左缘对齐 */
.hs-fb-sep {
  margin: 3px 8px;
  border-top: .5px solid var(--dsw-alias-border-l2);
  transition: opacity var(--dsh-dur-hover, 120ms) ease;
}
.hs-fb-footer {
  margin-top: 3px;
  display: flex;
  flex-direction: column;
}
.hs-fb-footer::before {
  content: "";
  display: block;
  margin: 0 8px 3px;
  border-top: .5px solid var(--dsw-alias-border-l2);
}
/* 同心菜单项：标准 16px - 4px = 12px；紧凑 12px - 4px = 8px */
.hs-fb-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: var(--dsh-row-sm, 32px);
  padding: 6px 8px;
  border: 0;
  border-radius: max(0px, calc(var(--dsh-r-outer, var(--dsw-radius-lg, 16px)) - var(--dsh-pad, 4px)));
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--dsh-text-md, 13px);
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.hs-msurf-compact .hs-fb-item {
  min-height: var(--dsh-control-sm, 28px);
  padding: 4px 8px;
  font-size: var(--dsh-text-sm, 12px);
  line-height: 18px;
}
.hs-fb-item[aria-selected="true"],
.hs-fb-item[aria-checked="true"] {
  font-weight: 500;
}
.hs-fb-item:disabled {
  opacity: .4;
  cursor: not-allowed;
}
.hs-fb-item:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: -2px;
}
.hs-fb-danger {
  color: var(--dsw-alias-state-error-primary);
}
@media (hover: hover) {
  .hs-fb-item:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .hs-fb-danger:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover-danger);
  }
  .hs-fb-item:hover + .hs-fb-sep,
  .hs-fb-sep:has(+ .hs-fb-item:hover) {
    opacity: 0;
  }
}
.hs-fb-icon {
  width: 15px;
  height: 15px;
  flex: none;
  display: inline-grid;
  place-items: center;
  color: var(--dsw-alias-label-secondary);
}
.hs-fb-danger .hs-fb-icon {
  color: var(--dsw-alias-state-error-primary);
}
.hs-fb-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-fb-kbd {
  flex: none;
  margin-left: auto;
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
}
.hs-fb-danger .hs-fb-kbd {
  color: inherit;
  opacity: .72;
}
.hs-fb-subarrow {
  flex: none;
  margin-left: auto;
  display: inline-grid;
  place-items: center;
  font-size: var(--dsh-text-xs, 11px);
  color: var(--dsw-alias-label-tertiary);
}
.hs-fb-check {
  width: 14px;
  height: 14px;
  flex: none;
  display: inline-grid;
  place-items: center;
  font-size: var(--dsh-text-sm, 12px);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

/* Switch (36x20 胶囊 round + 16px round 滑块 · 关态跟随 --dsw-alias-switch-thumb 防深色黑洞，开态切为反色) */
.hs-fb-switch {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  width: 36px;
  height: 20px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-border-l3);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--dsh-dur-hover, 120ms) ease;
}
.hs-fb-switch[aria-checked="true"] {
  background: var(--dsh-brand-fill, var(--dsw-alias-brand-primary));
}
.hs-fb-switch:disabled {
  opacity: .45;
  cursor: not-allowed;
}
.hs-fb-switch:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-focus-ring-color);
  outline-offset: 2px;
}
.hs-fb-thumb {
  display: block;
  width: var(--dsh-indicator, 16px);
  height: var(--dsh-indicator, 16px);
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-switch-thumb);
  box-shadow: 0 1px 2px rgb(0 0 0 / .14);
  transition:
    transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)),
    background-color var(--dsh-dur-hover, 120ms) ease,
    box-shadow var(--dsh-dur-hover, 120ms) ease;
}
.hs-fb-switch[aria-checked="true"] .hs-fb-thumb {
  background: var(--dsw-alias-label-primary-foreground);
  box-shadow: none;
  transform: translateX(16px);
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/style-sheet.ts
		/**
		* @kewen/dsh-ui 样式挂载与多插件版本仲裁（08.3.5）：
		* - 每个基础原语块以 <style data-dsh-ui="blockName" data-ver="x.y.z" data-refs="n"> 挂载至 document.head；
		* - 同名块已存在时按 semver 比较版本：现存版本 >= 当前版本则复用并递增引用计数，低于当前版本则原地升级内容与版本号并递增引用计数；
		* - 返回幂等卸载函数，仅当 data-refs 归零时移除 <style> 节点，杜绝单插件卸载误删其他插件正在使用的共享样式。
		*/
		const UI_STYLE_VERSION = "0.2.3";
		function parseSemver(version) {
			const parts = (version.trim().replace(/^v/i, "").split("-")[0] ?? "0.0.0").split(".");
			return [
				Number.parseInt(parts[0] ?? "0", 10) || 0,
				Number.parseInt(parts[1] ?? "0", 10) || 0,
				Number.parseInt(parts[2] ?? "0", 10) || 0
			];
		}
		function compareSemver(a, b) {
			const [aMaj, aMin, aPat] = parseSemver(a);
			const [bMaj, bMin, bPat] = parseSemver(b);
			if (aMaj !== bMaj) return aMaj - bMaj;
			if (aMin !== bMin) return aMin - bMin;
			return aPat - bPat;
		}
		function findStyleByAttr(head, attrName, attrVal) {
			if (typeof head.querySelector === "function") {
				const found = head.querySelector(`style[${attrName}="${attrVal}"]`);
				if (found) return found;
			}
			const nodes = head.children ?? head.childNodes ?? [];
			for (let i = 0; i < nodes.length; i += 1) {
				const node = nodes[i];
				if (node && typeof node.tagName === "string" && node.tagName.toLowerCase() === "style" && node.getAttribute?.(attrName) === attrVal) return node;
			}
			return null;
		}
		/**
		* 幂等挂载插件私有样式表并返回卸载清理函数；重复调用只原地更新内容，不重复造节点。
		*/
		function injectPluginStyles(styleId, css) {
			if (typeof document === "undefined" || !document.head) return () => {};
			let style = findStyleByAttr(document.head, "data-plugin-css", styleId);
			if (style === null) {
				style = document.createElement("style");
				style.setAttribute("data-plugin-css", styleId);
				if (style.dataset) style.dataset.pluginCss = styleId;
				document.head.appendChild(style);
			}
			style.textContent = css;
			const owned = style;
			let disposed = false;
			return () => {
				if (disposed) return;
				disposed = true;
				owned.remove();
			};
		}
		/**
		* 按块名与版本号仲裁挂载 @kewen/dsh-ui 共享样式块，带幂等引用计数卸载。
		*/
		function mountUiStyle(blockName, css, version = UI_STYLE_VERSION) {
			if (typeof document === "undefined" || !document.head) return () => {};
			const head = document.head;
			let style = findStyleByAttr(head, "data-dsh-ui", blockName);
			if (style === null) {
				style = document.createElement("style");
				style.setAttribute("data-dsh-ui", blockName);
				style.setAttribute("data-ver", version);
				style.setAttribute("data-refs", "1");
				style.textContent = css;
				head.appendChild(style);
			} else {
				const existingVer = style.getAttribute("data-ver") ?? "0.0.0";
				const prevRefs = Math.max(0, Number.parseInt(style.getAttribute("data-refs") ?? "0", 10) || 0);
				if (compareSemver(existingVer, version) < 0) {
					style.textContent = css;
					style.setAttribute("data-ver", version);
				}
				style.setAttribute("data-refs", String(prevRefs + 1));
			}
			const target = style;
			let disposed = false;
			return () => {
				if (disposed) return;
				disposed = true;
				const currentRefs = Math.max(0, Number.parseInt(target.getAttribute("data-refs") ?? "1", 10) || 0);
				const nextRefs = Math.max(0, currentRefs - 1);
				target.setAttribute("data-refs", String(nextRefs));
				if (nextRefs === 0) target.remove();
			};
		}
		/**
		* 批量挂载多个 @kewen/dsh-ui 共享样式块，返回合并的幂等卸载函数。
		*/
		function mountUiStyles(blocks, version = UI_STYLE_VERSION) {
			const disposers = blocks.map(([blockName, css]) => mountUiStyle(blockName, css, version));
			let disposed = false;
			return () => {
				if (disposed) return;
				disposed = true;
				for (let i = disposers.length - 1; i >= 0; i -= 1) disposers[i]?.();
			};
		}
		//#endregion
		//#region ../packages/dsh-ui/src/Toast.tsx
		const toastCss = `
.hs-toast,
.toast-demo {
  --dsh-r-outer: 18px;
  --dsh-pad: 4px;
  height: var(--dsh-control-md, 36px);
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: min(440px, calc(100vw - 32px));
  padding: 0 14px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-toast-bg);
  color: var(--dsh-toast-fg);
  box-shadow: var(--dsh-toast-shadow);
  font-family: var(--dsw-font-family, inherit);
  font-size: var(--dsh-text-md, 13px);
  font-weight: 500;
  line-height: 1;
}
.toast-demo {
  position: relative;
  max-width: min(440px, 100%);
}
.hs-toast {
  position: fixed;
  top: 40px;
  left: 50%;
  z-index: 1300;
  opacity: 0;
  transform: translate(-50%, -6px);
  pointer-events: none;
  /* 退场只淡出不位移：位移复位延后到淡出结束 */
  transition:
    opacity var(--dsh-dur-pop, 150ms) ease,
    transform 0s linear var(--dsh-dur-pop, 150ms);
}
.hs-toast.hs-toast-on {
  opacity: 1;
  transform: translate(-50%, 0);
  pointer-events: auto;
  transition:
    opacity var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)),
    transform var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-toast.hs-toast-has-act,
.hs-toast:has(> .hs-toast-btn),
.toast-demo:has(> button:not([hidden])) {
  padding-right: var(--dsh-pad);
}
.hs-toast-lead,
.toast-lead {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.hs-toast-msg,
.toast-lead > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs-toast-ico,
.toast-ico {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  font-size: var(--dsh-text-xl, 16px);
}
.hs-toast-ico svg,
.toast-ico .dsh-i {
  stroke-width: 2;
}
.hs-toast-ico.is-ok,
.toast-ico.is-ok {
  color: var(--dsh-toast-ok);
}
.hs-toast-ico.is-warn,
.toast-ico.is-warn {
  color: var(--dsh-toast-warn);
}
.hs-toast-ico.is-err,
.toast-ico.is-err {
  color: var(--dsh-toast-err);
}
.toast-ico[hidden] {
  display: none;
}
/* 28px 同心胶囊按钮（R14 + 4px 边距 = 外框 R18 正圆同心） */
.hs-toast-btn,
.toast-demo button {
  all: unset;
  box-sizing: border-box;
  flex: none;
  height: var(--dsh-control-sm, 28px);
  padding: 0 10px;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsh-toast-btn-bg);
  color: var(--dsh-toast-fg);
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 500;
  line-height: var(--dsh-control-sm, 28px);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    background var(--dsh-dur-hover, 120ms) ease,
    transform var(--dsh-dur-release, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.toast-demo button[hidden] {
  display: none;
}
.hs-toast-btn:active,
.toast-demo button:active {
  transform: scale(.96);
  transition-duration: var(--dsh-dur-press, 60ms);
  transition-timing-function: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-toast-btn:focus-visible,
.toast-demo button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsh-toast-focus-ring, var(--dsh-focus-ring-color));
  outline-offset: -2px;
}
@media (hover: hover) {
  .hs-toast-btn:hover,
  .toast-demo button:hover {
    background: var(--dsh-toast-btn-hover);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hs-toast,
  .hs-toast.hs-toast-on {
    transition: none;
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/tokens.ts
		/**
		* 核心基座样式表（01 色彩表面与待办栏透影共享毛玻璃 + 02 字号/控件尺寸/曲率双轨 + 08 动效/锁帧/拖拽护盾）：
		* - :root 挂载几何、字号与动效标尺（绝不覆写宿主 --dsw-corner-shape）；
		* - html[data-hs-active] 注入 --dsh-corner-shape: round；
		* - body / body[data-ds-dark-theme] 挂载 oklab / oklch 动态派生表面、主色、双轨微底与原版待办栏共享毛玻璃变量（浅 80% / 深 66%、blur(8px) saturate(1.3)、五层精细描边与阴影）。
		*/
		const glassTokensCss = `
:root {
  --dsh-text-2xs: 10px;
  --dsh-text-xs: 11px;
  --dsh-text-sm: 12px;
  --dsh-text-md: 13px;
  --dsh-text-lg: 14px;
  --dsh-text-xl: 16px;
  --dsh-control-xs: 20px;
  --dsh-control-sm: 28px;
  --dsh-control-md: 36px;
  --dsh-control-lg: 44px;
  --dsh-row-sm: 32px;
  --dsh-row-md: 44px;
  --dsh-row-lg: 48px;
  --dsh-indicator: 16px;
  --dsh-row-inset: 14px;
  --dsh-dur-press: 60ms;
  --dsh-dur-hover: 120ms;
  --dsh-dur-release: 150ms;
  --dsh-dur-pop: 150ms;
  --dsh-dur-expand: 220ms;
  --dsh-dur-spin: 800ms;
  --dsh-ease-out: cubic-bezier(.22, 1, .36, 1);
}
html[data-hs-active] {
  --dsh-corner-shape: round;
}
html[data-dsh-theme-switching] *,
html[data-dsh-theme-switching] *::before,
html[data-dsh-theme-switching] *::after {
  transition: none !important;
}
html[data-dsh-dragging],
html[data-dsh-dragging] * {
  user-select: none !important;
}
html[data-dsh-dragging] iframe {
  pointer-events: none !important;
}
body {
  --dsh-control-border: color-mix(in oklab, var(--dsw-alias-label-primary) 44%, transparent);
  --dsh-state-ok-text: color-mix(in oklch, var(--dsw-alias-state-success-primary) 64%, var(--dsw-alias-label-primary));
  --dsh-state-warn-text: color-mix(in oklch, var(--dsw-alias-state-warn-primary) 58%, var(--dsw-alias-label-primary));
  --dsh-surface-canvas: color-mix(in oklab, var(--dsw-alias-bg-module-platform) 78%, var(--dsw-alias-bg-base));
  --dsh-surface-card: var(--dsw-alias-bg-layer-1);
  --dsh-surface-floating: var(--dsw-alias-bg-layer-2);
  --dsh-surface-sunken: color-mix(in oklab, var(--dsw-alias-bg-module-platform) 97%, var(--dsw-alias-label-primary));
  --dsh-menu-surface-fill: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 80%, transparent);
  --dsh-menu-surface-fill-hover: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent);
  --dsh-menu-backdrop-filter: blur(8px) saturate(1.3);
  --dsh-glass-shadow: inset 0 .5px 0 rgb(255 255 255 / .5), inset 0 0 0 .5px rgb(255 255 255 / .7), 0 0 0 .5px rgb(0 0 0 / .07), 0 8px 28px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .05);
  --dsh-glass-shadow-pressed: inset 0 .5px 0 rgb(255 255 255 / .5), inset 0 0 0 .5px rgb(255 255 255 / .7), 0 0 0 .5px rgb(0 0 0 / .07), 0 12px 36px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .05);
  --dsh-glass-inset: inset 0 .5px 0 rgb(255 255 255 / .5), inset 0 0 0 .5px rgb(255 255 255 / .7);
  --dsh-glass-outer: 0 0 0 .5px rgb(0 0 0 / .07), 0 8px 28px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .05);
  --dsh-composer-todo-bg: var(--dsh-menu-surface-fill);
  --dsh-composer-todo-shadow: var(--dsh-glass-shadow);
  --dsh-composer-foot-shadow: 0 1px 2px rgb(255 255 255 / .6);
  --dsh-subtle-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);
  --dsh-subtle-fill-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 4.7%, transparent);
  --dsh-subtle-fill-active: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  --dsh-toolbar-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 4.2%, transparent);
  --dsh-toolbar-fill-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 7.2%, transparent);
  --dsh-toolbar-fill-active: color-mix(in srgb, var(--dsw-alias-label-primary) 10.2%, transparent);
  --dsh-solid-on-color: var(--dsw-alias-label-primary-foreground);
  --dsh-slider-thumb-bg: var(--dsw-alias-switch-thumb, var(--dsw-alias-bg-base));
  --dsh-tooltip-fg: var(--dsh-solid-on-color);
  --dsh-tooltip-kbd-bg: color-mix(in srgb, var(--dsh-tooltip-fg) 16%, transparent);
  --dsh-focus-ring-color: var(--dsw-alias-state-business-primary);
  --dsh-brand-fill: color-mix(in oklab, var(--dsw-alias-label-primary) 85%, var(--dsw-alias-bg-base));
  --dsh-brand-fill-hover: color-mix(in oklab, var(--dsh-brand-fill) 90%, var(--dsw-alias-bg-base));
  --dsh-danger-solid-bg: var(--dsw-alias-state-error-primary);
  --dsh-danger-solid-hover: color-mix(in oklab, var(--dsh-danger-solid-bg) 88%, var(--dsw-alias-label-primary-foreground));
  --dsh-toast-bg: var(--dsh-brand-fill);
  --dsh-toast-fg: var(--dsw-alias-label-primary-foreground);
  --dsh-toast-focus-ring: color-mix(in oklab, var(--dsw-alias-state-business-primary) 68%, var(--dsh-toast-fg));
  --dsh-toast-shadow: inset 0 .5px 0 rgb(255 255 255 / .12), 0 8px 24px -4px rgb(0 0 0 / .22), 0 2px 6px 0 rgb(0 0 0 / .12);
  --dsh-toast-btn-bg: color-mix(in srgb, var(--dsh-toast-fg) 14%, transparent);
  --dsh-toast-btn-hover: color-mix(in srgb, var(--dsh-toast-fg) 22%, transparent);
  --dsh-toast-ok: var(--dsw-alias-state-success-primary);
  --dsh-toast-warn: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 85%, var(--dsh-toast-fg));
  --dsh-toast-err: color-mix(in oklab, var(--dsw-alias-state-error-primary) 74%, var(--dsh-toast-fg));
  --dsh-scrollbar-width: 5px;
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l1);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l1);
}
body[data-ds-dark-theme],
html[data-theme="dark"] body {
  --dsh-control-border: color-mix(in oklab, var(--dsw-alias-label-primary) 44%, transparent);
  --dsh-state-ok-text: color-mix(in oklch, var(--dsw-alias-state-success-primary) 82%, var(--dsw-alias-label-primary));
  --dsh-state-warn-text: color-mix(in oklch, var(--dsw-alias-state-warn-primary) 86%, var(--dsw-alias-label-primary));
  --dsh-surface-canvas: var(--dsw-alias-bg-base);
  --dsh-surface-card: var(--dsw-alias-bg-layer-1);
  --dsh-surface-floating: var(--dsw-alias-bg-layer-2);
  --dsh-surface-sunken: color-mix(in oklab, var(--dsw-alias-bg-base) 72%, var(--dsw-alias-bg-layer-1));
  --dsh-menu-surface-fill: color-mix(in srgb, color-mix(in oklab, var(--dsw-alias-bg-base) 65%, var(--dsw-alias-bg-layer-1)) 66%, transparent);
  --dsh-menu-surface-fill-hover: color-mix(in srgb, color-mix(in oklab, var(--dsw-alias-bg-base) 65%, var(--dsw-alias-bg-layer-1)) 74%, transparent);
  --dsh-menu-backdrop-filter: blur(8px) saturate(1.3);
  --dsh-glass-shadow: inset 0 .5px 0 rgb(255 255 255 / .09), inset 0 0 0 .5px rgb(255 255 255 / .08), 0 0 0 .5px rgb(0 0 0 / .4), 0 8px 28px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .3);
  --dsh-glass-shadow-pressed: inset 0 .5px 0 rgb(255 255 255 / .09), inset 0 0 0 .5px rgb(255 255 255 / .08), 0 0 0 .5px rgb(0 0 0 / .4), 0 12px 36px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .3);
  --dsh-glass-inset: inset 0 .5px 0 rgb(255 255 255 / .09), inset 0 0 0 .5px rgb(255 255 255 / .08);
  --dsh-glass-outer: 0 0 0 .5px rgb(0 0 0 / .4), 0 8px 28px -8px rgb(0 0 0 / .14), 0 1px 3px rgb(0 0 0 / .3);
  --dsh-composer-todo-bg: var(--dsh-menu-surface-fill);
  --dsh-composer-todo-shadow: var(--dsh-glass-shadow);
  --dsh-composer-foot-shadow: 0 1px 2px rgb(0 0 0 / .5);
  --dsh-subtle-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 5.5%, transparent);
  --dsh-subtle-fill-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 7.6%, transparent);
  --dsh-subtle-fill-active: color-mix(in srgb, var(--dsw-alias-label-primary) 9.6%, transparent);
  --dsh-toolbar-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 6.2%, transparent);
  --dsh-toolbar-fill-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 10.5%, transparent);
  --dsh-toolbar-fill-active: color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);
  --dsh-solid-on-color: var(--dsw-alias-label-primary);
  --dsh-slider-thumb-bg: var(--dsw-alias-label-primary);
  --dsh-tooltip-fg: var(--dsh-solid-on-color);
  --dsh-tooltip-kbd-bg: color-mix(in srgb, var(--dsh-tooltip-fg) 16%, transparent);
  --dsh-focus-ring-color: var(--dsw-alias-state-business-primary);
  --dsh-brand-fill: color-mix(in oklab, var(--dsw-alias-label-primary) 93%, var(--dsw-alias-bg-base));
  --dsh-brand-fill-hover: var(--dsw-alias-label-primary);
  --dsh-danger-solid-bg: color-mix(in oklab, var(--dsw-alias-state-error-primary) 82%, var(--dsw-alias-bg-base));
  --dsh-danger-solid-hover: color-mix(in oklab, var(--dsh-danger-solid-bg) 90%, var(--dsw-alias-label-primary));
  --dsh-toast-bg: var(--dsh-brand-fill);
  --dsh-toast-fg: var(--dsw-alias-label-primary-foreground);
  --dsh-toast-focus-ring: color-mix(in oklab, var(--dsw-alias-state-business-primary) 62%, var(--dsh-toast-fg));
  --dsh-toast-shadow: 0 0 0 .5px rgb(255 255 255 / .85), 0 12px 32px -6px rgb(0 0 0 / .58), 0 4px 10px 0 rgb(0 0 0 / .36);
  --dsh-toast-btn-bg: color-mix(in srgb, var(--dsh-toast-fg) 8%, transparent);
  --dsh-toast-btn-hover: color-mix(in srgb, var(--dsh-toast-fg) 15%, transparent);
  --dsh-toast-ok: color-mix(in oklab, var(--dsw-alias-state-success-primary) 68%, var(--dsh-toast-fg));
  --dsh-toast-warn: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 62%, var(--dsh-toast-fg));
  --dsh-toast-err: color-mix(in oklab, var(--dsw-alias-state-error-primary) 78%, var(--dsh-toast-fg));
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l1);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l1);
}
::-webkit-scrollbar {
  width: var(--dsh-scrollbar-width, 5px);
  height: var(--dsh-scrollbar-width, 5px);
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  corner-shape: round;
  border-radius: 999px;
  background: var(--dsh-scrollbar-thumb);
}
@media (hover: hover) {
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--dsh-scrollbar-thumb-hover);
  }
}
.dsh-num {
  font-variant-numeric: tabular-nums;
}
.dsh-break-safe {
  overflow-wrap: anywhere;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
  .dsh-spin,
  .hs-spinner,
  .dsh-sdot-spin,
  .hs-mark.is-spin {
    animation-duration: 1.8s !important;
    animation-iteration-count: infinite !important;
  }
}
html[data-dsh-reduce-motion] *,
html[data-dsh-reduce-motion] *::before,
html[data-dsh-reduce-motion] *::after {
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .01ms !important;
  scroll-behavior: auto !important;
}
html[data-dsh-reduce-motion] .dsh-spin,
html[data-dsh-reduce-motion] .hs-spinner,
html[data-dsh-reduce-motion] .dsh-sdot-spin,
html[data-dsh-reduce-motion] .hs-mark.is-spin {
  animation-duration: 1.8s !important;
  animation-iteration-count: infinite !important;
}
`;
		/**
		* 侧栏与壁纸表面设计 token：
		* 挂在 [data-hs] 根节点上，五阶交互底色由宿主 specific-sidebar-* 经 oklab 同源插值派生；
		* 旧版 --hs-t1~t4 / --hs-card / --hs-line 等语义别名映射至官方与 --dsh-surface-* 变量，清零硬编码灰值同时保持向后兼容。
		*/
		const sidebarTokensCss = `${glassTokensCss}
[data-hs] {
  --hs-rest: color-mix(in oklab, var(--dsw-specific-sidebar-fill) 52%, var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-interactive-bg-hover)));
  --hs-rest-hover: color-mix(in oklab, var(--dsw-specific-sidebar-fill) 22%, var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-interactive-bg-hover)));
  --hs-hover: var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-interactive-bg-hover));
  --hs-press: color-mix(in oklab, var(--dsw-specific-sidebar-nav-item-hover, var(--dsw-alias-interactive-bg-hover)) 45%, var(--dsw-specific-sidebar-nav-item-active, var(--dsw-alias-interactive-bg-active)));
  --hs-sel: var(--dsw-specific-sidebar-nav-item-active, var(--dsw-alias-interactive-bg-active));
  --hs-ctl-fill: color-mix(in oklab, var(--dsw-specific-sidebar-nav-item-active, var(--dsw-alias-interactive-bg-active)) 94%, var(--dsw-alias-label-primary));
  --hs-canvas: var(--dsh-surface-canvas);
  --hs-panel: var(--dsw-specific-sidebar-fill, var(--dsh-surface-canvas));
  --hs-card: var(--dsh-surface-card);
  --hs-line: var(--dsw-alias-border-l2);
  --hs-line-strong: var(--dsw-alias-border-l3);
  --hs-t1: var(--dsw-alias-label-primary);
  --hs-t2: var(--dsw-alias-label-secondary);
  --hs-t3: var(--dsw-alias-label-tertiary);
  --hs-t4: var(--dsw-alias-label-caption);
  --hs-info: var(--dsw-alias-state-business-primary);
  --hs-warn: var(--dsw-alias-state-warn-primary);
  --hs-bad: var(--dsw-alias-state-error-primary);
  --hs-ok: var(--dsw-alias-state-success-primary);
  --hs-sh-pop: var(--dsw-elevation-prominent);
  --hs-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif);
  --hs-r-row: 10px;
  --hs-r-pop: var(--dsw-radius-lg, 16px);
  --hs-ease: var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
  font-family: var(--hs-font);
  font-weight: 400;
  color: var(--dsw-alias-label-primary);
  -webkit-font-smoothing: antialiased;
}
[data-hs-wallpaper] body [data-hs] {
  --hs-rest: color-mix(in srgb, var(--dsw-alias-label-primary) 1.4%, transparent);
  --hs-rest-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, transparent);
  --hs-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 2.6%, transparent);
  --hs-press: color-mix(in srgb, var(--dsw-alias-label-primary) 4.6%, transparent);
  --hs-sel: color-mix(in srgb, var(--dsw-alias-label-primary) 6.2%, transparent);
  --hs-ctl-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
}
[data-hs-wallpaper] body[data-ds-dark-theme] [data-hs],
[data-hs-wallpaper][data-theme="dark"] body [data-hs] {
  --hs-rest: color-mix(in srgb, var(--dsw-alias-label-primary) 2.5%, transparent);
  --hs-rest-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 5.1%, transparent);
  --hs-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 3.8%, transparent);
  --hs-press: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  --hs-sel: color-mix(in srgb, var(--dsw-alias-label-primary) 8.8%, transparent);
  --hs-ctl-fill: color-mix(in srgb, var(--dsw-alias-label-primary) 10.5%, transparent);
}
`;
		/**
		* 全系唯一共享毛玻璃材质常量（1:1 承接原版默认「待办栏」透影磨砂配方）：
		* 输入框单层卡片、待办胶囊、手机顶栏胶囊、MenuSurface 浮层全部共用同一套参数：
		* - 底色：浅色 80% 白底 / 深色 66% L=10% 近黑同源底；
		* - 模糊：blur(8px) saturate(1.3)（透出滚动正文柔和虚影）；
		* - 五层边与投影：顶高光 (.5 / .09) + 内细边 (.7 / .08) + 外暗边 (.07 / .4) + 8px 28px -8px (.14 / .14) + 1px 3px (.05 / .3)。
		*/
		const TODO_GLASS_INSET_FALLBACK = ["inset 0 .5px 0 light-dark(rgb(255 255 255 / .5), rgb(255 255 255 / .09))", "inset 0 0 0 .5px light-dark(rgb(255 255 255 / .7), rgb(255 255 255 / .08))"].join(", ");
		const TODO_GLASS_OUTER_FALLBACK = [
			"0 0 0 .5px light-dark(rgb(0 0 0 / .07), rgb(0 0 0 / .4))",
			"0 8px 28px -8px light-dark(rgb(0 0 0 / .14), rgb(0 0 0 / .14))",
			"0 1px 3px light-dark(rgb(0 0 0 / .05), rgb(0 0 0 / .3))"
		].join(", ");
		const TODO_GLASS_EDGE_FALLBACK = `${TODO_GLASS_INSET_FALLBACK}, ${TODO_GLASS_OUTER_FALLBACK}`;
		`${TODO_GLASS_EDGE_FALLBACK}`, `${TODO_GLASS_INSET_FALLBACK}`, `${TODO_GLASS_OUTER_FALLBACK}`;
		`${TODO_GLASS_EDGE_FALLBACK}`;
		//#endregion
		//#region ../packages/dsh-ui/src/tooltip.ts
		const tooltipCss = `
.hs-tip,
.tip-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: var(--dsw-radius-sm, 8px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: var(--dsw-alias-tooltip-bg);
  color: var(--dsh-tooltip-fg, var(--dsw-alias-label-primary-foreground));
  font-family: var(--dsw-font-family, inherit);
  font-size: var(--dsh-text-sm, 12px);
  font-weight: 400;
  line-height: 1;
  box-shadow: 0 4px 12px rgb(0 0 0 / .18);
  white-space: nowrap;
}
.hs-tip {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  padding: 6px 9px;
  pointer-events: none;
  opacity: 0;
  transform-origin: top center;
  transform: translateY(-2px) scale(.96);
  transition:
    opacity var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1)),
    transform var(--dsh-dur-pop, 150ms) var(--dsh-ease-out, cubic-bezier(.22, 1, .36, 1));
}
.hs-tip.hs-tip-on {
  opacity: 1;
  transform: none;
}
.hs-tip-kbd,
.tip-kbd {
  padding: 2px 5px;
  border-radius: var(--dsw-radius-xs, 4px);
  corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round));
  background: var(--dsh-tooltip-kbd-bg, color-mix(in srgb, currentColor 16%, transparent));
  font-family: var(--ds-font-family-code, monospace);
  font-size: var(--dsh-text-xs, 11px);
  line-height: 1;
}
@media (prefers-reduced-motion: reduce) {
  .hs-tip {
    transition: none;
  }
}
`;
		//#endregion
		//#region ../packages/dsh-ui/src/index.ts
		const sidebarRulesOnlyCss = sidebarTokensCss.startsWith(glassTokensCss) ? sidebarTokensCss.slice(glassTokensCss.length).trim() : sidebarTokensCss;
		[[
			glassTokensCss,
			iconBaseCss,
			buttonCss,
			controlsCss,
			menuSurfaceCss,
			popoverCss,
			modalCss,
			fallbackCss,
			toastCss,
			tooltipCss,
			feedbackCss
		].join("\n"), sidebarRulesOnlyCss].join("\n");
		/**
		* 标准分块清单：供 mountDshUiStyles 按 <style data-dsh-ui="..." data-ver="0.2.0" data-refs="n"> 挂载仲裁。
		*/
		const DSH_UI_STYLE_BLOCKS = [
			["tokens", glassTokensCss],
			["icons", iconBaseCss],
			["button", buttonCss],
			["icon-button", iconButtonCss],
			["inputs", inputsCss],
			["choices", choicesCss],
			["navigation", navigationCss],
			["containers", containersCss],
			["scroll-area", scrollAreaCss],
			["menu-surface", menuSurfaceCss],
			["popover", popoverCss],
			["modal", modalCss],
			["fallback", fallbackCss],
			["toast", toastCss],
			["tooltip", tooltipCss],
			["feedback", feedbackCss]
		];
		/**
		* 按块名、版本号与引用计数一键挂载 @kewen/dsh-ui 共享样式，返回幂等卸载清理函数。
		* 多个插件同时运行时自动复用高版本样式块并累加引用计数，单插件卸载绝不误删其他插件正在使用的基础样式。
		*/
		function mountDshUiStyles(optionsOrBlocks) {
			if (Array.isArray(optionsOrBlocks)) return mountUiStyles(optionsOrBlocks, UI_STYLE_VERSION);
			const opts = optionsOrBlocks ?? {};
			const blocks = [...DSH_UI_STYLE_BLOCKS];
			if (opts.sidebar) blocks.push(["sidebar-tokens", sidebarRulesOnlyCss]);
			return mountUiStyles(blocks, opts.version ?? "0.2.3");
		}
		//#endregion
		//#region src/client/computer.ts
		/**
		* 电脑操控画面的数据（客户端）。目标来自 host 端投影 computerPlusTarget（src/projection.js），
		* 只在 Agent 调 computer_* 工具、参数里明确写了 pid 和 window_id 时才有，不猜。
		*
		* - 回合进行中、面板开着、这一组没收起、页面在前台：<img> 直接播 /computer-plus/stream（MJPEG，10fps）
		* - 回合结束：取一次 /frame 冻结的最后一帧
		* - 看不见就卸掉 <img>，连接一断 host 3 秒后停止取流，菜单栏的录屏图标随之消失
		* - 看着时每 250ms 问一次 /status：虚拟光标位置（窗口内 0～1）、点击计数（出涟漪）、是否在首次编译
		*/
		const COMPUTER_PROJECTION = "computerPlusTarget";
		const BASE = "/computer-plus";
		/** 取流断了多久后重连 */
		const RETRY_MS = 2e3;
		/** 光标轮询间隔（host 端也是 250ms 读一次 cua-driver） */
		const STATUS_POLL_MS = 250;
		/** /status 的 corners 数组或 /frame 的 x-computer-corners 头（"759,759,854,854"）→ Corners；形状不对就当没有 */
		function parseCorners(value) {
			const list = typeof value === "string" ? value.split(",").map(Number) : value;
			if (!Array.isArray(list) || list.length !== 4) return void 0;
			if (!list.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1e4)) return void 0;
			return list;
		}
		const sameCorners = (a, b) => a === b || a !== void 0 && b !== void 0 && a.every((n, i) => n === b[i]);
		/**
		* 按窗口真实圆角裁图片的 clip-path（2026-11-04：截到的窗口圆角外是透明的，JPEG 没有透明，四个角原来是白的）。
		* 辅助程序已经把角铺成窗口边缘的颜色，这里再按半径裁掉，露出框的底色，看起来就是圆角窗口。
		* 图片元素铺满整个框（object-fit: contain），所以先按实际画面区域内缩，再给四个角圆角。
		*/
		function cornerClip(box, area, corners) {
			if (area === void 0 || corners === void 0 || box.w <= 0 || box.h <= 0) return void 0;
			const px = (n) => `${Math.max(0, Math.round(n * 100) / 100)}px`;
			const radius = corners.map((r) => px(r / 1e4 * area.width)).join(" ");
			const right = box.w - area.left - area.width;
			const bottom = box.h - area.top - area.height;
			return `inset(${px(area.top)} ${px(right)} ${px(bottom)} ${px(area.left)} round ${radius})`;
		}
		/** 投影值规整成 ComputerTarget；形状不对就当没有 */
		function asComputerTarget(value) {
			if (value === null || typeof value !== "object") return void 0;
			const v = value;
			if (typeof v.pid !== "number" || typeof v.windowId !== "number" || typeof v.active !== "boolean" || typeof v.at !== "number") return void 0;
			return v;
		}
		const ERRORS = [
			"window-gone",
			"capture-failed",
			"capture-stopped",
			"unsupported",
			"unauthorized"
		];
		const asError = (value) => ERRORS.includes(value) ? value : void 0;
		/** 登录失效（401）、不让看（403）：再请求也一样，停下来 */
		const refused = (status) => status === 401 || status === 403;
		/** 占位区的文字：有画面时不显示 */
		function screenNote(target, frame, preparing = false) {
			if (frame.error === "unauthorized") return "登录已失效，刷新页面后再看画面";
			if (frame.error === "window-gone") return "窗口已关闭";
			if (frame.error === "unsupported") return "当前系统不支持显示画面";
			if (frame.error === "capture-stopped") return "画面中断了（可能是锁屏或停止了录屏），Agent 下一步时再试";
			if (frame.error === "capture-failed") return "截不到画面，请在系统设置里给 DeepSeek Harness 打开屏幕录制权限";
			if (target === void 0) return "Agent 操控电脑时，画面显示在这里";
			if (!target.active) return "本轮没有留下画面";
			if (preparing) return "正在准备画面组件…";
			return "正在获取画面…";
		}
		/** 应用名；没有操控时是「应用」 */
		function appName(target) {
			if (target === void 0) return "应用";
			return target.appName ?? "未知应用";
		}
		/** 状态：暂无 / 操控中 / 已完成 / 已停止 / 出错了 */
		function appStatus(target) {
			if (target === void 0) return "暂无";
			if (target.active) return "操控中";
			if (target.ended === "aborted") return "已停止";
			if (target.ended === "error") return "出错了";
			return "已完成";
		}
		/** 对应 @kewen/dsh-ui StateDot 的五态语义色与旋转环 */
		function statusDotState(target) {
			if (target === void 0) return "idle";
			if (target.active) return "busy";
			if (target.ended === "aborted") return "warn";
			if (target.ended === "error") return "error";
			return "ok";
		}
		/** 面板画面是否叠画虚拟光标与点击涟漪（默认开启，可在扩展设置页开关） */
		const CURSOR_OVERLAY_KEY = "computer-plus:cursor-overlay";
		const cursorOverlayListeners = /* @__PURE__ */ new Set();
		let memoryCursorOverlay = true;
		function webStorage() {
			if (typeof window === "undefined") return void 0;
			try {
				const s = window.localStorage;
				if (s && typeof s.getItem === "function") return s;
			} catch {}
		}
		function getCursorOverlay() {
			const s = webStorage();
			if (!s) return memoryCursorOverlay;
			try {
				return s.getItem(CURSOR_OVERLAY_KEY) !== "0";
			} catch {
				return memoryCursorOverlay;
			}
		}
		function setCursorOverlay(enabled) {
			memoryCursorOverlay = enabled;
			const s = webStorage();
			if (s) try {
				if (enabled) s.removeItem(CURSOR_OVERLAY_KEY);
				else s.setItem(CURSOR_OVERLAY_KEY, "0");
			} catch {}
			for (const listener of cursorOverlayListeners) listener();
		}
		function useCursorOverlay() {
			return (0, react.useSyncExternalStore)((listener) => {
				cursorOverlayListeners.add(listener);
				const onStorage = (event) => {
					if (event.key === null || event.key === "computer-plus:cursor-overlay") listener();
				};
				if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
				return () => {
					cursorOverlayListeners.delete(listener);
					if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
				};
			}, getCursorOverlay, () => true);
		}
		/** 应用图标地址：pid 进 URL，换应用就是新图（host 只给当前目标的图标，pid 对不上回 204、不缓存） */
		const appIconUrl = (sessionId, target) => target === void 0 ? void 0 : `${BASE}/icon?${query(sessionId)}&pid=${target.pid}`;
		/** 画面上要不要叠完成徽标：只有这一轮明确正常完成才叠 */
		const showDoneBadge = (target) => target?.active === false && target.ended === "completed";
		function usePageVisible() {
			const [visible, setVisible] = (0, react.useState)(() => typeof document === "undefined" ? true : !document.hidden);
			(0, react.useEffect)(() => {
				if (typeof document === "undefined") return;
				const sync = () => setVisible(!document.hidden);
				document.addEventListener("visibilitychange", sync);
				return () => document.removeEventListener("visibilitychange", sync);
			}, []);
			return visible;
		}
		const query = (sessionId) => `session=${encodeURIComponent(sessionId)}`;
		const surfaceOf = (target) => target === void 0 ? "" : `${target.pid}:${target.windowId}`;
		/** 这一轮的标记：每次从「已结束」变回「操控中」加一（不用 at：它每一步都变，放进 URL 会让每一步都断流重连） */
		function useTurnKey(active) {
			const [turn, setTurn] = (0, react.useState)(0);
			const was = (0, react.useRef)(active);
			(0, react.useEffect)(() => {
				if (active && !was.current) setTurn((n) => n + 1);
				was.current = active;
			}, [active]);
			return turn;
		}
		/**
		* @param enabled 面板开着且这一组没收起（看不见就不取，不占取流）
		* @returns frame 和 onError（交给 <img>：流断了先问清原因，再过 2 秒重连）
		*/
		function useComputerFrame(sessionId, target, enabled, zoom = false) {
			const [frame, setFrame] = (0, react.useState)({});
			const [attempt, setAttempt] = (0, react.useState)(0);
			const blobUrl = (0, react.useRef)(void 0);
			const visible = usePageVisible();
			const surface = surfaceOf(target);
			const active = target?.active === true;
			(0, react.useEffect)(() => () => {
				if (blobUrl.current !== void 0) URL.revokeObjectURL(blobUrl.current);
				blobUrl.current = void 0;
				setFrame({});
				setAttempt(0);
			}, [sessionId, surface]);
			const streaming = enabled && visible && active && target !== void 0;
			const turn = useTurnKey(active);
			const streamUrl = streaming ? `${BASE}/stream?${query(sessionId)}&s=${encodeURIComponent(surface)}&t=${turn}&n=${attempt}${zoom ? "&edge=zoom" : ""}` : void 0;
			(0, react.useEffect)(() => {
				if (!enabled || target === void 0 || active) return;
				const controller = new AbortController();
				fetch(`${BASE}/frame?${query(sessionId)}`, {
					credentials: "same-origin",
					cache: "no-store",
					signal: controller.signal
				}).then(async (res) => {
					if (res.status === 200) {
						const corners = parseCorners(res.headers.get("x-computer-corners"));
						const next = URL.createObjectURL(await res.blob());
						if (controller.signal.aborted) {
							URL.revokeObjectURL(next);
							return;
						}
						if (blobUrl.current !== void 0) URL.revokeObjectURL(blobUrl.current);
						blobUrl.current = next;
						setFrame(corners === void 0 ? { url: next } : {
							url: next,
							corners
						});
					} else if (res.status === 503) {
						const body = await res.json().catch(() => ({}));
						setFrame((current) => ({
							...current,
							error: asError(body.error) ?? "capture-failed"
						}));
					} else if (refused(res.status)) setFrame((current) => ({
						...current,
						error: "unauthorized"
					}));
				}).catch(() => {});
				return () => controller.abort();
			}, [
				sessionId,
				surface,
				enabled,
				active
			]);
			const retry = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => () => clearTimeout(retry.current), [sessionId, surface]);
			const hasError = (0, react.useRef)(false);
			hasError.current = frame.error !== void 0 && frame.error !== "unauthorized";
			const at = target?.at;
			(0, react.useEffect)(() => {
				if (!hasError.current) return;
				setFrame((current) => ({
					...current,
					error: void 0
				}));
				setAttempt((n) => n + 1);
			}, [at]);
			const onError = () => {
				if (!streaming) return;
				fetch(`${BASE}/frame?${query(sessionId)}`, {
					credentials: "same-origin",
					cache: "no-store"
				}).then(async (res) => {
					if (refused(res.status)) return "unauthorized";
					if (res.status !== 503) return void 0;
					const body = await res.json().catch(() => ({}));
					return asError(body.error) ?? "capture-failed";
				}).catch(() => void 0).then((error) => {
					if (error !== void 0) setFrame((current) => ({
						...current,
						error
					}));
					if (error !== void 0) return;
					clearTimeout(retry.current);
					retry.current = setTimeout(() => {
						setFrame((current) => current.error === void 0 ? current : {
							...current,
							error: void 0
						});
						setAttempt((n) => n + 1);
					}, RETRY_MS);
				});
			};
			if (streamUrl !== void 0) return {
				url: streamUrl,
				...frame.error === void 0 ? {} : { error: frame.error },
				onError
			};
			return {
				...frame,
				url: active ? void 0 : frame.url,
				onError
			};
		}
		/**
		* 光标、点击、首次编译：看着而且这一轮还在进行时，每 250ms 问一次 host（host 只读内存，自己在后台读 cua-driver）。
		* 涟漪按 host 给的点击计数：数字变大一次出一圈（第一次读到的只当基准，不补放旧涟漪）
		*/
		function useComputerStatus(sessionId, target, enabled) {
			const [point, setPoint] = (0, react.useState)(null);
			const [ripple, setRipple] = (0, react.useState)(0);
			const [preparing, setPreparing] = (0, react.useState)(false);
			const [corners, setCorners] = (0, react.useState)(void 0);
			const visible = usePageVisible();
			const surface = surfaceOf(target);
			const active = target?.active === true;
			(0, react.useEffect)(() => {
				setPoint(null);
				setPreparing(false);
			}, [
				sessionId,
				surface,
				active
			]);
			(0, react.useEffect)(() => {
				setCorners(void 0);
			}, [sessionId, surface]);
			const clicks = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (!enabled || !visible || !active) return;
				clicks.current = void 0;
				let stopped = false;
				let timer;
				const controller = new AbortController();
				const tick = () => {
					fetch(`${BASE}/status?${query(sessionId)}`, {
						credentials: "same-origin",
						cache: "no-store",
						signal: controller.signal
					}).then((res) => {
						if (refused(res.status)) stopped = true;
						return res.status === 200 ? res.json() : void 0;
					}).then((body) => {
						if (stopped || body === void 0) return;
						setPreparing(body.preparing === true);
						const next = parseCorners(body.corners);
						if (next !== void 0) setCorners((current) => sameCorners(current, next) ? current : next);
						const p = body.point;
						if (p !== null && typeof p === "object" && typeof p.x === "number" && typeof p.y === "number") {
							const x = p.x;
							const y = p.y;
							setPoint((current) => current?.x === x && current.y === y ? current : {
								x,
								y
							});
						} else setPoint(null);
						if (typeof body.clicks === "number") {
							if (clicks.current !== void 0 && body.clicks > clicks.current) setRipple((n) => n + 1);
							clicks.current = body.clicks;
						}
					}).catch(() => {}).finally(() => {
						if (!stopped) timer = setTimeout(tick, STATUS_POLL_MS);
					});
				};
				tick();
				return () => {
					stopped = true;
					clearTimeout(timer);
					controller.abort();
				};
			}, [
				sessionId,
				surface,
				enabled,
				visible,
				active
			]);
			return {
				point,
				ripple,
				preparing,
				...corners === void 0 ? {} : { corners }
			};
		}
		/** 图片在框里按 object-fit: contain 摆放后的实际区域（光标要按它摆，不是按外框） */
		function contentRect(box, natural) {
			if (natural === void 0 || natural.w <= 0 || natural.h <= 0 || box.w <= 0 || box.h <= 0) return void 0;
			const scale = Math.min(box.w / natural.w, box.h / natural.h);
			const w = natural.w * scale;
			const h = natural.h * scale;
			return {
				left: (box.w - w) / 2,
				top: (box.h - h) / 2,
				width: w,
				height: h
			};
		}
		function useBoxSize(ref) {
			const [size, setSize] = (0, react.useState)({
				w: 0,
				h: 0
			});
			(0, react.useLayoutEffect)(() => {
				const node = ref.current;
				if (node === null) return;
				const measure = () => {
					const w = node.clientWidth;
					const h = node.clientHeight;
					setSize((current) => current.w === w && current.h === h ? current : {
						w,
						h
					});
				};
				measure();
				const observer = new ResizeObserver(measure);
				observer.observe(node);
				return () => observer.disconnect();
			}, [ref]);
			return size;
		}
		//#endregion
		//#region src/client/ComputerScreen.tsx
		/**
		* 「电脑操控」组里的画面：实时画面 + 虚拟光标 + 点击涟漪。
		* 光标在页面里画（不画进截图）：位置按图片在框里 contain 后的实际区域摆，竖窗口两边留白时也对得上。
		* 点画面放大查看：在 DSH 窗口里铺开（不是可拖动的浮窗），Esc 或点空白处关闭；放大时同一条流换成 1600 长边。
		*/
		function ComputerScreen({ sessionId, target, enabled }) {
			const [zoomed, setZoomed] = (0, react.useState)(false);
			const showCursor = useCursorOverlay();
			const status = useComputerStatus(sessionId, target, enabled);
			const frame = useComputerFrame(sessionId, target, enabled, zoomed);
			const showing = frame.url !== void 0 && frame.error === void 0;
			(0, react.useEffect)(() => {
				if (!showing) setZoomed(false);
			}, [showing]);
			if (!showing) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "cp-screen",
				children: screenNote(target, frame, status.preparing)
			});
			const label = `${appName(target)} 的画面`;
			const active = target?.active === true;
			const done = showDoneBadge(target);
			const corners = active ? status.corners : frame.corners ?? status.corners;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
				className: "cp-screen",
				url: frame.url,
				label,
				active,
				done,
				showCursor,
				status,
				corners,
				onError: frame.onError,
				onOpen: () => setZoomed(true)
			}), zoomed && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ZoomView, {
				label,
				onClose: () => setZoomed(false),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Frame, {
					className: "cp-zoom-frame",
					url: frame.url,
					label,
					active,
					done,
					showCursor,
					status,
					corners,
					onError: frame.onError
				})
			}), document.body)] });
		}
		/** 一块画面：图片 + 按实际区域摆的光标。onOpen 有值时整块可点（面板里那块），放大里那块不可点 */
		function Frame({ className, url, label, active, done, showCursor, status, corners, onError, onOpen }) {
			const box = (0, react.useRef)(null);
			const img = (0, react.useRef)(null);
			const [natural, setNatural] = (0, react.useState)(void 0);
			const size = useBoxSize(box);
			(0, react.useLayoutEffect)(() => {
				const node = img.current;
				return () => {
					node?.removeAttribute("src");
				};
			}, []);
			const area = contentRect(size, natural);
			const clip = cornerClip(size, area, corners);
			const open = onOpen === void 0 ? {} : {
				"data-zoomable": "",
				role: "button",
				tabIndex: 0,
				"aria-label": `放大查看${label}`,
				title: "点击放大查看",
				onClick: onOpen,
				onKeyDown: (event) => {
					if (isImeComposing(event)) return;
					if (event.key !== "Enter" && event.key !== " ") return;
					event.preventDefault();
					onOpen();
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: box,
				className,
				"data-has-frame": "",
				"data-frozen": active ? void 0 : "",
				...open,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						ref: img,
						src: url,
						alt: label,
						draggable: false,
						style: clip === void 0 ? void 0 : { clipPath: clip },
						onLoad: (event) => {
							const node = event.currentTarget;
							setNatural((current) => current?.w === node.naturalWidth && current.h === node.naturalHeight ? current : {
								w: node.naturalWidth,
								h: node.naturalHeight
							});
						},
						onError
					}),
					done && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cp-done",
						role: "img",
						"aria-label": "已完成",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {
							size: 13,
							inline: false
						})
					}),
					showCursor && area !== void 0 && status.point !== null && active && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "cp-cursor",
						"aria-hidden": "true",
						style: { transform: `translate(${area.left + status.point.x * area.width}px, ${area.top + status.point.y * area.height}px)` },
						children: [status.ripple > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "cp-ripple" }, status.ripple), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 16 16",
							width: "16",
							height: "16",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 1.5v11.2l3-2.9 2 4.6 2.1-.9-2-4.5h4.2z" })
						})]
					})
				]
			});
		}
		/**
		* 放大层：铺满 DSH 窗口、背景压暗，画面居中按比例放到最大。
		* Esc 在捕获阶段先拦下（并 preventDefault），对话信息面板「按 Esc 收起」看到 defaultPrevented 就不动，只关放大。
		* 挂在 body 下：面板「点外面关」只认主界面里的点击，点放大层不会把面板一起关掉。
		*/
		function ZoomView({ label, onClose, children }) {
			const close = (0, react.useRef)(null);
			const closeRef = (0, react.useRef)(onClose);
			closeRef.current = onClose;
			(0, react.useEffect)(() => {
				const previous = document.activeElement;
				close.current?.focus();
				const onKey = (event) => {
					if (event.key !== "Escape" || isImeComposing(event)) return;
					event.preventDefault();
					event.stopPropagation();
					closeRef.current();
				};
				document.addEventListener("keydown", onKey, true);
				return () => {
					document.removeEventListener("keydown", onKey, true);
					previous?.focus?.();
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cp-zoom",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": label,
				onClick: (event) => {
					if (event.target === event.currentTarget) onClose();
				},
				children: [children, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
					ref: close,
					size: "md",
					className: "cp-zoom-close",
					"aria-label": "关闭放大",
					onClick: onClose,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {
						size: 16,
						inline: false
					})
				})]
			});
		}
		//#endregion
		//#region src/client/ComputerGroup.tsx
		/**
		* 对话信息面板「电脑操控」组的内容：应用行（图标 + 名字 + 状态圆点）和画面。
		* 组的外框（组名、收起箭头）归面板所有（dsh-harness-plus 的 SessionInfo），它声明插槽 COMPUTER_SLOT、
		* 渲染时传进 sessionId、enabled（面板开着且这一组没收起）和 useProjection。
		*/
		const COMPUTER_SLOT = "harness.session-info.computer";
		function ComputerGroup({ sessionId, enabled, useProjection }) {
			const target = asComputerTarget(useProjection?.(COMPUTER_PROJECTION));
			const icon = appIconUrl(sessionId, target);
			const [broken, setBroken] = (0, react.useState)(void 0);
			const name = appName(target);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "hs-info-row hs-info-own cp-app",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-info-ico",
						"aria-hidden": "true",
						children: icon !== void 0 && icon !== broken ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: "cp-app-icon",
							src: icon,
							alt: "",
							width: 16,
							height: 16,
							onError: () => setBroken(icon)
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MonitorIcon, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-info-text cp-app-name",
						title: name,
						children: name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateDot, {
						state: statusDotState(target),
						label: appStatus(target),
						className: "hs-info-note cp-app-status",
						"data-active": target?.active === true || void 0
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ComputerScreen, {
				sessionId,
				target,
				enabled
			})] });
		}
		function MonitorIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: "cp-ic",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "2",
					y: "2.75",
					width: "12",
					height: "8.5",
					rx: "1.75"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.75 13.5h4.5M8 11.25v2.25" })]
			});
		}
		/**
		* 只认电脑操控 Plus 自己的应用访问授权问题；别的提问与审批原样交给宿主默认渲染器。
		*/
		function selectAppApproval(pending) {
			if (pending === null || typeof pending !== "object") return null;
			const p = pending;
			if (p.kind !== "question" || !Array.isArray(p.questions) || p.questions.length !== 1) return null;
			const item = p.questions[0];
			if (item?.id !== "computer-plus-app-access" || item.intent?.kind !== "approval") return null;
			return {
				pending: p,
				item,
				intent: item.intent
			};
		}
		const RISK_COPY = {
			zh: {
				label: "风险提示",
				title: "电脑操控风险提示",
				detail: "智能体只能访问你授权的应用，并在后台读取界面、截图和执行点击输入，不会抢占前台或移动真实鼠标。\n\n即时通讯、网游或金融类应用可能限制自动化操作，请自行评估风险；需要随时中止时，点击对话输入框旁的停止按钮即可。",
				reject: "拒绝",
				always: "始终允许",
				close: "关闭",
				gotIt: "知道了"
			},
			en: {
				label: "Risks",
				title: "Computer control risks",
				detail: "The agent can access only applications you approve, reading and controlling them in the background without stealing focus or moving your cursor.\n\nMessaging, gaming, or financial apps may restrict automation. Proceed at your own risk, or press Stop anytime in DeepSeek Harness.",
				reject: "Deny",
				always: "Always allow",
				close: "Close",
				gotIt: "Got it"
			}
		};
		function pickLang() {
			if (typeof document !== "undefined") {
				const htmlLang = document.documentElement.lang.toLowerCase();
				if (htmlLang.startsWith("en")) return "en";
				if (htmlLang.startsWith("zh")) return "zh";
			}
			if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) return "en";
			return "zh";
		}
		function pickLocalized(map, fallback, lang) {
			if (map === void 0) return fallback;
			return map[lang] ?? map.zh ?? map.en ?? fallback;
		}
		function AppApproval(props) {
			const { matched: { pending, item, intent }, renderFactorySlot } = props;
			const lang = props.lang ?? pickLang();
			const risk = RISK_COPY[lang];
			const title = pickLocalized(intent.display?.question, item.question, lang);
			const description = item.detail === void 0 && intent.display?.detail === void 0 ? void 0 : pickLocalized(intent.display?.detail, item.detail ?? "", lang);
			const allowLabel = pickLocalized(intent.display?.approve, intent.approve, lang);
			const canAnswer = () => {
				if (typeof pending.snapshot !== "function") return true;
				const snap = pending.snapshot();
				return snap.channel !== "none" && !snap.closed;
			};
			const send = (choice) => pending.answer({ answers: [{
				id: item.id,
				selected: [choice]
			}] });
			if (typeof renderFactorySlot === "function") return renderFactorySlot("conversation.approval.card", {
				requestKey: pending.key,
				warning: {
					label: risk.label,
					title: risk.title,
					detail: risk.detail
				},
				title,
				...description === void 0 ? {} : { description },
				...intent.subject === void 0 ? {} : { subject: intent.subject },
				allowLabel,
				canAnswer,
				onAllow: () => send(intent.approve),
				onReject: () => send(intent.reject),
				...intent.always === void 0 ? {} : { onAlways: () => send(intent.always) }
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FallbackApprovalCard, {
				subject: intent.subject,
				title,
				description,
				allowLabel,
				rejectLabel: risk.reject,
				alwaysLabel: intent.always === void 0 ? void 0 : risk.always,
				risk,
				canAnswer,
				onAllow: () => send(intent.approve),
				onReject: () => send(intent.reject),
				onAlways: intent.always === void 0 ? void 0 : () => send(intent.always)
			});
		}
		function FallbackApprovalCard(props) {
			const [busyChoice, setBusyChoice] = (0, react.useState)(null);
			const [riskOpen, setRiskOpen] = (0, react.useState)(false);
			const busy = busyChoice !== null;
			const choose = (choice, fn) => {
				if (busy || !props.canAnswer()) return;
				setBusyChoice(choice);
				fn().catch(() => setBusyChoice(null));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cp-approval-fallback",
				role: "region",
				"aria-label": props.title,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
					className: "cp-approval-card",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cp-approval-head",
							children: [props.subject ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cp-approval-subject",
								children: [props.subject.icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
									className: "cp-approval-icon",
									src: props.subject.icon,
									alt: "",
									width: 32,
									height: 32,
									draggable: false
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: props.subject.name })]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "cp-approval-risk-btn",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WarnIcon, {
									size: 14,
									inline: false
								}),
								onClick: () => setRiskOpen(true),
								children: props.risk.label
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "cp-approval-title",
							children: props.title
						}),
						props.description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "cp-approval-desc",
							children: props.description
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cp-approval-actions",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "danger-ghost",
									loading: busyChoice === "reject",
									disabled: busy,
									onClick: () => choose("reject", props.onReject),
									children: props.rejectLabel
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: props.onAlways ? "toolbar" : "primary",
									loading: busyChoice === "allow",
									disabled: busy,
									onClick: () => choose("allow", props.onAllow),
									children: props.allowLabel
								}),
								props.onAlways && props.alwaysLabel && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "primary",
									loading: busyChoice === "always",
									disabled: busy,
									onClick: () => choose("always", props.onAlways),
									children: props.alwaysLabel
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal, {
					open: riskOpen,
					onClose: () => setRiskOpen(false),
					title: props.risk.title,
					closeLabel: props.risk.close,
					confirmLabel: props.risk.gotIt,
					onConfirm: () => setRiskOpen(false),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cp-approval-risk-copy",
						children: props.risk.detail
					})
				})]
			});
		}
		//#endregion
		//#region src/client/SettingsPanel.tsx
		const INSTALL_SNIPPET = "curl -fsSL https://cua.ai/driver/install.sh | /bin/bash";
		const COPY = {
			zh: {
				envTitle: "环境与系统权限",
				envHint: "日常操作在后台静默完成，仅借用前台时亮起屏幕顶部状态胶囊。建议与官方实验性「Computer Use」二选一开启，避免双倍消耗 Token 与通道混淆。",
				unsupported: "电脑操控 Plus 目前仅支持 macOS。",
				driverTitle: "底层驱动 cua-driver",
				driverReadyDesc: "负责后台读取无障碍控件树、窗口截图与注入点击输入。",
				driverMissingDesc: "未检测到 cua-driver。点击右侧按钮自动安装至 /Applications/CuaDriver.app 与 ~/.local/bin，或在终端运行下方命令：",
				installBtn: "一键安装",
				installingBtn: "正在安装…",
				installedBadge: "已安装",
				copyCmd: "复制命令",
				copiedCmd: "已复制",
				a11yTitle: "辅助功能",
				a11yBefore: "在系统设置中允许 ",
				a11yAfter: " 在后台读取界面控件、点击和输入文字。",
				driverScreenTitle: "屏幕录制（窗口观察）",
				driverScreenBefore: "在系统设置中允许 ",
				driverScreenAfter: " 截取目标应用窗口供智能体识别。",
				hostScreenTitle: "屏幕录制（面板实时画面 · 可选）",
				hostScreenBefore: "配合 Harness Plus 信息面板时，允许 ",
				hostScreenAfter: " 实时显示操控画面；未安装该面板可跳过，不影响电脑操控。",
				cursorTitle: "实时画面光标与点击涟漪",
				cursorDesc: "在对话信息面板的实时画面上叠画后台虚拟光标位置与点击涟漪动画。",
				requestBtn: "申请权限",
				grantedBtn: "已允许",
				unknownBtn: "打开系统设置",
				waitDriverBtn: "需先安装驱动",
				appsTitle: "管理可访问的应用",
				appsHint: "智能体首次启动或操控某个应用前会向你询问授权；撤销后立即中止对该应用的操控。",
				loadingApps: "正在读取应用授权列表…",
				noApps: "暂无「始终允许」或「不允许访问」的应用",
				allowedGroup: "始终允许的应用",
				blockedGroup: "不允许访问的应用",
				allowedBadge: "始终允许",
				blockedBadge: "已拒绝",
				revokeBtn: "撤销",
				revokeModalTitle: "撤销应用访问权限？",
				revokeModalDesc: (name) => `撤销后将立即中止正在对「${name}」执行的后台操控，下次访问时需重新向你询问授权。`,
				cancelBtn: "取消",
				closeBtn: "关闭",
				retryApprovalBtn: "允许再次询问",
				refreshBtn: "重新检测",
				noticeRevoked: "已撤销该应用的访问权限",
				noticeRetryAllowed: "已清除拒绝记录，下次访问该应用时将重新询问",
				noticeRequested: "若未弹出系统授权框，请在刚打开的「系统设置」列表中打开对应开关",
				noticeInstalled: "cua-driver 安装完成，请继续授予下方系统权限"
			},
			en: {
				envTitle: "Environment & System Permissions",
				envHint: "Runs silently in the background by default and shows a top status capsule only when borrowing the foreground. Enable either this plugin or experimental Computer Use—not both—to avoid duplicate token usage.",
				unsupported: "Computer Plus is currently supported on macOS only.",
				driverTitle: "cua-driver Runtime",
				driverReadyDesc: "Provides background accessibility inspection, window screenshots, and input delivery.",
				driverMissingDesc: "cua-driver was not found. Click Install to run the official installer, or run this command in Terminal:",
				installBtn: "Install cua-driver",
				installingBtn: "Installing…",
				installedBadge: "Installed",
				copyCmd: "Copy",
				copiedCmd: "Copied",
				a11yTitle: "Accessibility",
				a11yBefore: "In System Settings, allow ",
				a11yAfter: " to read controls, click, and type in the background.",
				driverScreenTitle: "Screen Recording (Agent Observation)",
				driverScreenBefore: "In System Settings, allow ",
				driverScreenAfter: " to capture target application windows.",
				hostScreenTitle: "Screen Recording (Panel Preview · Optional)",
				hostScreenBefore: "When paired with the Harness Plus info panel, allow ",
				hostScreenAfter: " to stream live previews. Safe to skip if not installed.",
				cursorTitle: "Live cursor & click ripples",
				cursorDesc: "Overlay the virtual cursor position and click ripples on live panel previews.",
				requestBtn: "Request permission",
				grantedBtn: "Allowed",
				unknownBtn: "System Settings",
				waitDriverBtn: "Install driver first",
				appsTitle: "Application Access",
				appsHint: "Computer Plus asks before launching or controlling each application. Revoking access immediately stops active operations on that app.",
				loadingApps: "Loading application permissions…",
				noApps: "No always-allowed or blocked applications yet",
				allowedGroup: "Always-allowed applications",
				blockedGroup: "Blocked applications",
				allowedBadge: "Allowed",
				blockedBadge: "Blocked",
				revokeBtn: "Revoke",
				revokeModalTitle: "Revoke application access?",
				revokeModalDesc: (name) => `Active background operations on "${name}" will stop immediately, and Computer Plus will ask again next time.`,
				cancelBtn: "Cancel",
				closeBtn: "Close",
				retryApprovalBtn: "Allow asking again",
				refreshBtn: "Check again",
				noticeRevoked: "Application access revoked",
				noticeRetryAllowed: "The next attempt on this application will ask again",
				noticeRequested: "Follow the toggle in System Settings to finish granting access",
				noticeInstalled: "cua-driver installed; grant Accessibility and Screen Recording below"
			}
		};
		function detectLang(explicit) {
			if (explicit) return explicit;
			if (typeof document !== "undefined") {
				const htmlLang = document.documentElement.lang.toLowerCase();
				if (htmlLang.startsWith("en")) return "en";
				if (htmlLang.startsWith("zh")) return "zh";
			}
			if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) return "en";
			return "zh";
		}
		async function postJson(path, body) {
			const res = await fetch(`${BASE}${path}`, {
				method: "POST",
				credentials: "same-origin",
				cache: "no-store",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : `HTTP ${res.status}`);
			return data;
		}
		function permStateDot(granted, ready = true) {
			if (!ready || granted === null || granted === void 0) return "idle";
			return granted ? "ok" : "warn";
		}
		function AppBadge({ name, icon, version }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "cp-cfg-badge",
				children: [
					icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: icon,
						alt: "",
						width: 16,
						height: 16,
						draggable: false
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: name }),
					version && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "cp-cfg-ver",
						children: ["v", version]
					})
				]
			});
		}
		function GearIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: "cp-cfg-gear",
				viewBox: "0 0 16 16",
				width: 13,
				height: 13,
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.2 8a5.2 5.2 0 0 0-.08-.88l1.28-1-.95-1.64-1.52.5a5.3 5.3 0 0 0-1.52-.88l-.28-1.6h-1.9l-.28 1.6c-.55.2-1.06.5-1.52.88l-1.52-.5-.95 1.64 1.28 1a5.3 5.3 0 0 0 0 1.76l-1.28 1 .95 1.64 1.52-.5c.46.38.97.68 1.52.88l.28 1.6h1.9l.28-1.6c.55-.2 1.06-.5 1.52-.88l1.52.5.95-1.64-1.28-1c.05-.29.08-.58.08-.88Z" })]
			});
		}
		function SettingsPanel({ view = "page", lang: propLang }) {
			const lang = detectLang(propLang);
			const t = COPY[lang];
			const cursorOverlay = useCursorOverlay();
			const [setup, setSetup] = (0, react.useState)(null);
			const [perms, setPerms] = (0, react.useState)(null);
			const [busyKey, setBusyKey] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [copied, setCopied] = (0, react.useState)(false);
			const [revokeTarget, setRevokeTarget] = (0, react.useState)(null);
			const mounted = (0, react.useRef)(true);
			const refresh = (0, react.useCallback)(async () => {
				try {
					const [sRes, pRes] = await Promise.all([fetch(`${BASE}/setup`, {
						credentials: "same-origin",
						cache: "no-store"
					}), fetch(`${BASE}/permissions`, {
						credentials: "same-origin",
						cache: "no-store"
					})]);
					if (!mounted.current) return;
					if (sRes.ok) setSetup(await sRes.json());
					if (pRes.ok) setPerms(await pRes.json());
					if (sRes.ok && pRes.ok) setError(null);
				} catch (err) {
					if (mounted.current) setError(err instanceof Error ? err.message : String(err));
				}
			}, []);
			(0, react.useEffect)(() => {
				mounted.current = true;
				if (view !== "page") return () => {
					mounted.current = false;
				};
				refresh();
				const onFocus = () => {
					refresh();
				};
				window.addEventListener("focus", onFocus);
				return () => {
					mounted.current = false;
					window.removeEventListener("focus", onFocus);
				};
			}, [view, refresh]);
			if (view === "summary") return null;
			const runAction = async (key, work, okNote) => {
				if (busyKey !== null) return;
				setBusyKey(key);
				setError(null);
				setNotice(null);
				try {
					await work();
					if (mounted.current && okNote) setNotice(okNote);
				} catch (err) {
					if (mounted.current) setError(err instanceof Error ? err.message : String(err));
				} finally {
					if (mounted.current) setBusyKey(null);
				}
			};
			const copyCommand = () => {
				if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(INSTALL_SNIPPET).then(() => {
					setCopied(true);
					setTimeout(() => {
						if (mounted.current) setCopied(false);
					}, 1800);
				}).catch(() => {});
			};
			if (setup !== null && !setup.supported) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "cp-cfg",
				"data-computer-plus-settings": "",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Banner, {
					tone: "warn",
					children: t.unsupported
				})
			});
			const driverInstalled = setup?.driver.installed === true;
			const installing = setup?.driver.installing === true || busyKey === "install";
			const driverName = setup?.driver.name ?? "CuaDriver";
			const hostName = setup?.host.name ?? "DeepSeek Harness";
			const renderPermButton = (key, granted, needDriver, target, pane) => {
				if (setup === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "cp-cfg-skeleton",
					"aria-hidden": "true"
				});
				if (needDriver && !driverInstalled) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "toolbar",
					className: "cp-cfg-action",
					disabled: true,
					children: t.waitDriverBtn
				});
				if (granted === false) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "primary",
					className: "cp-cfg-action",
					loading: busyKey === key,
					disabled: busyKey !== null,
					onClick: () => void runAction(key, async () => {
						setSetup(await postJson("/setup", {
							action: "request-permission",
							target
						}));
					}, t.noticeRequested),
					children: t.requestBtn
				});
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "toolbar",
					className: "cp-cfg-action",
					"data-granted": granted === true ? "" : void 0,
					loading: busyKey === key,
					disabled: busyKey !== null,
					icon: granted === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {
						size: 13,
						inline: false
					}) : void 0,
					trailingIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GearIcon, {}),
					onClick: () => void runAction(key, async () => {
						setSetup(await postJson("/setup", {
							action: "open-settings",
							pane
						}));
					}),
					children: granted === true ? t.grantedBtn : t.unknownBtn
				});
			};
			const confirmRevoke = () => {
				if (revokeTarget === null) return;
				const targetApp = revokeTarget;
				runAction(`revoke:${targetApp.id}`, async () => {
					setPerms(await postJson("/permissions", {
						action: "revoke",
						id: targetApp.id
					}));
					if (mounted.current) setRevokeTarget(null);
				}, t.noticeRevoked);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cp-cfg",
				"data-computer-plus-settings": "",
				"aria-busy": busyKey !== null || setup === null,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "cp-cfg-section",
						"aria-label": t.envTitle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cp-cfg-head",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t.envTitle }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "toolbar",
									disabled: busyKey !== null,
									onClick: () => void refresh(),
									children: t.refreshBtn
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(CardRow, {
									title: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cp-cfg-row-title",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateDot, { state: setup === null ? "idle" : driverInstalled ? "ok" : "warn" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.driverTitle }),
											driverInstalled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
												name: driverName,
												icon: setup?.driver.icon,
												version: setup?.driver.version
											})
										]
									}),
									description: driverInstalled ? t.driverReadyDesc : t.driverMissingDesc,
									action: setup === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "cp-cfg-skeleton",
										"aria-hidden": "true"
									}) : driverInstalled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
										variant: "ok",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {
											size: 12,
											inline: false
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.installedBadge })]
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "primary",
										className: "cp-cfg-action",
										loading: installing,
										disabled: busyKey !== null,
										onClick: () => void runAction("install", async () => {
											setSetup(await postJson("/setup", { action: "install-driver" }));
										}, t.noticeInstalled),
										children: installing ? t.installingBtn : t.installBtn
									}),
									children: [setup !== null && !driverInstalled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cp-cfg-cmd",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: INSTALL_SNIPPET }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "toolbar",
											onClick: copyCommand,
											children: copied ? t.copiedCmd : t.copyCmd
										})]
									}), setup?.driver.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "cp-cfg-err",
										children: setup.driver.error
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									title: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cp-cfg-row-title",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateDot, { state: permStateDot(setup?.driver.accessibility, driverInstalled) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.a11yTitle })]
									}),
									description: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										t.a11yBefore,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
											name: driverName,
											icon: setup?.driver.icon
										}),
										t.a11yAfter
									] }),
									action: renderPermButton("a11y", setup?.driver.accessibility, true, "driver-accessibility", "accessibility")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									title: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cp-cfg-row-title",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateDot, { state: permStateDot(setup?.driver.screenRecording, driverInstalled) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.driverScreenTitle })]
									}),
									description: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										t.driverScreenBefore,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
											name: driverName,
											icon: setup?.driver.icon
										}),
										t.driverScreenAfter
									] }),
									action: renderPermButton("driver-screen", setup?.driver.screenRecording, true, "driver-screen", "screenRecording")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									title: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cp-cfg-row-title",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateDot, { state: permStateDot(setup?.host.screenRecording) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.hostScreenTitle })]
									}),
									description: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										t.hostScreenBefore,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
											name: hostName,
											icon: setup?.host.icon
										}),
										t.hostScreenAfter
									] }),
									action: renderPermButton("host-screen", setup?.host.screenRecording, false, "host-screen", "screenRecording")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									title: t.cursorTitle,
									description: t.cursorDesc,
									action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StandaloneSwitch, {
										checked: cursorOverlay,
										onChange: setCursorOverlay,
										label: t.cursorTitle
									})
								})
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "cp-cfg-hint",
								children: t.envHint
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "cp-cfg-section",
						"aria-label": t.appsTitle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t.appsTitle }), perms === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoadingState, { title: t.loadingApps }) : perms.allowedApps.length === 0 && perms.blockedApps.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
							title: t.noApps,
							description: t.appsHint
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cp-cfg-groups",
							children: [
								perms.allowedApps.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppListGroup, {
									title: t.allowedGroup,
									badgeText: t.allowedBadge,
									badgeVariant: "ok",
									apps: perms.allowedApps,
									icons: perms.icons,
									actionLabel: t.revokeBtn,
									actionVariant: "danger-ghost",
									busyKey,
									actionPrefix: "revoke",
									onAction: (app) => setRevokeTarget(app)
								}),
								perms.blockedApps.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppListGroup, {
									title: t.blockedGroup,
									badgeText: t.blockedBadge,
									badgeVariant: "subtle",
									apps: perms.blockedApps,
									icons: perms.icons,
									actionLabel: t.retryApprovalBtn,
									actionVariant: "toolbar",
									busyKey,
									actionPrefix: "retry",
									onAction: (app) => void runAction(`retry:${app.id}`, async () => {
										setPerms(await postJson("/permissions", {
											action: "retry",
											id: app.id
										}));
									}, t.noticeRetryAllowed)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cp-cfg-hint",
									children: t.appsHint
								})
							]
						})]
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Banner, {
						tone: "info",
						children: notice
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Banner, {
						tone: "error",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal, {
						open: revokeTarget !== null,
						onClose: () => {
							if (busyKey === null) setRevokeTarget(null);
						},
						title: t.revokeModalTitle,
						description: revokeTarget ? t.revokeModalDesc(revokeTarget.name) : void 0,
						closeLabel: t.closeBtn,
						cancelLabel: t.cancelBtn,
						confirmLabel: t.revokeBtn,
						confirmTone: "danger",
						confirmLoading: busyKey?.startsWith("revoke:") === true,
						confirmDisabled: busyKey !== null,
						onConfirm: confirmRevoke
					})
				]
			});
		}
		function AppListGroup({ title, badgeText, badgeVariant, apps, icons, actionLabel, actionVariant, busyKey, actionPrefix, onAction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cp-cfg-group",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					className: "cp-cfg-subhead",
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, { children: apps.map((app) => {
					const subtitle = app.bundleId ?? app.bundlePath ?? app.executablePath;
					const rowBusy = busyKey === `${actionPrefix}:${app.id}`;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
						title: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "cp-cfg-app",
							title: app.bundlePath ?? app.bundleId ?? app.executablePath,
							children: [icons[app.id] ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								className: "cp-cfg-app-icon",
								src: icons[app.id],
								alt: "",
								width: 28,
								height: 28,
								draggable: false
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "cp-cfg-app-ph",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "cp-cfg-app-meta",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "cp-cfg-app-name-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: app.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
										variant: badgeVariant,
										children: badgeText
									})]
								}), subtitle && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "cp-cfg-app-id",
									children: subtitle
								})]
							})]
						}),
						action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: actionVariant,
							loading: rowBusy,
							disabled: busyKey !== null,
							onClick: () => onAction(app),
							children: actionLabel
						})
					}, app.id);
				}) })]
			});
		}
		//#endregion
		//#region src/client/computer.css.ts
		/**
		* 电脑操控 Plus 客户端样式（基于 @kewen/dsh-ui v0.2.0 语义表面、单阶差与曲率双轨联动）：
		* - 对话信息面板行（.hs-info-row / .hs-info-ico / .hs-info-text / .hs-info-note）复用 dsh-harness-plus 面板骨架；
		* - 圆角矩形统一配对 corner-shape: var(--dsh-corner-shape, var(--dsw-corner-shape, round))，随 Harness Plus 开启/关闭在标准同心圆弧与宿主超椭圆间实时联动；
		* - 正圆（50%）与全圆弧胶囊（999px）永久锁定 corner-shape: round；
		* - 所有 UI 色彩严走 --dsw-alias-* / --dsh-* 语义变量，100% :hover 包裹于 @media (hover: hover)。
		*/
		const computerCss = `
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
/* 有画面：图片按原比例放进 16:10 的框里（竖窗口两边留底色），不裁不拉伸；框是光标的定位参照 */
.cp-screen[data-has-frame] {
  position: relative;
  padding: 0;
  overflow: hidden;
}
.cp-screen[data-has-frame] > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
/* 回合结束后冻结的最后一帧：稍微压暗，和正在操控的画面区分开 */
.cp-screen[data-frozen] > img {
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
  animation: cp-pulse 1.3s ease-in-out infinite;
}
@keyframes cp-pulse {
  0%, 100% { opacity: .55; }
  50% { opacity: 1; }
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
  .cp-done, .cp-zoom, .cp-cfg-skeleton { animation: none; }
}
`;
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots"];
		const PLUGIN_ID = "@kewen/dsh-computer-plus";
		const noopSubscribe = () => () => {};
		function useHostLang(ctx) {
			const locale = ctx.get?.("locale");
			const active = (0, react.useSyncExternalStore)(typeof locale?.subscribe === "function" ? (cb) => locale.subscribe(cb) : noopSubscribe, () => typeof locale?.getSnapshot === "function" ? locale.getSnapshot()?.active : void 0, () => void 0);
			if (typeof active !== "string") return void 0;
			if (active.toLowerCase().startsWith("en")) return "en";
			if (active.toLowerCase().startsWith("zh")) return "zh";
		}
		/**
		* 挂载 @kewen/dsh-ui 共享样式块（引用计数 + 版本仲裁）与本插件私有样式，返回幂等卸载清理函数。
		*/
		function injectStyles() {
			const disposeUi = mountDshUiStyles();
			const disposePlugin = injectPluginStyles(PLUGIN_ID, computerCss);
			let disposed = false;
			return () => {
				if (disposed) return;
				disposed = true;
				disposePlugin();
				disposeUi();
			};
		}
		function apply(ctx) {
			ctx.effect(() => injectStyles(), "computer-plus: styles");
			const slots = ctx.get("slots");
			const BoundSettings = (props) => (0, react.createElement)(SettingsPanel, {
				...props,
				lang: useHostLang(ctx)
			});
			const BoundApproval = (props) => (0, react.createElement)(AppApproval, {
				...props,
				lang: useHostLang(ctx)
			});
			slots.inject(COMPUTER_SLOT, () => slots.register({
				name: COMPUTER_SLOT,
				id: "computer-plus"
			}, ComputerGroup));
			slots.inject("plugins.bundle.config", () => slots.register({
				name: "plugins.bundle.config",
				key: PLUGIN_ID
			}, BoundSettings));
			slots.inject("conversation.composer", () => slots.register({
				name: "conversation.composer",
				id: `${PLUGIN_ID}:app-approval`,
				priority: -1,
				select: ({ pendingInteraction }) => selectAppApproval(pendingInteraction)
			}, BoundApproval));
		}
		//#endregion
		exports.PLUGIN_ID = PLUGIN_ID;
		exports.apply = apply;
		exports.inject = inject;
		exports.injectStyles = injectStyles;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map