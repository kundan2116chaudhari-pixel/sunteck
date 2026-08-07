/* ==========================================================================
   LOCATE HOMES — APPLICATION JAVASCRIPT
   Handles Lenis Smooth Scroll, GSAP Animations, Stat Counters, Video Rail, 
   Process Hover Crossfade & Parallax Effects.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP Plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ------------------------------------------------------------------------
  // 1. Initialize Lenis Smooth Scroll
  // ------------------------------------------------------------------------
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', () => {
        ScrollTrigger.update();
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  // Recalculate ScrollTrigger measurements when images or window load
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  // Listen to all image loads to prevent layout jumps / breaks
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete) {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    } else {
      img.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    }
  });

  // Smooth Anchor Navigation Handling with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -70, duration: 1.0 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 2. Preloader Animation (0% -> 100% Counter & Hero Reveal)
  // ------------------------------------------------------------------------
  const preloader = document.getElementById('preloader');
  const preloaderNum = document.getElementById('preloader-num') || document.getElementById('loader-percent');

  let count = { val: 0 };

  if (preloader) {
    if (preloaderNum) {
      gsap.to(count, {
        val: 100,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const rounded = Math.floor(count.val);
          preloaderNum.textContent = rounded;
        },
        onComplete: () => {
          // Fade out preloader overlay
          preloader.classList.add('fade-out');

          // Trigger Hero entrance animation
          animateHeroEntrance();

          // Initialize ScrollTrigger reveals after preloader finishes
          initScrollReveals();

          // Recalculate layout metrics after preloader hides
          if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => ScrollTrigger.refresh(), 400);
          }
        }
      });
    } else {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        animateHeroEntrance();
        initScrollReveals();
      }, 500);
    }
  } else {
    animateHeroEntrance();
    initScrollReveals();
  }

  // ------------------------------------------------------------------------
  // 3. Hero Entrance GSAP Animation
  // ------------------------------------------------------------------------
  function animateHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-top-controls', 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1 }
    )
    .fromTo('#hero-headline', 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.1 }, 
      '-=0.7'
    )
    .fromTo('#hero-subcopy', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1 }, 
      '-=0.8'
    )
    .fromTo('#hero-cta', 
      { y: 20, opacity: 0, scale: 0.95 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.9 }, 
      '-=0.7'
    )
    .fromTo('.hero-scroll-indicator', 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.8 }, 
      '-=0.5'
    );
  }

  // ------------------------------------------------------------------------
  // 4. Header Scroll Shadow Transition
  // ------------------------------------------------------------------------
  const header = document.getElementById('main-header');
  const heroSection = document.getElementById('hero');

  if (header && heroSection && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'bottom 80px',
      onEnter: () => header.classList.add('is-scrolled'),
      onLeaveBack: () => header.classList.remove('is-scrolled'),
    });
  }

  // ------------------------------------------------------------------------
  // 5. Adaptive Mobile vs Desktop Hero Video Switcher
  // ------------------------------------------------------------------------
  const heroVideo = document.getElementById('hero-video-buy');
  const heroSource = document.getElementById('hero-video-src');

  if (heroVideo && heroSource) {
    const mobileSrc = heroVideo.getAttribute('data-mobile-src');
    const desktopSrc = heroVideo.getAttribute('data-desktop-src');

    function updateHeroVideoSource() {
      const isMobile = window.innerWidth <= 768;
      const targetSrc = isMobile ? mobileSrc : desktopSrc;

      if (targetSrc && heroSource.getAttribute('src') !== targetSrc) {
        heroSource.src = targetSrc;
        heroVideo.src = targetSrc;
        heroVideo.load();
        heroVideo.play().catch(() => {});
      }
    }

    updateHeroVideoSource();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHeroVideoSource, 250);
    });
  }

  // ------------------------------------------------------------------------
  // 6. Mobile Overlay Menu Toggle
  // ------------------------------------------------------------------------
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileCloseBtn = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-active');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.mobile-nav-link', 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.2 }
      );
    }
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openMobileMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ------------------------------------------------------------------------
  // 7. Global ScrollReveals (IntersectionObserver + GSAP) & Stat Counters
  // ------------------------------------------------------------------------
  function initScrollReveals() {
    // IntersectionObserver for [data-reveal] & [data-line-reveal] (The Curve Spec)
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('[data-reveal], .fade-up, .line-reveal-wrap').forEach(el => {
        revealObserver.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal], .fade-up, .line-reveal-wrap').forEach(el => {
        el.classList.add('is-revealed');
      });
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Staggered Fade-Up Elements
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach((el) => {
      gsap.fromTo(el,
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Stat Counters Count-Up Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((counter) => {
      const targetVal = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = targetVal % 1 !== 0;

      gsap.fromTo(counter, 
        { innerText: 0 },
        {
          innerText: targetVal,
          duration: 2.2,
          ease: 'power2.out',
          snap: { innerText: isDecimal ? 0.1 : 1 },
          scrollTrigger: {
            trigger: counter,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          onUpdate: function() {
            if (isDecimal) {
              counter.innerText = parseFloat(counter.innerText).toFixed(1);
            } else {
              counter.innerText = Math.floor(counter.innerText);
            }
          }
        }
      );
    });

    // Contact Parallax Background Image
    const contactBg = document.querySelector('#contact-parallax-bg img');
    if (contactBg) {
      gsap.to(contactBg, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  // ------------------------------------------------------------------------
  // 8. Location Videos Rail (Arrow Navigation, Drag-to-Scroll & Progress Bar)
  // ------------------------------------------------------------------------
  const videoRail = document.getElementById('video-rail');
  const railProgressBar = document.getElementById('rail-progress-bar');
  const railPrevBtn = document.getElementById('rail-prev-btn');
  const railNextBtn = document.getElementById('rail-next-btn');

  if (videoRail) {
    let currentTranslate = 0;
    if (railPrevBtn) {
      railPrevBtn.addEventListener('click', () => {
        videoRail.style.animationPlayState = 'paused';
        currentTranslate += 340;
        if (currentTranslate > 0) currentTranslate = 0;
        videoRail.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
      });
    }

    if (railNextBtn) {
      railNextBtn.addEventListener('click', () => {
        videoRail.style.animationPlayState = 'paused';
        currentTranslate -= 340;
        videoRail.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
      });
    }

    // Video Hover Autoplay in Rail
    const videoCards = document.querySelectorAll('.video-card-916');
    videoCards.forEach((card) => {
      const video = card.querySelector('.rail-video');
      if (video) {
        card.addEventListener('mouseenter', () => {
          video.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          video.pause();
        });
      }
    });
  }

  // ------------------------------------------------------------------------
  // 9. Sunteck Gallery Rail & Controls
  // ------------------------------------------------------------------------
  const sunteckGalleryRail = document.getElementById('sunteck-gallery-rail');
  const sunteckGalleryProgress = document.getElementById('sunteck-gallery-progress');
  const sunteckPrevBtn = document.getElementById('sunteck-prev-btn');
  const sunteckNextBtn = document.getElementById('sunteck-next-btn');

  if (sunteckGalleryRail) {
    let isMouseDown = false;
    let startX, scrollLeft;

    if (sunteckPrevBtn) {
      sunteckPrevBtn.addEventListener('click', () => {
        sunteckGalleryRail.scrollBy({ left: -360, behavior: 'smooth' });
      });
    }

    if (sunteckNextBtn) {
      sunteckNextBtn.addEventListener('click', () => {
        sunteckGalleryRail.scrollBy({ left: 360, behavior: 'smooth' });
      });
    }

    sunteckGalleryRail.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      sunteckGalleryRail.classList.add('is-dragging');
      startX = e.pageX - sunteckGalleryRail.offsetLeft;
      scrollLeft = sunteckGalleryRail.scrollLeft;
    });

    const stopDragging = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      sunteckGalleryRail.classList.remove('is-dragging');
    };

    sunteckGalleryRail.addEventListener('mouseleave', stopDragging);
    sunteckGalleryRail.addEventListener('mouseup', stopDragging);

    sunteckGalleryRail.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - sunteckGalleryRail.offsetLeft;
      const walk = (x - startX) * 1.8;
      sunteckGalleryRail.scrollLeft = scrollLeft - walk;
    });

    sunteckGalleryRail.addEventListener('scroll', () => {
      const maxScroll = sunteckGalleryRail.scrollWidth - sunteckGalleryRail.clientWidth;
      if (maxScroll > 0 && sunteckGalleryProgress) {
        const percentage = (sunteckGalleryRail.scrollLeft / maxScroll) * 100;
        sunteckGalleryProgress.style.width = Math.max(15, percentage) + '%';
      }
    });
  }

  // ------------------------------------------------------------------------
  // 10. 360° Tour Iframe Embed & Fallback Detection
  // ------------------------------------------------------------------------
  const tourIframe = document.getElementById('fisheye-360-iframe');
  const tourFallbackCard = document.getElementById('tour-fallback-card');

  if (tourIframe && tourFallbackCard) {
    let iframeLoaded = false;

    tourIframe.addEventListener('load', () => {
      iframeLoaded = true;
    });

    // Check after 3 seconds if iframe failed or was blocked by X-Frame-Options
    setTimeout(() => {
      try {
        if (!iframeLoaded || !tourIframe.contentWindow || tourIframe.contentWindow.location.href === 'about:blank') {
          // Display fallback banner with direct launch button
          tourFallbackCard.style.display = 'block';
        }
      } catch (e) {
        // Cross-origin restriction triggered (expected if embedding allowed or blocked cross-domain)
        // If tour works inside iframe, keep iframe; if broken, fallback displays.
      }
    }, 3000);
  }

  // Sunteck Contact Parallax Background Image
  const sunteckContactBg = document.querySelector('#sunteck-contact-bg img');
  if (sunteckContactBg && typeof ScrollTrigger !== 'undefined') {
    gsap.to(sunteckContactBg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#sunteck-enquiry',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // ------------------------------------------------------------------------
  // 9. Process Section Hover Background Crossfade (Gerax Signature)
  // ------------------------------------------------------------------------
  const processItems = document.querySelectorAll('.process-item');
  const processBgImgs = document.querySelectorAll('.process-bg-img');

  processItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const index = item.getAttribute('data-index');

      processBgImgs.forEach((bg) => {
        if (bg.getAttribute('data-index') === index) {
          bg.classList.add('active');
        } else {
          bg.classList.remove('active');
        }
      });
    });
  });

  // ------------------------------------------------------------------------
  // 11. Full-Screen Video Lightbox Modal with Audio (The Curve Spec)
  // ------------------------------------------------------------------------
  const lightboxModal = document.getElementById('video-lightbox');
  const lightboxPlayer = document.getElementById('lightbox-player');
  const lightboxSource = document.getElementById('lightbox-source');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  function openVideoLightbox(videoSrc, title, tag) {
    if (!lightboxModal || !lightboxPlayer || !lightboxSource) return;

    const unmuteBtn = document.getElementById('lightbox-unmute-btn');

    // Reset video player state
    lightboxPlayer.pause();
    lightboxPlayer.removeAttribute('src');
    lightboxSource.src = videoSrc;
    lightboxPlayer.src = videoSrc;
    lightboxPlayer.load();

    // Enable full audio
    lightboxPlayer.muted = false;
    lightboxPlayer.volume = 1.0;

    if (lightboxTitle) lightboxTitle.textContent = title || 'Property Walkthrough';
    if (lightboxTag) lightboxTag.textContent = tag || 'PROJECT SHOWCASE';

    lightboxModal.classList.add('is-open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (unmuteBtn) unmuteBtn.style.display = 'none';

    // Auto-play video with audio
    const playPromise = lightboxPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        lightboxPlayer.muted = false;
        lightboxPlayer.volume = 1.0;
      }).catch((err) => {
        console.warn('Autoplay with sound restricted by browser policy:', err);
        // Play muted initially but show bright UNMUTE overlay button
        lightboxPlayer.muted = true;
        lightboxPlayer.play();
        if (unmuteBtn) {
          unmuteBtn.style.display = 'flex';
        }
      });
    }
  }

  function closeVideoLightbox() {
    if (!lightboxModal || !lightboxPlayer) return;

    lightboxPlayer.pause();
    lightboxPlayer.currentTime = 0;
    lightboxPlayer.removeAttribute('src');
    if (lightboxSource) lightboxSource.src = '';
    lightboxModal.classList.remove('is-open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Handle Unmute Overlay Button Click
  const unmuteBtn = document.getElementById('lightbox-unmute-btn');
  if (unmuteBtn) {
    unmuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lightboxPlayer) {
        lightboxPlayer.muted = false;
        lightboxPlayer.volume = 1.0;
        unmuteBtn.style.display = 'none';
      }
    });
  }

  // Attach click listener to video cards and play buttons
  document.querySelectorAll('[data-action="lightbox"], .video-card-169, .video-card-916').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-link[href^="sunteck"]')) return;

      const videoSourceEl = card.querySelector('video source');
      const videoSrc = card.getAttribute('data-video-src') || (videoSourceEl ? videoSourceEl.src : '');
      const titleEl = card.querySelector('.card-title-169, .card-title');
      const title = card.getAttribute('data-video-title') || card.getAttribute('data-title') || (titleEl ? titleEl.textContent : 'Property Walkthrough');
      const tagEl = card.querySelector('.micro-label, .card-location-tag');
      const tag = card.getAttribute('data-video-tag') || card.getAttribute('data-tag') || (tagEl ? tagEl.textContent : 'PROJECT SHOWCASE');

      if (videoSrc) {
        e.preventDefault();
        openVideoLightbox(videoSrc, title, tag);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeVideoLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeVideoLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('is-open')) {
      closeVideoLightbox();
    }
  });

  // ------------------------------------------------------------------------
  // 12. Sunteck E-Brochure Pop-Up Modal, Auto 10s Timer, Web3Forms & PDF Download
  // ------------------------------------------------------------------------
  const popupModal = document.getElementById('enquiry-popup-modal');
  const popupCloseBtn = document.getElementById('popup-close');
  const popupBackdrop = document.getElementById('popup-backdrop');
  const popupForm = document.getElementById('popup-enquiry-form');
  const popupStatus = document.getElementById('popup-form-status');
  let popupTimer = null;
  let hasSubmittedForm = false;

  function openEnquiryModal() {
    if (!popupModal || hasSubmittedForm) return;
    popupModal.classList.add('is-open');
    popupModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeEnquiryModal() {
    if (!popupModal) return;
    popupModal.classList.remove('is-open');
    popupModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Schedule next pop-up in 10 seconds if user hasn't submitted yet
    if (!hasSubmittedForm) {
      clearTimeout(popupTimer);
      popupTimer = setTimeout(openEnquiryModal, 10000);
    }
  }

  // Auto 10-Second Initial Pop-Up Timer
  if (popupModal) {
    popupTimer = setTimeout(openEnquiryModal, 10000);
  }

  if (popupCloseBtn) popupCloseBtn.addEventListener('click', closeEnquiryModal);
  if (popupBackdrop) popupBackdrop.addEventListener('click', closeEnquiryModal);

  // Trigger Pop-up Modal on ALL Brochure / Pricing / Enquiry CTA Buttons
  document.querySelectorAll('a[href*="brochure"], .download-brochure-btn, a[href="#sunteck-enquiry"], .btn-full, .utility-enquire').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.closest('.video-card-169') || btn.classList.contains('btn-video-modal-trigger')) return;
      e.preventDefault();
      openEnquiryModal();
    });
  });

  // Handle Form Submission (Web3Forms API + Instant PDF Download)
  function handleFormSubmit(form, statusEl) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Submitting &amp; Downloading...</span>';
      }

      if (statusEl) {
        statusEl.className = 'form-status-msg';
        statusEl.style.display = 'none';
      }

      const formData = new FormData(form);
      if (!formData.has('access_key')) {
        formData.append('access_key', 'c4517da0-4b38-40bd-b3de-ca3f3905ae1e');
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          hasSubmittedForm = true;
          clearTimeout(popupTimer);

          if (statusEl) {
            statusEl.className = 'form-status-msg success';
            statusEl.textContent = 'Success! Your Sunteck E-Brochure PDF is downloading now...';
          }

          // Trigger automatic PDF download
          const link = document.createElement('a');
          link.href = 'sunteck_brochure.pdf';
          link.download = 'Sunteck_Naigaon_E_Brochure.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          form.reset();

          setTimeout(() => {
            closeEnquiryModal();
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
          }, 3000);
        } else {
          throw new Error(result.message || 'Form submission failed');
        }
      } catch (err) {
        console.error('Submission error:', err);
        // Fallback: Trigger download regardless and notify user
        const link = document.createElement('a');
        link.href = 'sunteck_brochure.pdf';
        link.download = 'Sunteck_Naigaon_E_Brochure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (statusEl) {
          statusEl.className = 'form-status-msg success';
          statusEl.textContent = 'Thank you! Downloading Sunteck E-Brochure PDF...';
        }

        hasSubmittedForm = true;
        clearTimeout(popupTimer);

        setTimeout(() => {
          closeEnquiryModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }, 2500);
      }
    });
  }

  if (popupForm) handleFormSubmit(popupForm, popupStatus);

  const mainForm = document.getElementById('sunteck-lead-form');
  if (mainForm) {
    mainForm.removeAttribute('onsubmit');
    handleFormSubmit(mainForm, null);
  }
});
