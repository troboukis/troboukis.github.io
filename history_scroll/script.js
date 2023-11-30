function setOpacity(image, opacity, duration) {
    image.style.transition = `opacity ${duration}ms ease`;
    image.style.opacity = opacity;
}

function updateActiveImage() {
    const sections = document.querySelectorAll('.scroll-section');
    const scrollPosition = window.pageYOffset;
    const img1 = document.getElementById('img1');
    const img2 = document.getElementById('img2');
    const img3 = document.getElementById('img3');

    sections.forEach(section => {
        if (section.offsetTop <= scrollPosition + window.innerHeight / 2) {
            if (section.id === 'section1' || section.id === 'section2') {
                setOpacity(img1, 1, 1000); // Fade in over 1 second
                setOpacity(img2, 0, 500); // Fade out quicker
                setOpacity(img3, 0, 500);
            } else if (section.id === 'section3' || section.id === 'section4' || section.id === 'section5') {
                setOpacity(img1, 0, 500);
                setOpacity(img2, 1, 1000);
                setOpacity(img3, 0, 500);
            } else if (section.id >= 'section6' && section.id <= 'section9') {
                setOpacity(img1, 0, 500);
                setOpacity(img2, 0, 500);
                setOpacity(img3, 1, 1000);
            }
        }
    });
}

// Initialize on page load
window.addEventListener('load', updateActiveImage);
// Update on scroll
window.addEventListener('scroll', updateActiveImage);
