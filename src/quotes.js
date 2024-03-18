let slideIndex = 0; // Start from the first image
showSlides();

function moveSlide(n) {
    slideIndex += n;
    showSlides();
}

function showSlides() {
    let slides = document.getElementsByClassName("carousel-image");
    if (slideIndex >= slides.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }

    let offset = -slideIndex * 100; // Each slide moves 100% of the view to the left/right
    let carouselImages = document.querySelector(".carousel-images");
    carouselImages.style.transform = `translateX(${offset}%)`;
}

