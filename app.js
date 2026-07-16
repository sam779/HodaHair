// ============ STATE & DATA ============

let currentPage = 'home';
let currentFilter = 'All';
let lightboxIndex = null;
let formSubmitted = false;

// ============ MODAL ============

function showModal(title, message, type = 'info', onClose = null) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  // Remove all type classes and add the new one
  modal.classList.remove('success', 'error', 'info');
  if (type) {
    modal.classList.add(type);
  }

  modal.classList.remove('hidden');

  // Store callback for when modal closes
  if (onClose) {
    modal.dataset.onClose = onClose;
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');

  // Call any onClose callback
  if (modal.dataset.onClose) {
    const callback = window[modal.dataset.onClose];
    if (typeof callback === 'function') {
      callback();
    }
    delete modal.dataset.onClose;
  }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});

// Gallery data
const galleryData = [
  { cat: 'Bridal', label: '[ BRIDAL — SOFT UPDO ]', ar: '3/4', bg: '#e7dccb', type: 'light' },
  { cat: 'Close-Up Detail', label: '[ DETAIL — PINNED WAVE ]', ar: '1/1', bg: '#211913', type: 'dark' },
  { cat: 'Editorial', label: '[ EDITORIAL — SLEEK ]', ar: '4/5', bg: '#211913', type: 'dark' },
  { cat: 'Event', label: '[ EVENT — HALF-UP GLAM ]', ar: '3/4', bg: '#e7dccb', type: 'light' },
  { cat: 'Bridal', label: '[ BRIDAL — VEIL PLACEMENT ]', ar: '4/5', bg: '#e7dccb', type: 'light' },
  { cat: 'Before / After', label: '[ BEFORE / AFTER — TRANSFORM ]', ar: '1/1', bg: '#211913', type: 'dark' },
  { cat: 'Editorial', label: '[ EDITORIAL — WIND & MOTION ]', ar: '3/4', bg: '#e7dccb', type: 'light' },
  { cat: 'Close-Up Detail', label: '[ DETAIL — BRAID TEXTURE ]', ar: '1/1', bg: '#e7dccb', type: 'light' },
  { cat: 'Event', label: '[ EVENT — HOLLYWOOD WAVE ]', ar: '4/5', bg: '#211913', type: 'dark' },
  { cat: 'Bridal', label: '[ BRIDAL — LOW CHIGNON ]', ar: '3/4', bg: '#e7dccb', type: 'light' },
  { cat: 'Editorial', label: '[ EDITORIAL — HIGH FASHION ]', ar: '4/5', bg: '#211913', type: 'dark' },
  { cat: 'Before / After', label: '[ BEFORE / AFTER — UPSTYLE ]', ar: '1/1', bg: '#e7dccb', type: 'light' },
  { cat: 'Event', label: '[ EVENT — VOLUME BLOWOUT ]', ar: '3/4', bg: '#e7dccb', type: 'light' },
  { cat: 'Close-Up Detail', label: '[ DETAIL — ACCESSORY ]', ar: '1/1', bg: '#211913', type: 'dark' },
  { cat: 'Bridal', label: '[ BRIDAL — ROMANTIC LOOSE ]', ar: '4/5', bg: '#e7dccb', type: 'light' },
];

const signatureServices = [
  { no: '01', title: 'Bridal Hair', desc: 'Timeless, editorial bridal styling built to hold from ceremony to celebration — soft structure, luminous finish.' },
  { no: '02', title: 'Event Hair', desc: 'Red-carpet-ready looks for galas, parties and milestone moments, tailored to your dress and the room.' },
  { no: '03', title: 'Glam Styling', desc: 'High-shine waves, sculpted volume and sleek finishes for the occasions that call for drama.' },
  { no: '04', title: 'Trials & Consultations', desc: 'A private preview session to design, refine and lock your look long before the day itself.' },
];

const services = [
  { no: '01', title: 'Bridal Hair', price: 'From $450', desc: 'A full bridal experience — consultation, design and event-day styling with premium products and long-wear finishing. Bridal party styling arranged alongside.', addons: ['Extensions fitting', 'Veil & accessory placement', 'Bridal party (per person)', 'Early-start surcharge'] },
  { no: '02', title: 'Event Hair', price: 'From $180', desc: 'Occasion styling for galas, parties and celebrations. Polished, photograph-ready looks designed to last the evening.', addons: ['Clip-in extensions', 'Touch-up kit', 'Group booking'] },
  { no: '03', title: 'Trial Sessions', price: 'From $150', desc: 'A dedicated preview to test placement, texture and hold — refined together until the look is exactly right.', addons: ['Additional look', 'Inspiration workup', 'Product plan'] },
  { no: '04', title: 'Photoshoot / Editorial Hair', price: 'From $300 / half-day', desc: 'On-set styling for campaigns, lookbooks and editorial shoots — versatile, direction-led, and fast between looks.', addons: ['Full-day rate', 'Multiple looks', 'On-set standby'] },
  { no: '05', title: 'Special Occasion Styling', price: 'From $160', desc: 'Anniversaries, proms, portraits and every moment worth remembering — styled with the same editorial care.', addons: ['Home visit', 'Coordinated group', 'Accessory styling'] },
];

const processSteps = [
  { no: '01', title: 'Enquiry', desc: 'Send your date, service and vision. Hoda replies personally to confirm availability and next steps.' },
  { no: '02', title: 'Consultation', desc: 'We discuss your look, hair, dress and timings — building a clear plan for the day.' },
  { no: '03', title: 'Preview / Trial', desc: 'A private session to test and perfect the style, so nothing is left to chance.' },
  { no: '04', title: 'Event Day', desc: 'Calm, on-time, on-location styling — designed to hold beautifully from first light to last dance.' },
];

const testimonials = [
  { quote: 'Hoda made me feel like the most elegant version of myself. The style held flawlessly through fourteen hours and every photograph.', name: 'Amira', detail: 'Bride' },
  { quote: 'Editorial, refined, and completely calm on set. Exactly the artist you want in the chair before a shoot.', name: 'Studio Lume', detail: 'Creative Director' },
  { quote: 'From the trial to the day itself, everything was considered. I have never felt more beautiful.', name: 'Sofia', detail: 'Event Client' },
];

const instagram = [
  '[ REEL — UPDO ]',
  '[ POST — VEIL ]',
  '[ DETAIL — WAVE ]',
  '[ EVENT GLAM ]',
  '[ BTS — SET ]',
  '[ EDITORIAL ]'
];

const faqs = [
  { q: 'Do you travel for weddings and events?', a: 'Yes. On-location and destination bookings are welcomed. Travel, accommodation and early-start arrangements are quoted per event once dates and location are confirmed.' },
  { q: 'How far in advance should I book?', a: 'As early as possible — peak wedding dates are often reserved six to twelve months ahead. A date is secured with a booking fee following your enquiry.' },
  { q: 'Is a trial required for bridal bookings?', a: 'A trial is strongly recommended for brides so we can perfect placement, texture and hold together. It can be booked as a standalone session or bundled with your package.' },
  { q: 'Can you style my bridal party too?', a: 'Absolutely. Party styling is arranged alongside your booking and priced per person. Share your numbers in the enquiry so timings can be planned.' },
  { q: 'What is your booking and cancellation policy?', a: 'A booking fee reserves your date and is deducted from the final balance. Full terms and cancellation details are shared with your written quote.' },
];

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
  // Set year in footer
  document.getElementById('yearSpan').textContent = new Date().getFullYear();

  // Render all content
  renderSignatureServices();
  renderLookbookPreview();
  renderTestimonials();
  renderInstagram();
  renderServices();
  renderProcessSteps();
  renderGalleryAndFilters();
  renderFAQs();

  // Setup scroll listener for header
  window.addEventListener('scroll', updateHeaderOnScroll);

  // Setup keyboard listeners for lightbox
  window.addEventListener('keydown', handleKeyboard);

  // Setup inquiry form submission
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', handleInquirySubmit);
  }

  // Initialize
  updateHeaderOnScroll();
});

// ============ NAVIGATION ============

function goToPage(e, page) {
  if (e && e.preventDefault) e.preventDefault();
  changePage(page);
}

function goHome(e) {
  if (e && e.preventDefault) e.preventDefault();
  changePage('home');
}

function changePage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show selected page
  document.getElementById(page).classList.add('active');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  currentPage = page;

  // Reset forms if going to contact or booking
  if (page === 'contact') {
    formSubmitted = false;
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
      inquiryForm.reset();
    }
  }

  if (page === 'booking') {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      const form = bookingSection.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function handleInquirySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.querySelector('input[type="text"]');
  const emailInput = form.querySelector('input[type="email"]');
  const subjectInput = form.querySelectorAll('input[type="text"]')[1];
  const textareaInput = form.querySelector('textarea');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = textareaInput.value.trim();

  if (!name || !email || !subject || !message) {
    showModal('Required Fields', 'Please fill in all fields to send your inquiry.', 'error');
    return;
  }

  // Disable submit button during submission
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch('/api/contact/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit inquiry');
    }

    const result = await response.json();
    showModal('Message Sent!', 'Thank you for reaching out. We will respond to your inquiry within 2 business days.', 'success');
    form.reset();
  } catch (error) {
    console.error('Inquiry submission error:', error);
    showModal('Submission Failed', 'Failed to send your message. Please try again or email us directly.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ============ HEADER SCROLL ============

function updateHeaderOnScroll() {
  const header = document.getElementById('header');
  const isScrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', isScrolled);
}

// ============ RENDERING FUNCTIONS ============

function renderSignatureServices() {
  const container = document.getElementById('signatureServices');
  container.innerHTML = signatureServices.map(s => `
    <article class="service-card">
      <span class="service-card-no">${s.no}</span>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </article>
  `).join('');
}

function renderLookbookPreview() {
  const container = document.getElementById('lookbookPreview');
  // Use first 5 items for preview
  const preview = galleryData.slice(0, 5);

  container.innerHTML = `
    <figure class="gallery-span-5" style="background-color: ${preview[0].bg}; position: relative;">
      <div class="gallery-item-label" style="color: ${preview[0].type === 'dark' ? 'rgba(233,221,201,.45)' : 'rgba(74,58,44,.5)'};">${preview[0].label}</div>
    </figure>
    <div class="gallery-span-7" style="display: grid; grid-template-rows: 1fr 1fr; gap: clamp(10px, 1.4vw, 20px);">
      <figure style="background-color: ${preview[1].bg}; position: relative; overflow: hidden;">
        <div class="gallery-item-label" style="color: ${preview[1].type === 'dark' ? 'rgba(233,221,201,.45)' : 'rgba(74,58,44,.5)'};">${preview[1].label}</div>
      </figure>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(10px, 1.4vw, 20px);">
        <figure style="background-color: ${preview[2].bg}; position: relative;">
          <div class="gallery-item-label" style="color: ${preview[2].type === 'dark' ? 'rgba(233,221,201,.45)' : 'rgba(74,58,44,.5)'};">${preview[2].label}</div>
        </figure>
        <figure style="background-color: ${preview[3].bg}; position: relative;">
          <div class="gallery-item-label" style="color: ${preview[3].type === 'dark' ? 'rgba(233,221,201,.45)' : 'rgba(74,58,44,.5)'};">${preview[3].label}</div>
        </figure>
      </div>
    </div>
  `;
}

function renderTestimonials() {
  const container = document.getElementById('testimonials');
  container.innerHTML = testimonials.map(t => `
    <figure class="testimonial">
      <blockquote>"${t.quote}"</blockquote>
      <figcaption>${t.name}<span> — ${t.detail}</span></figcaption>
    </figure>
  `).join('');
}

function renderInstagram() {
  const container = document.getElementById('instagramFeed');
  container.innerHTML = instagram.map(item => `
    <a href="#" class="instagram-item" onclick="event.preventDefault()">
      <span>${item}</span>
    </a>
  `).join('');
}

function renderServices() {
  const container = document.getElementById('servicesList');
  container.innerHTML = services.map(s => `
    <article class="service-detail">
      <div class="service-detail-info">
        <span class="service-detail-no">${s.no}</span>
        <div>
          <h2 class="service-detail h2">${s.title}</h2>
          <p class="service-detail-price">${s.price}</p>
        </div>
      </div>
      <div>
        <p class="service-detail-desc">${s.desc}</p>
        <p class="service-detail-addons">Add-ons</p>
        <div class="addon-tags">
          ${s.addons.map(a => `<span class="addon-tag">${a}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderProcessSteps() {
  const container = document.getElementById('processSteps');
  container.innerHTML = processSteps.map(p => `
    <div class="process-step">
      <span class="process-step-no">${p.no}</span>
      <div class="process-step-line"></div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>
  `).join('');
}

function renderGalleryAndFilters() {
  // Filters
  const categories = ['All', 'Bridal', 'Event', 'Editorial', 'Close-Up Detail', 'Before / After'];
  const filterContainer = document.getElementById('galleryFilters');
  filterContainer.innerHTML = categories.map(cat => `
    <button class="gallery-filter-btn${currentFilter === cat ? ' active' : ''}" onclick="setFilter('${cat}')">${cat}</button>
  `).join('');

  // Gallery items
  renderGalleryItems();
}

function setFilter(category) {
  currentFilter = category;
  // Update filter buttons
  document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === category);
  });
  // Re-render gallery
  renderGalleryItems();
}

function renderGalleryItems() {
  const filtered = currentFilter === 'All'
    ? galleryData
    : galleryData.filter(item => item.cat === currentFilter);

  const container = document.getElementById('galleryItems');
  container.innerHTML = filtered.map((item, idx) => `
    <figure class="gallery-item" style="break-inside:avoid;margin-bottom:clamp(10px,1.4vw,18px);aspect-ratio:${item.ar};background-color:${item.bg}" onclick="openLightbox(${idx})">
      <div class="gallery-item-label" style="color: ${item.type === 'dark' ? 'rgba(233,221,201,.45)' : 'rgba(74,58,44,.5)'};">${item.label}</div>
    </figure>
  `).join('');
}

function renderFAQs() {
  const container = document.getElementById('faqList');
  let openIndex = null;

  container.innerHTML = faqs.map((faq, idx) => `
    <div class="faq-item">
      <button class="faq-question" onclick="toggleFaq(${idx})">
        <span>${faq.q}</span>
        <span class="faq-icon" id="faq-icon-${idx}">+</span>
      </button>
      <div class="faq-answer" id="faq-answer-${idx}">
        <p>${faq.a}</p>
      </div>
    </div>
  `).join('');
}

function toggleFaq(idx) {
  const answer = document.getElementById(`faq-answer-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);

  // Close all others
  document.querySelectorAll('.faq-answer').forEach((a, i) => {
    if (i !== idx) {
      a.classList.remove('open');
      document.getElementById(`faq-icon-${i}`).classList.remove('open');
    }
  });

  // Toggle current
  answer.classList.toggle('open');
  icon.classList.toggle('open');
}

// ============ LIGHTBOX ============

function openLightbox(idx) {
  lightboxIndex = idx;
  const filtered = currentFilter === 'All'
    ? galleryData
    : galleryData.filter(item => item.cat === currentFilter);

  const item = filtered[idx];
  updateLightbox(item);
  document.getElementById('lightbox').classList.remove('hidden');
}

function updateLightbox(item) {
  document.getElementById('lightboxLabel').textContent = item.label;
  document.getElementById('lightboxCategory').textContent = item.cat;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  lightboxIndex = null;
}

function nextGallery() {
  if (lightboxIndex === null) return;
  const filtered = currentFilter === 'All'
    ? galleryData
    : galleryData.filter(item => item.cat === currentFilter);

  lightboxIndex = (lightboxIndex + 1) % filtered.length;
  updateLightbox(filtered[lightboxIndex]);
}

function prevGallery() {
  if (lightboxIndex === null) return;
  const filtered = currentFilter === 'All'
    ? galleryData
    : galleryData.filter(item => item.cat === currentFilter);

  lightboxIndex = (lightboxIndex - 1 + filtered.length) % filtered.length;
  updateLightbox(filtered[lightboxIndex]);
}

function handleKeyboard(e) {
  if (lightboxIndex === null) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevGallery();
  if (e.key === 'ArrowRight') nextGallery();
}

// ============ CONTACT FORM ============

function handleFormSubmit(e) {
  e.preventDefault();
  formSubmitted = true;
  updateContactFormUI();
}

function updateContactFormUI() {
  const container = document.getElementById('contactFormContainer');
  if (formSubmitted) {
    container.innerHTML = `
      <div class="success-message">
        <p class="success-message-title">Thank you</p>
        <p>Your enquiry is on its way. Hoda will be in touch personally very soon.</p>
      </div>
    `;
  } else {
    location.reload(); // Reload to reset form
  }
}
