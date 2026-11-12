window.__ModuleLoader__.load({
	id: "@kewen/dsh-computer-plus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		/** 应用图标地址：pid 进 URL，换应用就是新图（host 只给当前目标的图标，pid 对不上回 204、不缓存） */
		const appIconUrl = (sessionId, target) => target === void 0 ? void 0 : `${BASE}/icon?${query(sessionId)}&pid=${target.pid}`;
		/** 画面上要不要叠完成徽标：只有这一轮明确正常完成才叠 */
		const showDoneBadge = (target) => target?.active === false && target.ended === "completed";
		function usePageVisible() {
			const [visible, setVisible] = (0, react.useState)(() => !document.hidden);
			(0, react.useEffect)(() => {
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
					status,
					corners,
					onError: frame.onError
				})
			}), document.body)] });
		}
		/** 一块画面：图片 + 按实际区域摆的光标。onOpen 有值时整块可点（面板里那块），放大里那块不可点 */
		function Frame({ className, url, label, active, done, status, corners, onError, onOpen }) {
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
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.6 10.4l2.9 2.9 5.9-6.2" })
						})
					}),
					area !== void 0 && status.point !== null && active && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
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
					if (event.key !== "Escape") return;
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
				children: [children, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					ref: close,
					type: "button",
					className: "cp-zoom-close",
					"aria-label": "关闭放大",
					onClick: onClose,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 16 16",
						width: "16",
						height: "16",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8" })
					})
				})]
			});
		}
		//#endregion
		//#region src/client/ComputerGroup.tsx
		/**
		* 对话信息面板「电脑操控」组的内容：应用行（图标 + 名字 + 状态）和画面。
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "hs-info-note cp-app-status",
						"data-active": target?.active === true || void 0,
						children: appStatus(target)
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
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3.5",
					y: "4.5",
					width: "17",
					height: "12",
					rx: "2.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 20h6M12 16.5V20" })]
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
				always: "始终允许"
			},
			en: {
				label: "Risks",
				title: "Computer control risks",
				detail: "The agent can access only applications you approve, reading and controlling them in the background without stealing focus or moving your cursor.\n\nMessaging, gaming, or financial apps may restrict automation. Proceed at your own risk, or press Stop anytime in DeepSeek Harness.",
				reject: "Deny",
				always: "Always allow"
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
				canAnswer,
				onAllow: () => send(intent.approve),
				onReject: () => send(intent.reject),
				onAlways: intent.always === void 0 ? void 0 : () => send(intent.always)
			});
		}
		function FallbackApprovalCard(props) {
			const [busy, setBusy] = (0, react.useState)(false);
			const choose = (fn) => {
				if (busy || !props.canAnswer()) return;
				setBusy(true);
				fn().catch(() => setBusy(false));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "cp-approval-fallback",
				role: "region",
				"aria-label": props.title,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "cp-approval-card",
					children: [
						props.subject && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cp-approval-subject",
							children: [props.subject.icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								src: props.subject.icon,
								alt: "",
								width: 36,
								height: 36,
								draggable: false
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: props.subject.name })]
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "cp-btn",
									disabled: busy,
									onClick: () => choose(props.onReject),
									children: props.rejectLabel
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: props.onAlways ? "cp-btn" : "cp-btn cp-btn-primary",
									disabled: busy,
									onClick: () => choose(props.onAllow),
									children: props.allowLabel
								}),
								props.onAlways && props.alwaysLabel && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "cp-btn cp-btn-primary",
									disabled: busy,
									onClick: () => choose(props.onAlways),
									children: props.alwaysLabel
								})
							]
						})
					]
				})
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
				requestBtn: "申请权限",
				grantedBtn: "已允许",
				unknownBtn: "打开系统设置",
				waitDriverBtn: "需先安装驱动",
				appsTitle: "管理可访问的应用",
				appsHint: "智能体首次启动或操控某个应用前会向你询问授权；撤销后立即中止对该应用的操控。",
				noApps: "暂无「始终允许」或「不允许访问」的应用。",
				allowedGroup: "始终允许的应用",
				blockedGroup: "不允许访问的应用",
				revokeBtn: "撤销",
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
				requestBtn: "Request permission",
				grantedBtn: "Allowed",
				unknownBtn: "System Settings",
				waitDriverBtn: "Install driver first",
				appsTitle: "Application Access",
				appsHint: "Computer Plus asks before launching or controlling each application. Revoking access immediately stops active operations on that app.",
				noApps: "No always-allowed or blocked applications yet.",
				allowedGroup: "Always-allowed applications",
				blockedGroup: "Blocked applications",
				revokeBtn: "Revoke",
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
		function AppBadge({ name, icon, version }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "cp-cfg-badge",
				children: [
					icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: icon,
						alt: "",
						width: 18,
						height: 18,
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
			const [setup, setSetup] = (0, react.useState)(null);
			const [perms, setPerms] = (0, react.useState)(null);
			const [busyKey, setBusyKey] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [copied, setCopied] = (0, react.useState)(false);
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
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "cp-cfg-card",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cp-cfg-empty",
						children: t.unsupported
					})
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
				if (needDriver && !driverInstalled) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "cp-btn cp-cfg-action",
					disabled: true,
					children: t.waitDriverBtn
				});
				if (granted === false) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "cp-btn cp-btn-primary cp-cfg-action",
					disabled: busyKey !== null,
					onClick: () => void runAction(key, async () => {
						setSetup(await postJson("/setup", {
							action: "request-permission",
							target
						}));
					}, t.noticeRequested),
					children: t.requestBtn
				});
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "cp-btn cp-cfg-action",
					"data-granted": granted === true ? "" : void 0,
					disabled: busyKey !== null,
					onClick: () => void runAction(key, async () => {
						setSetup(await postJson("/setup", {
							action: "open-settings",
							pane
						}));
					}),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: granted === true ? `✓ ${t.grantedBtn}` : t.unknownBtn }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GearIcon, {})]
				});
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
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t.envTitle }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "cp-btn cp-btn-sm",
									disabled: busyKey !== null,
									onClick: () => void refresh(),
									children: t.refreshBtn
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cp-cfg-card",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cp-cfg-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "cp-cfg-copy",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "cp-cfg-row-title",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t.driverTitle }), driverInstalled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
														name: driverName,
														icon: setup?.driver.icon,
														version: setup?.driver.version
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: driverInstalled ? t.driverReadyDesc : t.driverMissingDesc }),
												setup !== null && !driverInstalled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "cp-cfg-cmd",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: INSTALL_SNIPPET }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: "cp-btn cp-btn-sm",
														onClick: copyCommand,
														children: copied ? t.copiedCmd : t.copyCmd
													})]
												}),
												setup?.driver.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
													className: "cp-cfg-err",
													children: setup.driver.error
												})
											]
										}), setup === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "cp-cfg-skeleton",
											"aria-hidden": "true"
										}) : driverInstalled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "cp-cfg-pill",
											"data-ok": "",
											children: ["✓ ", t.installedBadge]
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "cp-btn cp-btn-primary cp-cfg-action",
											disabled: installing || busyKey !== null,
											onClick: () => void runAction("install", async () => {
												setSetup(await postJson("/setup", { action: "install-driver" }));
											}, t.noticeInstalled),
											children: installing ? t.installingBtn : t.installBtn
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cp-cfg-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "cp-cfg-copy",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t.a11yTitle }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
												t.a11yBefore,
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
													name: driverName,
													icon: setup?.driver.icon
												}),
												t.a11yAfter
											] })]
										}), renderPermButton("a11y", setup?.driver.accessibility, true, "driver-accessibility", "accessibility")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cp-cfg-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "cp-cfg-copy",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t.driverScreenTitle }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
												t.driverScreenBefore,
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
													name: driverName,
													icon: setup?.driver.icon
												}),
												t.driverScreenAfter
											] })]
										}), renderPermButton("driver-screen", setup?.driver.screenRecording, true, "driver-screen", "screenRecording")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cp-cfg-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "cp-cfg-copy",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t.hostScreenTitle }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
												t.hostScreenBefore,
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppBadge, {
													name: hostName,
													icon: setup?.host.icon
												}),
												t.hostScreenAfter
											] })]
										}), renderPermButton("host-screen", setup?.host.screenRecording, false, "host-screen", "screenRecording")]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "cp-cfg-hint",
								children: t.envHint
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "cp-cfg-section",
						"aria-label": t.appsTitle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t.appsTitle }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "cp-cfg-card",
								children: perms === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cp-cfg-empty",
									children: "…"
								}) : perms.allowedApps.length === 0 && perms.blockedApps.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cp-cfg-empty",
									children: t.noApps
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [perms.allowedApps.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppListGroup, {
									title: t.allowedGroup,
									apps: perms.allowedApps,
									icons: perms.icons,
									actionLabel: t.revokeBtn,
									busy: busyKey !== null,
									onAction: (id) => void runAction(`revoke:${id}`, async () => {
										setPerms(await postJson("/permissions", {
											action: "revoke",
											id
										}));
									}, t.noticeRevoked)
								}), perms.blockedApps.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppListGroup, {
									title: t.blockedGroup,
									apps: perms.blockedApps,
									icons: perms.icons,
									actionLabel: t.retryApprovalBtn,
									busy: busyKey !== null,
									onAction: (id) => void runAction(`retry:${id}`, async () => {
										setPerms(await postJson("/permissions", {
											action: "retry",
											id
										}));
									}, t.noticeRetryAllowed)
								})] })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "cp-cfg-hint",
								children: t.appsHint
							})
						]
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cp-cfg-notice",
						role: "status",
						children: notice
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cp-cfg-err",
						role: "alert",
						children: error
					})
				]
			});
		}
		function AppListGroup({ title, apps, icons, actionLabel, busy, onAction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cp-cfg-group",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: "cp-cfg-apps",
					children: apps.map((app) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cp-cfg-app",
						title: app.bundlePath ?? app.bundleId ?? app.executablePath,
						children: [icons[app.id] ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: icons[app.id],
							alt: "",
							width: 30,
							height: 30,
							draggable: false
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "cp-cfg-app-ph",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cp-cfg-app-meta",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: app.name }), app.bundleId && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: app.bundleId })]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "cp-btn cp-btn-sm",
						disabled: busy,
						onClick: () => onAction(app.id),
						children: actionLabel
					})] }, app.id))
				})]
			});
		}
		//#endregion
		//#region src/client/computer.css.ts
		/**
		* 电脑操控组的样式。行的骨架（.hs-info-row / .hs-info-ico / .hs-info-text / .hs-info-note）沿用对话信息面板的，
		* 这里只管自己的部分：应用图标、名字截断、画面、光标、涟漪、完成徽标、放大层。数值从 dsh-harness-plus 原样搬来。
		*/
		const computerCss = `
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
  .cp-cfg-skeleton { animation: none; }
}

/* ─── 插件详情页：环境与权限面板 + 应用访问管理（.cp-cfg* / .cp-btn*） ─── */
.cp-cfg {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
}
.cp-cfg-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l2, rgb(128 128 128 / .2));
  border-radius: var(--dsw-radius-md, 10px);
  background: var(--dsw-alias-bg-layer-1, transparent);
  overflow: hidden;
}
.cp-cfg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
}
.cp-cfg-row + .cp-cfg-row {
  border-top: 1px solid var(--dsw-alias-border-l1, rgb(128 128 128 / .14));
}
.cp-cfg-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cp-cfg-row-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.cp-cfg-copy strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.cp-cfg-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}
.cp-cfg-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  vertical-align: -3px;
  padding: 1px 7px 1px 5px;
  margin: 0 2px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(128 128 128 / .2));
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / .08));
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.cp-cfg-badge img {
  display: block;
  width: 16px;
  height: 16px;
  flex: none;
}
.cp-cfg-ver {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  font-weight: 400;
}
.cp-cfg-cmd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 6px 8px 6px 10px;
  border-radius: 7px;
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / .08));
}
.cp-cfg-cmd code {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--dsw-alias-label-primary);
}
.cp-cfg-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  height: 30px;
  padding: 0 11px;
  border-radius: var(--dsw-radius-sm, 7px);
  border: 1px solid var(--dsw-alias-border-l2, rgb(128 128 128 / .2));
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.cp-cfg-pill[data-ok] {
  color: var(--dsw-alias-state-success-primary, #22a06b);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22a06b) 32%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22a06b) 8%, transparent);
}
.cp-cfg-skeleton {
  flex: none;
  width: 96px;
  height: 30px;
  border-radius: var(--dsw-radius-sm, 7px);
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / .1));
  animation: cp-pulse 1.3s ease-in-out infinite;
}
@keyframes cp-pulse {
  0%, 100% { opacity: .55; }
  50% { opacity: 1; }
}
.cp-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--dsw-radius-sm, 7px);
  border: 1px solid var(--dsw-alias-border-l3, rgb(128 128 128 / .28));
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  flex: none;
  transition: background-color .14s ease, border-color .14s ease, opacity .14s ease;
}
@media (hover: hover) {
  .cp-btn:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / .1));
  }
}
.cp-btn:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}
.cp-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.cp-btn-sm {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
}
.cp-btn-primary {
  border-color: transparent;
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
  color: #fff;
}
@media (hover: hover) {
  .cp-btn-primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 88%, #000);
  }
}
.cp-cfg-action {
  min-width: 108px;
}
.cp-cfg-action[data-granted] {
  color: var(--dsw-alias-label-secondary);
}
.cp-cfg-gear {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: .72;
}
.cp-cfg-hint {
  margin: 0;
  padding: 0 2px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.cp-cfg-empty {
  margin: 0;
  padding: 18px 16px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.cp-cfg-group {
  display: flex;
  flex-direction: column;
}
.cp-cfg-group + .cp-cfg-group {
  border-top: 1px solid var(--dsw-alias-border-l1, rgb(128 128 128 / .14));
}
.cp-cfg-group h4 {
  margin: 0;
  padding: 10px 16px 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--dsw-alias-label-tertiary);
}
.cp-cfg-apps {
  list-style: none;
  margin: 0;
  padding: 0;
}
.cp-cfg-apps > li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
}
.cp-cfg-apps > li + li {
  border-top: 1px solid var(--dsw-alias-border-l1, rgb(128 128 128 / .12));
}
.cp-cfg-app {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.cp-cfg-app img, .cp-cfg-app-ph {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex: none;
}
.cp-cfg-app-ph {
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / .12));
}
.cp-cfg-app-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cp-cfg-app-meta strong {
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cp-cfg-app-meta span {
  font-size: 11.5px;
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cp-cfg-notice {
  margin: 0;
  font-size: 12px;
  color: var(--dsw-alias-state-business-primary);
}
.cp-cfg-err {
  margin: 0;
  font-size: 12px;
  color: var(--dsw-alias-state-error-primary, #e34935);
}

/* 兜底审批卡片（仅当宿主未提供 conversation.approval.card 工厂插槽时使用） */
.cp-approval-fallback {
  padding: 8px 0;
}
.cp-approval-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(128 128 128 / .22));
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-bg-layer-1, transparent);
}
.cp-approval-subject {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cp-approval-subject img {
  width: 32px;
  height: 32px;
  flex: none;
}
.cp-approval-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.cp-approval-desc {
  margin: 0;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
}
.cp-approval-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
		function injectStyles() {
			if (typeof document === "undefined") return () => {};
			let style = document.querySelector(`style[data-plugin-css="${PLUGIN_ID}"]`);
			if (style === null) {
				style = document.createElement("style");
				style.dataset.pluginCss = PLUGIN_ID;
				document.head.appendChild(style);
			}
			style.textContent = computerCss;
			const owned = style;
			return () => owned.remove();
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
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map