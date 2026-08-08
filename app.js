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

  // Trigger Pop-up Modal on Brochure / Pricing / Enquiry CTA Buttons (Excluding submit buttons)
  document.querySelectorAll('a[href*="brochure"], .download-brochure-btn, a[href="#sunteck-enquiry"], a.btn-full, .utility-enquire, .open-enquiry-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.closest('.video-card-169') || btn.classList.contains('btn-video-modal-trigger') || btn.tagName === 'BUTTON' || btn.getAttribute('type') === 'submit') return;
      e.preventDefault();
      openEnquiryModal();
    });
  });

  // Handle Form Submission (Web3Forms API + Instant PDF Download + Luxury Thank You View)
  function handleFormSubmit(form, statusEl) {
    const originalFormHTML = form.innerHTML;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Submitting &amp; Preparing Brochure...</span>';
      }

      const formData = new FormData(form);
      const leadName = (formData.get('name') || '').trim();
      const leadPhone = (formData.get('phone') || '').trim();
      const leadEmail = (formData.get('email') || '').trim();
      const leadConfig = (formData.get('configuration') || '1 BHK / 2 BHK').trim();
      const countryCode = (formData.get('country_code') || '+91').trim();

      // Store lead in browser storage
      try {
        const storedLeads = JSON.parse(localStorage.getItem('sunteck_inquiries') || '[]');
        storedLeads.push({
          name: leadName,
          phone: `${countryCode} ${leadPhone}`,
          email: leadEmail,
          configuration: leadConfig,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('sunteck_inquiries', JSON.stringify(storedLeads));
      } catch (storageErr) {
        console.warn('Storage warning:', storageErr);
      }

      if (!formData.has('access_key')) {
        formData.append('access_key', 'c4517da0-4b38-40bd-b3de-ca3f3905ae1e');
      }

      // Download Sunteck E-Brochure PDF
      const triggerBrochureDownload = () => {
        const link = document.createElement('a');
        link.href = 'sunteck_brochure.pdf';
        link.download = 'Sunteck_Naigaon_E_Brochure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      try {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        }).catch(apiErr => console.warn('Web3Forms background error:', apiErr));
      } catch (err) {
        console.warn('Submission network catch:', err);
      }

      // Mark user as submitted and clear popup timer
      hasSubmittedForm = true;
      clearTimeout(popupTimer);

      // Trigger automatic PDF brochure download
      triggerBrochureDownload();

      // Render Luxury Thank You Screen on the same page
      const displayName = leadName ? leadName.split(' ')[0] : 'Valued Guest';
      
      form.innerHTML = `
        <div class="thank-you-view">
          <div class="thank-you-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 class="thank-you-title serif">Thank You, <span class="lead-name-highlight">${displayName}</span>!</h3>
          <p class="thank-you-subtitle">
            Your inquiry for <strong>Sunteck Naigaon</strong> has been received successfully. Your official <strong>E-Brochure &amp; VIP Pricing Sheet</strong> is downloading now.
          </p>
          <div class="thank-you-card-box">
            <div class="thank-you-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Our Principal Estate Advisor will call you within <strong>15 minutes</strong>.</span>
            </div>
            <div class="thank-you-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Exclusive festive discount pricing &amp; spot booking offers unlocked.</span>
            </div>
          </div>
          <div class="thank-you-actions">
            <a href="https://wa.me/919321815517?text=Hi%2C%20I%20have%20submitted%20an%20inquiry%20for%20Sunteck%20Naigaon%20and%20would%20like%20priority%20VIP%20pricing." target="_blank" rel="noopener" class="btn-whatsapp-direct">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.299.423 2.502 1.144 3.475l-.75 2.742 2.808-.737c.937.512 2.016.806 3.16.807 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.767-5.762-5.787zm3.385 8.167c-.144.405-.837.774-1.17.824-.312.045-.716.074-2.316-.583-1.921-.79-3.14-2.753-3.237-2.882-.096-.128-.787-1.048-.787-1.999 0-.951.498-1.417.674-1.61.176-.192.385-.241.513-.241.128 0 .256.002.368.007.119.006.279-.045.437.334.16.385.545 1.332.593 1.428.048.096.08.209.016.337-.064.128-.096.208-.192.321-.096.112-.203.25-.29.336-.096.096-.196.2-.085.39.112.192.498.822 1.07 1.332.736.656 1.357.86 1.549.956.192.096.32.144.368.224.048.08.048.464-.096.869z"/></svg>
              <span>Chat Directly on WhatsApp</span>
            </a>
            <button type="button" class="btn-secondary-action reset-form-btn">Submit Another Request</button>
          </div>
        </div>
      `;

      // Allow resetting form if user wants to submit another inquiry
      const resetBtn = form.querySelector('.reset-form-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          form.innerHTML = originalFormHTML;
          handleFormSubmit(form, statusEl);
        });
      }
    });
  }

  if (popupForm) handleFormSubmit(popupForm, popupStatus);

  const mainForm = document.getElementById('sunteck-lead-form');
  if (mainForm) {
    const mainStatus = document.getElementById('sunteck-main-status');
    handleFormSubmit(mainForm, mainStatus);
  }
});
