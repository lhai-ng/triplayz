$(document).ready(function () {
  // $('.btn-bar').click(function(){
  //     $('.mm-menu').addClass('active');
  // })
  // $('.close-menu').click(function(){
  //     $('.mm-menu').removeClass('active');
  // })

  var swiperConfig = {
    spaceBetween: 16,
    slidesPerView: 2,
    loop: true,
    centeredSlides: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 5.5,
      },
      1400: {
        slidesPerView: 5.5,
      },
    },
  };

  var swiperModel1 = new Swiper(".swiper-model-1", swiperConfig);

  var swiperModel2 = new Swiper(".swiper-model-2", {
    ...swiperConfig,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      reverseDirection: true, // chạy ngược chiều
    },
  });

  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length) lenis.scrollTo(value, { immediate: true });
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
    }

    (function initFooterReveal() {
      const mainEl = document.querySelector("main");
      const footerEl = document.querySelector("footer");
      if (!mainEl || !footerEl) return;

      const MAIN_SLOW = 1.8;
      const FOOTER_SLOW = 0.7;
      const FOOTER_DWELL = 0;
      const SHADOW_MAX = 30;

      const spacer = document.createElement("div");
      spacer.id = "footer-reveal-spacer";
      spacer.style.pointerEvents = "none";
      mainEl.insertAdjacentElement("afterend", spacer);

      function getOffset() {
        return window.innerHeight * 0.4;
      }

      function updateSpacer() {
        const V = window.innerHeight;
        const FH = footerEl.offsetHeight;
        spacer.style.height =
          V * MAIN_SLOW + V * FOOTER_DWELL + Math.max(0, FH - V) + "px";
      }

      updateSpacer();
      footerEl.style.transform = `translateY(${getOffset()}px)`;

      lenis.on("scroll", ({ scroll }) => {
        const V = window.innerHeight;
        const FOOTER_OFFSET = getOffset();
        const triggerY = mainEl.offsetHeight - V;

        if (scroll > triggerY) {
          const rawDelta = scroll - triggerY;

          // ── Main
          const mainDelta = rawDelta / MAIN_SLOW;
          mainEl.style.transform = `translateY(-${mainDelta}px)`;

          const mainProgress = Math.min(1, mainDelta / V);
          const shadowBlur = SHADOW_MAX * (1 - mainProgress);
          mainEl.style.boxShadow =
            mainProgress < 1
              ? `0 ${shadowBlur}px ${shadowBlur * 0.8}px rgba(0,0,0,${(1 - mainProgress) * 0.2})`
              : "";

          // ── Footer reveal
          const footerProgress = Math.min(1, rawDelta / (FOOTER_SLOW * V));
          const footerParallax = FOOTER_OFFSET * (1 - footerProgress);

          // ── Footer scroll-through: bắt đầu sau reveal + dwell
          const FH = footerEl.offsetHeight;
          const footerScrollStart = (FOOTER_SLOW + FOOTER_DWELL) * V;
          const footerScrollDelta = Math.min(
            Math.max(0, rawDelta - footerScrollStart),
            Math.max(0, FH - V),
          );

          footerEl.style.transform = `translateY(${footerParallax - footerScrollDelta}px)`;
        } else {
          mainEl.style.transform = "";
          mainEl.style.boxShadow = "";
          footerEl.style.transform = `translateY(${getOffset()}px)`;
        }
      });

      window.addEventListener("resize", () => {
        updateSpacer();
        footerEl.style.transform = `translateY(${getOffset()}px)`;
        ScrollTrigger.refresh();
      });
    })();
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Cập nhật số thứ tự cho phần Highlight case study kèm hiệu ứng slide (chống kẹt khi cuộn nhanh)
    if ($(".item-casestudy").length) {
      let activeIndex = 0;
      let lastDirection = 1;
      let updateTimeout;

      $(".item-casestudy").each(function (index) {
        ScrollTrigger.create({
          trigger: this,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            if (self.isActive && activeIndex !== index) {
              lastDirection = index > activeIndex ? 1 : -1;
              activeIndex = index;

              // Dùng debounce/timeout siêu ngắn để gom nhóm và bỏ qua các trạng thái trung gian nếu cuộn vèo một phát qua nhiều item
              clearTimeout(updateTimeout);
              updateTimeout = setTimeout(() => {
                let num = activeIndex + 1;
                let newText = num < 10 ? "0" + num : num;

                let $wrap = $(".current-case-numb").first().parent();

                // Dọn dẹp DOM node thừa để rác không bị dồn khi cuộn cuồng loạn mà onComplete chưa ki kịp
                $wrap.find(".is-leaving").remove();

                let $oldEls = $wrap.find(".current-case-numb");

                // Nếu số hiện tại vẫn giống thì khỏi làm gì (trường hợp quay xe ngay lập tức)
                if ($oldEls.length && $oldEls.last().text() === String(newText))
                  return;

                $oldEls.addClass("is-leaving");

                // Hướng trượt (scroll xuống -> trượt xuống như yêu cầu)
                let yOut = lastDirection === 1 ? "100%" : "-100%";
                let yIn = lastDirection === 1 ? "-100%" : "100%";

                let $newEl = $(
                  '<span class="current-case-numb absolute w-full text-center">' +
                  newText +
                  "</span>",
                );
                gsap.set($newEl, { y: yIn });

                $wrap.append($newEl);

                // Ngắt sạch hiệu ứng cũ để không bị giật lag
                gsap.killTweensOf($oldEls);

                // Tăng tốc một chút hiệu ứng khi cuộn nhanh, bỏ đi inOut cho dứt khoát
                gsap.to($oldEls, {
                  y: yOut,
                  duration: 0.3,
                  ease: "power2.out",
                  onComplete: () => {
                    $oldEls.remove();
                  },
                });

                gsap.to($newEl, {
                  y: "0%",
                  duration: 0.3,
                  ease: "power2.out",
                });
              }, 25); // Chờ 25ms (khoảng gần 2 frame) để lắng đọng nhịp cuộn nhanh
            }
          },
        });
      });
    }
    // Animation xoay vòng Why Us (Trượt dần theo scrub)
    if ($(".content-whuyus").length && $(".whyus-slide").length > 1) {
      let slides = gsap.utils.toArray(".whyus-slide");

      // Khởi tạo các slide
      slides.forEach((sl, i) => {
        sl.classList.remove("opacity-0", "translate-y-10");
        if (i > 0) gsap.set(sl, { yPercent: 100 });
        else gsap.set(sl, { yPercent: 0 }); // Đảm bảo slide 0 nằm đúng vị trí
      });

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".content-whuyus",
          start: "center center",
          end: () => "+=" + window.innerHeight * 4,
          pin: true,
          scrub: true,
        }
      });

      // Xoay wheel liên tục trong suốt timeline (chiều âm để mép phải bánh xe đi lên cùng hướng với slide)
      let totalDuration = slides.length - 1;
      let totalRotation = -totalDuration * 45; // Đổi thành chiều âm để không bị ngược

      tl.to(".whyus-wheel", {
        rotation: totalRotation,
        ease: "none",
        duration: totalDuration
      }, 0);

      // Hiệu ứng chuyển slide mượt mà
      slides.forEach((sl, i) => {
        if (i > 0) {
          // Slide cũ đi lên (-100%)
          tl.to(slides[i - 1], { yPercent: -100, ease: "none", duration: 1 }, i - 1);
          // Slide mới đi từ dưới lên (0%)
          tl.to(sl, { yPercent: 0, ease: "none", duration: 1 }, i - 1);
        }
      });
    }
    // Parallax effect cho form section image
    if ($(".form-parallax-sec").length && $(".form-parallax-img").length) {
      gsap.fromTo(".form-parallax-img",
        { yPercent: -30 },
        {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: ".form-parallax-sec",
            start: "top bottom", // Bắt đầu khi top của section chạm bottom của viewport
            end: "bottom top",   // Kết thúc khi bottom của section chạm top của viewport
            scrub: true,
          },
        }
      );
    }

    // Tự động ẩn/hiện header khi cuộn
    let headerEl = document.getElementById("main-header");
    if (headerEl) {
      ScrollTrigger.create({
        start: "top -100",
        end: 99999,
        onUpdate: (self) => {
          if (self.direction === -1) {
            // Cuộn lên -> hiện
            headerEl.style.transform = "translateY(0%)";
          } else if (self.direction === 1) {
            // Cuộn xuống -> ẩn
            headerEl.style.transform = "translateY(-100%)";
          }
        }
      });
    }
  }
});
