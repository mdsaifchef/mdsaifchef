(() => {
  const template = document.getElementById("kit-template");
  const format = document.getElementById("kit-format");
  const sheets = Array.from(document.querySelectorAll(".kit-sheet"));
  if (!template || !format || !sheets.length) return;

  const params = new URLSearchParams(window.location.search);
  if (sheets.some(sheet => sheet.id === params.get("template"))) {
    template.value = params.get("template");
  }
  if (Array.from(format.options).some(option => option.value === params.get("format"))) {
    format.value = params.get("format");
  }

  const pageStyle = document.createElement("style");
  document.head.appendChild(pageStyle);

  function update() {
    const fixedPaper = ["loyalty", "reserved"].includes(template.value);
    for (const option of format.options) {
      option.disabled = fixedPaper && option.value !== "a4";
    }
    if (fixedPaper) format.value = "a4";
    const selected = sheets.find(sheet => sheet.id === template.value);
    for (const sheet of sheets) sheet.hidden = sheet !== selected;
    document.body.dataset.kitFormat = format.value;
    if (window.SiteTheme) window.SiteTheme.refreshFrames();
    pageStyle.textContent = format.value === "a5"
      ? "@page { size: A5 portrait; margin: 0; }"
      : "@page { size: A4 portrait; margin: 0; }";
    document.getElementById("kit-guidance").textContent = selected.dataset.guidance;
    const url = new URL(window.location.href);
    url.searchParams.set("template", template.value);
    url.searchParams.set("format", format.value);
    window.history.replaceState(null, "", url);
    if (window.SiteTheme) window.SiteTheme.refreshLinks();
  }

  template.addEventListener("change", update);
  format.addEventListener("change", update);
  window.addEventListener("popstate", () => {
    const current = new URLSearchParams(window.location.search);
    if (sheets.some(sheet => sheet.id === current.get("template"))) template.value = current.get("template");
    if (Array.from(format.options).some(option => option.value === current.get("format"))) format.value = current.get("format");
    update();
  });
  document.querySelector(".kit-options").hidden = false;
  update();

  let imageFormat;
  window.addEventListener("beforeprint", () => {
    if (["square", "story"].includes(format.value)) {
      imageFormat = format.value;
      format.value = "a4";
      update();
    }
  });
  window.addEventListener("afterprint", () => {
    if (imageFormat) {
      format.value = imageFormat;
      imageFormat = undefined;
      update();
    }
  });

  document.getElementById("kit-share").addEventListener("click", async () => {
    const guidance = document.getElementById("kit-guidance");
    try {
      await navigator.clipboard.writeText(window.location.href);
      guidance.textContent = "Template link copied. This shares the layout, not a payment confirmation.";
    } catch {
      guidance.textContent = "Copy the current address from your browser to share this template.";
    }
  });

  const exportButton = document.getElementById("kit-export");
  const scaleControl = document.getElementById("kit-scale");
  const exportStatus = document.getElementById("kit-export-status");
  exportButton.addEventListener("click", async () => {
    const pages = sheets.filter(sheet => !sheet.hidden);
    const exportFormat = format.value;
    const scale = Number(scaleControl.value);
    const styling = window.SiteTheme ? window.SiteTheme.snapshot() : null;
    let downloaded = 0;
    exportButton.disabled = template.disabled = format.disabled = scaleControl.disabled = true;
    if (window.SiteTheme) window.SiteTheme.setLocked(true);
    exportStatus.textContent = "Preparing PNG export…";
    try {
      if (typeof window.html2canvas !== "function") {
        throw new Error("The image renderer could not load. Reload the page and try again.");
      }
      if (!pages.length || ![1, 2, 3].includes(scale)) {
        throw new Error("Choose a template and image quality before exporting.");
      }
      await document.fonts.ready;
      if (styling) await window.SiteTheme.prepare(document, styling);
      for (const [index, page] of pages.entries()) {
        exportStatus.textContent = `Rendering page ${index + 1} of ${pages.length}…`;
        await Promise.all(Array.from(page.querySelectorAll("img"))
          .filter(image => !image.hidden)
          .map(image => image.decode().catch(error => {
            if (!image.hidden) throw error;
          })));
        const canvas = await window.html2canvas(page, {
          scale,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          windowWidth: 1280,
          scrollX: 0,
          scrollY: 0,
          onclone: async clonedDocument => {
            if (styling) window.SiteTheme.apply(clonedDocument.documentElement, styling);
            clonedDocument.body.dataset.kitFormat = exportFormat;
            const artwork = clonedDocument.getElementById(page.id);
            artwork.style.zoom = "1";
            artwork.style.margin = "0";
            artwork.style.boxShadow = "none";
            if (styling) await window.SiteTheme.prepare(clonedDocument, styling);
          }
        });
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
          if (!blob) throw new Error("The image is too large. Try a lower image quality.");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${page.id}-${exportFormat}-${styling ? styling.theme : "original"}-page-${index + 1}.png`;
          document.body.appendChild(link);
          try {
            link.click();
            downloaded++;
          } finally {
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          }
        } finally {
          canvas.width = canvas.height = 0;
        }
      }
      exportStatus.textContent = `${downloaded} PNG download${downloaded === 1 ? "" : "s"} started. If prompted, allow multiple downloads.`;
    } catch (error) {
      exportStatus.textContent = `PNG export failed (${downloaded} download${downloaded === 1 ? "" : "s"} started). ${error.message || "Try again."} Try a lower quality, or use Print to save a PDF.`;
    } finally {
      exportButton.disabled = template.disabled = format.disabled = scaleControl.disabled = false;
      if (window.SiteTheme) window.SiteTheme.setLocked(false);
    }
  });

  for (const image of document.querySelectorAll(".payment-qr")) {
    const showError = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener("error", showError);
    if (image.complete && image.naturalWidth === 0) showError();
  }
})();
