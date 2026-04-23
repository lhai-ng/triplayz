$(document).ready(function() {

    // $('.btn-bar').click(function(){
    //     $('.mm-menu').addClass('active');
    // })
    // $('.close-menu').click(function(){
    //     $('.mm-menu').removeClass('active');
    // })

    var swiperConfig = {
        spaceBetween: 16,
        slidesPerView: 5.5,
        loop: true,
        centeredSlides: true,
        speed: 3000,
        allowTouchMove: false,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
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

