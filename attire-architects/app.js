(() => {
  const root = document.querySelector('[data-wardrobe-carousel]');
  if (!root) return;

  const siteConfig = window.ATTIRE_SITE_CONFIG || {};
  const contactConfig = siteConfig.contact || {};
  document.querySelectorAll('[data-contact-email]').forEach((link) => {
    const subject = link.dataset.contactEmailSubject;
    if (contactConfig.email) {
      link.href = `mailto:${contactConfig.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      if (link.hasAttribute('data-contact-email-label')) link.textContent = contactConfig.email;
    }
  });
  document.querySelectorAll('[data-contact-facebook]').forEach((link) => {
    if (contactConfig.facebook) link.href = contactConfig.facebook;
  });

  const stage = root.querySelector('[data-wardrobe-stage]');
  const models = [...root.querySelectorAll('[data-model-look]')];
  const cards = [...root.querySelectorAll('[data-garment-card]')];
  const collection = Array.isArray(window.ATTIRE_COLLECTION) ? window.ATTIRE_COLLECTION : [];
  const collectionByCode = new Map(collection.map((item) => [item.code, item]));
  const previous = root.querySelector('[data-wardrobe-prev]');
  const next = root.querySelector('[data-wardrobe-next]');
  const toggle = root.querySelector('[data-wardrobe-toggle]');
  const status = root.querySelector('[data-wardrobe-status]');
  const instructionLabel = root.querySelector('[data-wardrobe-instruction-label]');
  const instructionCopy = root.querySelector('[data-wardrobe-instruction-copy]');
  const viewSwitcher = root.querySelector('[data-view-switcher]');
  const viewButtons = [...root.querySelectorAll('[data-model-view-button]')];
  const spinPlayButton = root.querySelector('[data-spin-play]');
  const spinViewer = root.querySelector('[data-spin-viewer]');
  const spinLayers = spinViewer ? [...spinViewer.querySelectorAll('[data-spin-layer]')] : [];
  const spinFrameStatus = spinViewer?.querySelector('[data-spin-frame-status]');
  const lookStory = root.querySelector('[data-look-story]');
  const lookStoryCode = lookStory?.querySelector('[data-look-story-code]');
  const lookStoryTitle = lookStory?.querySelector('[data-look-story-title]');
  const lookStorySpecial = lookStory?.querySelector('[data-look-story-special]');
  const lookStoryMood = lookStory?.querySelector('[data-look-story-mood]');
  const lookStoryOccasions = lookStory?.querySelector('[data-look-story-occasions]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 4500;
  const manualHold = 12000;
  const spinDesign = collectionByCode.get('AA-10');
  const spinFrameCount = Number(spinDesign?.spin?.frameCount || spinViewer?.dataset.spinFrames || 0);
  const spinFramePattern = spinDesign?.spin?.framePattern || 'assets/v5-aa-10-spin-transparent/frame-{index}.png';
  const spinFrameSources = Array.from(
    { length: spinFrameCount },
    (_, index) => spinFramePattern.replace('{index}', String(index).padStart(2, '0')),
  );
  const spinFrameNames = [
    'Front view',
    'Slight right view',
    'Right three-quarter view',
    'Right side view',
    'Back three-quarter view',
    'Near-back view',
    'Full back view',
    'Left back three-quarter view',
    'Left side view',
    'Left three-quarter view',
    'Slight left view',
    'Front return view',
  ];
  const spinTimeline = [0, 1, 2, 3, 4, 5, 6, 6, 6, 7, 8, 9, 10, 11];

  let activeIndex = Math.max(0, models.findIndex((model) => model.dataset.code === 'AA-10'));
  let timer = 0;
  let isPaused = false;
  let dragStartX = 0;
  let dragging = false;
  let isHovering = false;
  let isScrolling = false;
  let scrollTimer = 0;
  let activeView = 'front';
  let manualHoldUntil = 0;
  let isSpinPlaying = false;
  let spinTimer = 0;
  let spinFrame = 0;
  let activeSpinLayer = 0;
  let isSpinDragging = false;
  let spinDragStartX = 0;
  let spinDragStartFrame = 0;

  const mod = (value, size) => ((value % size) + size) % size;

  models.forEach((model, index) => {
    const item = collectionByCode.get(model.dataset.code);
    if (!item) return;
    model.dataset.name = item.name;
    model.dataset.accent = item.accent;
    const frontImage = model.querySelector('[data-model-view="front"]');
    if (frontImage) {
      frontImage.src = item.assets.model;
      frontImage.alt = item.assets.alt;
    }
    const card = cards[index];
    if (card) {
      card.setAttribute('aria-label', `Select ${item.code} ${item.name}`);
      const cardImage = card.querySelector('img');
      const cardCode = card.querySelector('span');
      if (cardImage) cardImage.src = item.assets.cutout;
      if (cardCode) cardCode.textContent = item.code;
    }
  });

  spinFrameSources.forEach((source) => {
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = source;
  });

  const relativeIndex = (index) => {
    let relative = mod(index - activeIndex, cards.length);
    if (relative >= cards.length / 2) relative -= cards.length;
    return relative;
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = 0;
    if (
      isPaused ||
      reducedMotion.matches ||
      document.hidden ||
      isHovering ||
      isScrolling ||
      isSpinPlaying ||
      activeView === 'spin'
    ) return;
    const remainingHold = Math.max(0, manualHoldUntil - Date.now());
    timer = window.setTimeout(() => selectLook(activeIndex + 1), Math.max(interval, remainingHold));
  };

  const renderOrbit = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    cards.forEach((card, index) => {
      const relative = relativeIndex(index);
      const distance = Math.abs(relative);
      const horizontalStep = Math.min(width * 0.195, 150);
      const x = relative * horizontalStep;
      const y = height * (0.875 + (Math.min(distance, 2) * 0.012));
      const scale = distance === 0 ? 0.92 : Math.max(0.46, 0.76 - ((distance - 1) * 0.14));
      const opacity = distance === 0 ? 1 : Math.max(0.08, 0.72 - ((distance - 1) * 0.28));
      const selected = index === activeIndex;

      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = selected ? '20' : String(Math.max(2, 9 - (distance * 2)));
      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      card.classList.toggle('is-active', selected);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
      card.tabIndex = Math.abs(relative) <= 2 ? 0 : -1;
    });
  };

  const updateSpinStatus = () => {
    if (!spinViewer || activeView !== 'spin') return;
    const selectedModel = models[activeIndex];
    const frameName = spinFrameNames[spinFrame] || `Frame ${spinFrame + 1}`;
    spinViewer.setAttribute('aria-valuenow', String(spinFrame + 1));
    spinViewer.setAttribute('aria-valuetext', frameName);
    if (spinFrameStatus) {
      spinFrameStatus.textContent = `${frameName}. Frame ${spinFrame + 1} of ${spinFrameCount}.`;
    }
    const mode = isSpinPlaying ? 'Twirl playing' : `Drag to turn · ${frameName}`;
    status.textContent = `${selectedModel.dataset.code} · ${selectedModel.dataset.name} · ${mode}`;
  };

  const setSpinFrame = (target, { crossfade = false } = {}) => {
    if (!spinFrameCount || spinLayers.length < 2) return;
    const nextFrame = mod(target, spinFrameCount);
    const nextSource = spinFrameSources[nextFrame];

    if (crossfade && !reducedMotion.matches && nextFrame !== spinFrame) {
      const nextLayerIndex = 1 - activeSpinLayer;
      const currentLayer = spinLayers[activeSpinLayer];
      const nextLayer = spinLayers[nextLayerIndex];
      nextLayer.src = nextSource;
      nextLayer.classList.add('is-visible');
      currentLayer.classList.remove('is-visible');
      activeSpinLayer = nextLayerIndex;
    } else {
      const currentLayer = spinLayers[activeSpinLayer];
      const otherLayer = spinLayers[1 - activeSpinLayer];
      currentLayer.src = nextSource;
      currentLayer.classList.add('is-visible');
      otherLayer.classList.remove('is-visible');
    }

    spinFrame = nextFrame;
    updateSpinStatus();
  };

  const renderModelView = () => {
    const selectedModel = models[activeIndex];
    const availableViews = [...selectedModel.querySelectorAll('[data-model-view]')]
      .map((view) => view.dataset.modelView);
    const hasSpin = availableViews.includes('spin');

    if (!availableViews.includes(activeView)) activeView = 'front';

    models.forEach((model, modelIndex) => {
      model.querySelectorAll('[data-model-view]').forEach((view) => {
        view.hidden = modelIndex !== activeIndex || view.dataset.modelView !== activeView;
      });
    });

    viewSwitcher.hidden = !hasSpin;
    viewSwitcher.setAttribute('aria-label', `${selectedModel.dataset.code} motion view`);
    viewButtons.forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.modelViewButton === activeView ? 'true' : 'false');
    });
    spinPlayButton?.setAttribute('aria-pressed', isSpinPlaying ? 'true' : 'false');

    root.classList.toggle('is-spin-view', hasSpin && activeView === 'spin');
    if (hasSpin && activeView === 'spin') {
      updateSpinStatus();
    } else {
      const viewLabel = hasSpin ? ' · Front' : '';
      status.textContent = `${selectedModel.dataset.code} · ${selectedModel.dataset.name}${viewLabel}`;
    }
  };

  const stopSpin = ({ resetFrame = true } = {}) => {
    window.clearTimeout(spinTimer);
    spinTimer = 0;
    isSpinPlaying = false;
    root.classList.remove('is-spin-playing');
    spinPlayButton?.setAttribute('aria-pressed', 'false');
    if (resetFrame) setSpinFrame(0);
  };

  const finishSpin = () => {
    stopSpin();
    activeView = 'front';
    renderModelView();
    schedule();
  };

  const playSpin = () => {
    if (!spinViewer || reducedMotion.matches) {
      selectView('spin');
      return;
    }

    stopSpin({ resetFrame: false });
    activeView = 'spin';
    isSpinPlaying = true;
    root.classList.add('is-spin-playing');
    setSpinFrame(0);
    renderModelView();

    let step = 0;
    const advance = () => {
      if (!isSpinPlaying) return;
      const frame = spinTimeline[step];
      setSpinFrame(frame, { crossfade: step > 0 });
      step += 1;
      if (step >= spinTimeline.length) {
        spinTimer = window.setTimeout(finishSpin, 420);
        return;
      }
      spinTimer = window.setTimeout(advance, frame === 6 ? 360 : 230);
    };
    advance();
  };

  const renderSelection = () => {
    const selectedModel = models[activeIndex];
    const selectedDesign = collectionByCode.get(selectedModel.dataset.code);
    models.forEach((model, index) => {
      const selected = index === activeIndex;
      model.classList.toggle('is-active', selected);
      model.setAttribute('aria-hidden', selected ? 'false' : 'true');
    });

    const accent = selectedDesign?.accent || selectedModel.dataset.accent;
    root.style.setProperty('--look-accent', accent);
    if (lookStory && selectedDesign?.story) {
      lookStory.style.setProperty('--story-accent', accent);
      lookStoryCode.textContent = selectedDesign.code;
      lookStoryTitle.textContent = selectedDesign.story.title;
      lookStorySpecial.textContent = selectedDesign.story.special;
      lookStoryMood.textContent = selectedDesign.story.mood;
      lookStoryOccasions.textContent = selectedDesign.story.occasions;
    }
    if (selectedDesign) {
      instructionLabel.textContent = selectedDesign.spin
        ? `${selectedDesign.code} · Interactive view`
        : `${selectedDesign.code} · Design view`;
      instructionCopy.textContent = selectedDesign.spin
        ? 'Use Drag view for precise control, or Play twirl to see the full movement.'
        : 'Use the garment row to compare this silhouette with the collection.';
    }
    renderModelView();
    renderOrbit();
  };

  const selectLook = (target, restart = true) => {
    const nextIndex = mod(target, models.length);
    stopSpin();
    if (nextIndex !== activeIndex) activeView = 'front';
    activeIndex = nextIndex;
    renderSelection();
    if (restart) schedule();
  };

  const selectView = (view) => {
    const selectedModel = models[activeIndex];
    if (!selectedModel.querySelector(`[data-model-view="${view}"]`)) return;
    stopSpin({ resetFrame: view !== 'spin' });
    activeView = view;
    if (view === 'spin') setSpinFrame(0);
    renderModelView();
    schedule();
  };

  const setPaused = (paused) => {
    isPaused = paused;
    root.classList.toggle('is-paused', isPaused);
    toggle.textContent = isPaused ? 'Resume automatic rotation' : 'Pause automatic rotation';
    schedule();
  };

  const holdManualSelection = () => {
    manualHoldUntil = Date.now() + manualHold;
  };

  previous.addEventListener('click', () => {
    holdManualSelection();
    selectLook(activeIndex - 1);
  });
  next.addEventListener('click', () => {
    holdManualSelection();
    selectLook(activeIndex + 1);
  });
  toggle.addEventListener('click', () => setPaused(!isPaused));
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      holdManualSelection();
      selectLook(Number(card.dataset.index));
    });
  });
  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      holdManualSelection();
      selectView(button.dataset.modelViewButton);
    });
  });
  spinPlayButton?.addEventListener('click', () => {
    holdManualSelection();
    playSpin();
  });

  spinViewer?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.stopPropagation();
    holdManualSelection();
    stopSpin({ resetFrame: false });
    activeView = 'spin';
    isSpinDragging = true;
    spinDragStartX = event.clientX;
    spinDragStartFrame = spinFrame;
    spinViewer.classList.add('is-scrubbing');
    spinViewer.setPointerCapture(event.pointerId);
    renderModelView();
  });

  spinViewer?.addEventListener('pointermove', (event) => {
    if (!isSpinDragging) return;
    const pixelsPerFrame = Math.max(20, Math.min(34, spinViewer.clientWidth / spinFrameCount));
    const delta = event.clientX - spinDragStartX;
    const frameDelta = Math.round(delta / pixelsPerFrame);
    setSpinFrame(spinDragStartFrame - frameDelta);
  });

  const endSpinDrag = (event) => {
    if (!isSpinDragging || !spinViewer) return;
    isSpinDragging = false;
    spinViewer.classList.remove('is-scrubbing');
    if (spinViewer.hasPointerCapture(event.pointerId)) spinViewer.releasePointerCapture(event.pointerId);
    updateSpinStatus();
  };

  spinViewer?.addEventListener('pointerup', endSpinDrag);
  spinViewer?.addEventListener('pointercancel', endSpinDrag);
  spinViewer?.addEventListener('keydown', (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    holdManualSelection();
    stopSpin({ resetFrame: false });
    if (event.key === 'ArrowLeft') setSpinFrame(spinFrame - 1);
    if (event.key === 'ArrowRight') setSpinFrame(spinFrame + 1);
    if (event.key === 'Home') setSpinFrame(0);
    if (event.key === 'End') setSpinFrame(6);
  });

  root.addEventListener('pointerenter', () => {
    isHovering = true;
    schedule();
  });

  root.addEventListener('pointerleave', () => {
    isHovering = false;
    schedule();
  });

  stage.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-garment-card], [data-spin-viewer]')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    dragStartX = event.clientX;
    root.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    const delta = event.clientX - dragStartX;
    dragging = false;
    root.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (Math.abs(delta) >= 38) selectLook(activeIndex + (delta < 0 ? 1 : -1));
  });

  stage.addEventListener('pointercancel', (event) => {
    dragging = false;
    root.classList.remove('is-dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  });

  stage.addEventListener('dragstart', (event) => event.preventDefault());
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectLook(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectLook(activeIndex + 1);
    }
    if (event.code === 'Space' && !reducedMotion.matches) {
      event.preventDefault();
      setPaused(!isPaused);
    }
  });

  reducedMotion.addEventListener?.('change', () => {
    root.classList.toggle('is-reduced', reducedMotion.matches);
    toggle.hidden = reducedMotion.matches;
    if (spinPlayButton) spinPlayButton.hidden = reducedMotion.matches;
    if (reducedMotion.matches) {
      stopSpin({ resetFrame: false });
      setPaused(true);
    } else {
      setPaused(false);
    }
    renderSelection();
  });

  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('scroll', () => {
    isScrolling = true;
    schedule();
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      isScrolling = false;
      schedule();
    }, 350);
  }, { passive: true });
  window.addEventListener('resize', () => window.requestAnimationFrame(renderOrbit), { passive: true });
  root.classList.toggle('is-reduced', reducedMotion.matches);
  toggle.hidden = reducedMotion.matches;
  if (spinPlayButton) spinPlayButton.hidden = reducedMotion.matches;
  setSpinFrame(0);
  renderSelection();
  schedule();
})();
