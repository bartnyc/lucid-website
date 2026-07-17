// LucidClaim site — mobile nav + lead capture form
document.addEventListener('DOMContentLoaded', () => {
  const navCheck = document.getElementById('nav-check');
  const menu = document.getElementById('nav-menu');

  if (navCheck && menu) {
    const toggle = document.querySelector('.nav-toggle');

    navCheck.addEventListener('change', () => {
      if (toggle) {
        toggle.setAttribute('aria-label', navCheck.checked ? 'Close navigation menu' : 'Open navigation menu');
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navCheck.checked = false;
      });
    });
  }

  const form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const res = await fetch('api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok && result.ok) {
        window.location.href = 'thank-you.html';
      } else {
        statusEl.textContent = result.error || 'Something went wrong. Please try again.';
        statusEl.className = 'form-status err';
      }
    } catch (err) {
      statusEl.textContent = 'Network error — please try again.';
      statusEl.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request a Demo';
    }
  });
});
