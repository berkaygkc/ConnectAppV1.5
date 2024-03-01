var topSpacing;
const stickyEl = $(".sticky-element");

// Set topSpacing if the navbar is fixed
if (Helpers.isNavbarFixed()) {
    topSpacing = $(".layout-navbar").height() + 7;
} else {
    topSpacing = 0;
}

// sticky element init (Sticky Layout)
if (stickyEl.length) {
    stickyEl.sticky({
        topSpacing: topSpacing,
        zIndex: 9,
    });
}
