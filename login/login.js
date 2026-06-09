document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('loginForm');
  const submitBtn   = document.getElementById('submitBtn');
  const errorBanner = document.getElementById('errorBanner');
  const togglePw    = document.getElementById('togglePw');
  const eyeIcon     = document.getElementById('eyeIcon');
  const passInput   = document.getElementById('password');
  const userInput   = document.getElementById('username');

  let pwVisible = false;
  togglePw.addEventListener('click', () => {
    pwVisible = !pwVisible;
    passInput.type = pwVisible ? 'text' : 'password';
    eyeIcon.innerHTML = pwVisible
      ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });

  [userInput, passInput].forEach(el => {
    el.addEventListener('input', () => errorBanner.classList.remove('show'));
  });

  submitBtn.addEventListener('click', function(e) {
    const rect   = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    ripple.className  = 'ripple';
    ripple.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  form.addEventListener('submit', (e) => {
    const user = userInput.value.trim();
    const pass = passInput.value.trim();
    if (!user || !pass) {
      e.preventDefault();
      errorBanner.querySelector('span:last-child').textContent = 'Completa todos los campos.';
      errorBanner.classList.add('show');
      submitBtn.classList.add('shake');
      submitBtn.addEventListener('animationend', () => submitBtn.classList.remove('shake'), { once: true });
      return;
    }
    submitBtn.classList.add('loading');
  });
});
