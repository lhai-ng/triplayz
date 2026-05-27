// transition.js

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms || 0));
}

function isFromLinkTransition() {
  // 1. Lấy navigation type (ưu tiên API mới, fallback API cũ)
  const navEntry = performance.getEntriesByType("navigation")[0];
  const navType = navEntry
    ? navEntry.type // 'navigate' | 'reload' | 'back_forward' | 'prerender'
    : performance.navigation?.type === 0
      ? "navigate"
      : "reload"; // legacy fallback

  // Reload hoặc back/forward → chạy preloader đầy đủ
  if (navType === "reload" || navType === "back_forward") return false;

  // navigate → kiểm tra thêm referrer có cùng origin không
  if (!document.referrer) return false;
  try {
    return new URL(document.referrer).origin === location.origin;
  } catch (_) {
    return false;
  }
}

function coverScreen() {
  return new Promise((resolve) => {
    const cols = document.querySelectorAll("#preloader .column");
    if (!cols.length) {
      resolve();
      return;
    }

    const COLUMN_BG =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-brand",
      ) || "hsla(247, 48%, 45%, 1)";

    gsap.set(cols, {
      backgroundColor: COLUMN_BG,
      rotateY: -90,
      translateZ: -180,
      transformOrigin: "right center",
    });
    gsap.set("#preloader", { display: "flex" });

    gsap.to(cols, {
      rotateY: 0,
      translateZ: 0,
      duration: 0.65,
      stagger: -0.025,
      ease: "power4.inOut",
      onComplete: resolve,
    });
  });
}

function revealScreen() {
  return new Promise((resolve) => {
    const cols = document.querySelectorAll("#preloader .column");
    if (!cols.length) {
      resolve();
      return;
    }

    gsap.set(cols, { rotateY: 0, translateZ: 0 });
    gsap.set("#preloader", { display: "flex" });

    gsap.to(cols, {
      rotateY: -90,
      translateZ: 180,
      transformOrigin: "left center",
      duration: 1,
      stagger: -0.03,
      ease: "power4.inOut",
      onComplete: () => {
        gsap.set("#preloader", { display: "none" });
        resolve();
      },
    });
  });
}

function initLinkTransition() {
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (!link) return;

    if (link.classList.contains("no-transition")) return;
    if (link.getAttribute("target") === "_blank") return;
    const href = link.getAttribute("href");
    if (
      !href ||
      href === "" ||
      href.startsWith("#") ||
      href.startsWith("javascript") ||
      href.startsWith("mailto")
    )
      return;

    try {
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && !url.search) return;
    } catch (_) {
      return;
    }

    e.preventDefault();
    const dest = link.href;

    document.querySelector(".nav-menu")?.classList.remove("active");

    coverScreen().then(() => {
      window.location.href = dest;
    });
  });
}

function initPageReveal() {
  const cols = document.querySelectorAll("#preloader .column");
  if (!cols.length) return;

  const COLUMN_BG =
    getComputedStyle(document.documentElement).getPropertyValue(
      "--color-brand",
    ) || "hsla(247, 48%, 45%, 1)";

  const fromTransition = isFromLinkTransition();

  if (fromTransition) {
    // Ẩn hoàn toàn loader icon — chỉ chạy column animation khi chuyển trang
    const loaderIcon = document.getElementById("loader-icon");
    if (loaderIcon) loaderIcon.style.display = "none";

    gsap.set(cols, {
      backgroundColor: COLUMN_BG,
      rotateY: 0,
      translateZ: 0,
    });
    gsap.set("#preloader", { display: "flex" });

    window.scrollTo({ top: 0, behavior: "instant" });

    requestAnimationFrame(() => {
      revealScreen().then(() => {
        // Restore sau khi preloader đã ẩn hẳn
        if (loaderIcon) loaderIcon.style.display = "";
      });
    });
  }
  // Không fromTransition (reload / first visit): initPreloaderTextAnimation tự xử lý
}

function updateNavLinks() {
  document.querySelectorAll(".h-menu a, .nav-menu a").forEach((a) => {
    a.classList.remove("is-active");
    a.removeAttribute("aria-disabled");
    a.style.pointerEvents = "";

    try {
      const url = new URL(a.href, location.origin);
      if (url.pathname === location.pathname) {
        a.classList.add("is-active");
        a.setAttribute("aria-disabled", "true");
        a.style.pointerEvents = "none";
      }
    } catch (_) {}
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    updateNavLinks();
    initLinkTransition();
    initPageReveal();
  });
} else {
  updateNavLinks();
  initLinkTransition();
  initPageReveal();
}
