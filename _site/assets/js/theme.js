(() => {
  const root = document.documentElement;
  const baseurl = document.currentScript.dataset.baseurl || "";
  const palettes = {
    gold: { base: "#191a1c", light: "#e8b85c", text: "#fff4e0", accent: "#e8b85c", surface: "#292a2d" },
    copper: { base: "#111c2e", light: "#efa984", text: "#fff4ea", accent: "#efa984", surface: "#20304a" },
    forest: { base: "#14251e", light: "#d8dfad", text: "#fff9e9", accent: "#d8dfad", surface: "#24382e" }
  };
  const styles = ["solid", "dashed", "dotted", "double", "ornate", "geometric"];
  const decorative = style => ["ornate", "geometric"].includes(style);
  const positions = { top: "50% 0%", center: "50% 50%", left: "0% 0%", right: "100% 0%", bottom: "50% 100%" };
  const schema = {
    palette: { values: Object.keys(palettes), value: "gold" },
    background: { values: ["radial", "solid"], value: "radial" },
    base: { color: true }, light: { color: true },
    strength: { min: 0, max: 60, step: 1, value: 22 },
    position: { values: Object.keys(positions), value: "top" },
    border: { values: ["on", "off"], value: "on" },
    borderStyle: { values: styles, value: "solid" },
    borderWidth: { min: .25, max: 2, step: .25, value: .5 },
    borderColor: { color: true },
    borderMotifSize: { min: 2, max: 8, step: .5, value: 4 },
    outline: { values: ["on", "off"], value: "on" },
    outlineStyle: { values: styles, value: "solid" },
    outlineWidth: { min: .25, max: 2, step: .25, value: .25 },
    outlineColor: { color: true },
    outlineMotifSize: { min: 2, max: 8, step: .5, value: 4 },
    gap: { min: 1, max: 4, step: .25, value: 2 }
  };
  const key = name => `style-${name}`;
  let state;
  let warnings = [];
  let locked = false;
  let controls = [];
  let selector;
  let settings;
  let status;

  function defaults(palette = "gold") {
    const result = Object.fromEntries(Object.entries(schema).map(([name, rule]) => [name, rule.value]));
    return Object.assign(result, {
      palette, base: palettes[palette].base, light: palettes[palette].light,
      borderColor: palettes[palette].accent, outlineColor: palettes[palette].accent
    });
  }

  function valid(value, rule) {
    if (rule.values) return rule.values.includes(value);
    if (rule.color) return /^#[0-9a-f]{6}$/i.test(value);
    const number = Number(value);
    return value.trim() !== "" && Number.isFinite(number) && number >= rule.min && number <= rule.max
      && Math.abs(number / rule.step - Math.round(number / rule.step)) < .00001;
  }

  function read() {
    const params = new URLSearchParams(location.search);
    warnings = [];
    const theme = params.get("theme") || "original";
    if (!["original", "glow"].includes(theme)) warnings.push("Unknown theme; using Original.");
    const palette = params.get(key("palette")) || "gold";
    const values = defaults(palettes[palette] ? palette : "gold");
    for (const [name, rule] of Object.entries(schema)) {
      if (!params.has(key(name))) continue;
      const value = params.get(key(name));
      if (!valid(value, rule)) {
        warnings.push(`Invalid ${name}; using its default.`);
        continue;
      }
      values[name] = rule.min === undefined ? value.toLowerCase() : Number(value);
    }
    state = { theme: theme === "glow" ? "glow" : "original", values };
  }

  function rgba(hex, alpha) {
    return `rgba(${[1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)).join(",")},${alpha})`;
  }

  function apply(target, snapshot = state) {
    target.dataset.theme = snapshot.theme;
    const value = snapshot.values;
    const palette = palettes[value.palette];
    const properties = {
      "--cream": value.base, "--cream-2": palette.surface, "--ink": palette.text,
      "--brown": palette.text, "--saffron": palette.accent, "--chilli": palette.accent,
      "--theme-base": value.base,
      "--theme-surface": value.background === "solid" ? value.base
        : `radial-gradient(circle at ${positions[value.position]}, ${rgba(value.light, value.strength / 100)}, ${rgba(value.light, 0)} 65%) ${value.base}`,
      "--theme-border-style": value.border === "on" && !decorative(value.borderStyle) ? value.borderStyle : "none",
      "--theme-outline-style": value.outline === "on" && !decorative(value.outlineStyle) ? value.outlineStyle : "none",
      "--theme-border-color": value.borderColor, "--theme-outline-color": value.outlineColor,
      "--theme-border-width": `${value.borderWidth}mm`, "--theme-outline-width": `${value.outlineWidth}mm`,
      "--theme-gap": `${value.gap}mm`,
      "--frame-border-width": `${value.borderWidth}mm`, "--frame-outline-width": `${value.outlineWidth}mm`,
      "--frame-gap": `${value.gap}mm`
    };
    for (const [name, content] of Object.entries(properties)) {
      if (snapshot.theme === "glow") target.style.setProperty(name, content);
      else target.style.removeProperty(name);
    }
    renderFrames(target.ownerDocument, snapshot);
  }

  function renderFrames(doc, snapshot = state) {
    const value = snapshot.values;
    const mm = 96 / 25.4;
    for (const host of doc.querySelectorAll("[data-theme-frame]")) {
      for (const layer of Array.from(host.children).filter(child => child.classList.contains("theme-motif-frame"))) layer.remove();
      if (snapshot.theme !== "glow") continue;
      const small = host.dataset.themeFrame === "small";
      const width = Math.min(value.borderWidth, small ? .6 : 2);
      const gap = Math.min(value.gap, small ? 1 : 4);
      const start = small ? .5 : 1;
      const computed = doc.defaultView.getComputedStyle(host);
      const clearance = Math.min(...["Top", "Right", "Bottom", "Left"]
        .map(side => parseFloat(computed[`padding${side}`]))) / mm;
      for (const frame of ["border", "outline"]) {
        const style = value[`${frame}Style`];
        if (value[frame] !== "on" || !decorative(style)) continue;
        const inset = frame === "border" ? start : start + width + gap;
        const available = frame === "border" && value.outline === "on"
          ? width + gap - .25 : clearance - inset - .5;
        const size = Math.max(.5, Math.min(value[`${frame}MotifSize`], small ? 2 : 8, available));
        const stroke = Math.min(value[`${frame}Width`], small ? .6 : 2, size / 10);
        const layer = doc.createElement("span");
        layer.className = "theme-motif-frame";
        layer.setAttribute("aria-hidden", "true");
        layer.style.inset = `${inset}mm`;
        layer.style.setProperty("--motif-size", `${size}mm`);
        layer.style.setProperty("--motif-stroke", `${stroke}mm`);
        layer.style.color = value[`${frame}Color`];
        for (const edge of ["top", "right", "bottom", "left"]) {
          const line = doc.createElement("span");
          line.className = `theme-motif-edge theme-motif-edge-${edge}`;
          layer.appendChild(line);
        }
        const paths = style === "ornate"
          ? '<path d="M5 100V52C5 22 22 5 52 5H100M5 70C35 70 70 35 70 5M22 58C48 58 58 48 58 22C36 22 22 36 22 58Z"/>'
          : '<path d="M5 100V35H20V20H35V5H100M35 62L48 49L61 62L48 75Z"/>';
        const alignedPaths = paths.replace(/\b5\b/g, String(stroke / size * 50));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * mm}" height="${size * mm}" viewBox="0 0 100 100" fill="none" stroke="${value[`${frame}Color`]}" stroke-width="${stroke / size * 100}" stroke-linejoin="round">${alignedPaths}</svg>`;
        for (const corner of ["tl", "tr", "br", "bl"]) {
          const image = doc.createElement("img");
          image.alt = "";
          image.className = `theme-motif-corner theme-motif-${corner}`;
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          layer.appendChild(image);
        }
        host.appendChild(layer);
      }
    }
  }

  function luminance(hex) {
    const rgb = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  }

  function messages() {
    const result = [...warnings];
    if (state.theme === "glow") {
      const value = state.values;
      const alpha = value.background === "radial" ? value.strength / 100 : 0;
      const peak = "#" + [1, 3, 5].map(start => Math.round(
        parseInt(value.base.slice(start, start + 2), 16) * (1 - alpha)
        + parseInt(value.light.slice(start, start + 2), 16) * alpha
      ).toString(16).padStart(2, "0")).join("");
      for (const foreground of [palettes[value.palette].text, palettes[value.palette].accent]) {
        for (const background of [value.base, peak]) {
          const levels = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
          if ((levels[1] + .05) / (levels[0] + .05) < 4.5) {
            result.push("Low text/accent contrast. Choose a darker base or reduce the glow before exporting.");
            break;
          }
        }
      }
      if (["border", "outline"].some(frame => value[frame] === "on" && value[`${frame}Style`] === "double" && value[`${frame}Width`] < .75)) {
        result.push("Double lines may merge at this width; use at least 0.75 mm (small cards cap widths at 0.6 mm).");
      }
    }
    return [...new Set(result)].join(" ");
  }

  function sync() {
    if (!selector) return;
    selector.value = state.theme;
    selector.disabled = locked;
    settings.disabled = locked || state.theme !== "glow";
    for (const control of controls) {
      const value = state.values[control.dataset.themeSetting];
      if (control.type === "checkbox") control.checked = value === "on";
      else control.value = value;
      const frame = control.dataset.themeSetting.startsWith("border") ? "border" : "outline";
      if (control.dataset.themeSetting.endsWith("MotifSize")) {
        control.disabled = locked || state.theme !== "glow" || state.values[frame] !== "on"
          || !decorative(state.values[`${frame}Style`]);
      }
    }
    status.textContent = messages();
    if (status.textContent) document.getElementById("theme-controls").open = true;
  }

  function decorate() {
    const large = ".hero, .menu-sheet, .flyer, .tent-half, .reserved-face, .kit-sheet:not(.kit-upi-minimal):not(.kit-kids):not(.kit-loyalty):not(.kit-reserved)";
    const small = ".features article, .kit-card, .coupon, .bcard, .loyalty-card";
    for (const element of document.querySelectorAll(large)) element.dataset.themeFrame = "large";
    for (const element of document.querySelectorAll(small)) element.dataset.themeFrame = "small";
  }

  function styleUrl(url) {
    url.searchParams.delete("theme");
    for (const name of Object.keys(schema)) url.searchParams.delete(key(name));
    if (state.theme === "glow") {
      url.searchParams.set("theme", "glow");
      const baseline = defaults(state.values.palette);
      for (const [name, value] of Object.entries(state.values)) {
        if (name === "palette" ? value !== "gold" : value !== baseline[name]) url.searchParams.set(key(name), value);
      }
    }
    return url;
  }

  function links() {
    for (const link of document.querySelectorAll("a[href]")) {
      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#")) continue;
      const url = new URL(raw, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith(`${baseurl}/`)) continue;
      if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) continue;
      link.href = styleUrl(url).href;
    }
  }

  function commit() {
    apply(root);
    history.replaceState(null, "", styleUrl(new URL(location.href)));
    links();
    sync();
  }

  read();
  apply(root);
  window.SiteTheme = {
    snapshot: () => ({ theme: state.theme, values: { ...state.values } }),
    apply,
    refreshFrames: () => renderFrames(document),
    async prepare(doc = document, snapshot = state) {
      renderFrames(doc, snapshot);
      await Promise.all(Array.from(doc.querySelectorAll(".theme-motif-corner")).map(image => image.decode()));
    },
    setLocked(value) { locked = value; sync(); },
    refreshLinks: links
  };

  document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("control-sidebar");
    sidebar.open = !window.matchMedia("(max-width: 1240px)").matches;
    selector = document.getElementById("site-theme");
    settings = document.getElementById("theme-settings");
    status = document.getElementById("theme-status");
    controls = Array.from(settings.querySelectorAll("[data-theme-setting]"));
    selector.closest("label").hidden = false;
    document.getElementById("theme-controls").hidden = false;
    selector.addEventListener("change", () => {
      state.theme = selector.value;
      warnings = [];
      commit();
    });
    for (const control of controls) control.addEventListener("change", () => {
      const name = control.dataset.themeSetting;
      const value = control.type === "checkbox" ? (control.checked ? "on" : "off") : control.value;
      if (!valid(value, schema[name])) {
        warnings = [`Invalid ${name}; enter a value within the displayed limits.`];
        sync();
        return;
      }
      warnings = [];
      if (name === "palette") state.values = { ...state.values, ...{
        palette: value, base: palettes[value].base, light: palettes[value].light,
        borderColor: palettes[value].accent, outlineColor: palettes[value].accent
      } };
      else state.values[name] = schema[name].min === undefined ? value : Number(value);
      commit();
    });
    document.getElementById("theme-reset").addEventListener("click", () => {
      state.values = defaults();
      warnings = [];
      commit();
    });
    document.getElementById("theme-share").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        status.textContent = [messages(), "Styled link copied."].filter(Boolean).join(" ");
      } catch {
        status.textContent = [messages(), "Clipboard unavailable. Copy the address from your browser."].filter(Boolean).join(" ");
      }
    });
    decorate();
    renderFrames(document);
    window.addEventListener("resize", () => renderFrames(document));
    sync();
    links();
    window.addEventListener("popstate", () => {
      read();
      apply(root);
      sync();
      links();
    });
  });
})();
