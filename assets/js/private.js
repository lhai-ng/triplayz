$(document).ready(function() {

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

    var swiperModel1 = new Swiper('.swiper-model-1', swiperConfig);

    var swiperModel2 = new Swiper('.swiper-model-2', {
        ...swiperConfig,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true, // chạy ngược chiều
        },
    });


});

