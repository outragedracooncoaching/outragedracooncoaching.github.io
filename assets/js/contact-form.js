// Contact form: posts JSON to a Google Apps Script web app (see apps-script/contact-form.gs).
// No custom headers, so the request goes as text/plain and skips the CORS preflight.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var EMAIL = 'outragedracooncoaching@gmail.com';
  var MIN_MS = 3000;
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();
  var button = form.querySelector('button[type="submit"]');
  var errorBox = document.getElementById('cf-error');
  var status = document.getElementById('cf-status');
  var done = document.getElementById('cf-done');
  var slow = document.getElementById('cf-slow');
  var slowTimer = null;
  var loadedAt = Date.now();

  // Where they came from: ?from=<cta>&package=<one_session|three_sessions|monthly|course|course_support>
  var params = new URLSearchParams(window.location.search);
  var from = (params.get('from') || 'direct').replace(/[^a-z0-9-]/gi, '').slice(0, 60) || 'direct';
  form.elements.from.value = from;
  form.elements.started.value = String(loadedAt);
  try {
    form.elements.page.value = document.referrer ? new URL(document.referrer).pathname : '';
  } catch (e) { form.elements.page.value = ''; }

  var pkg = params.get('package');
  if (pkg && form.elements['package'].querySelector('option[value="' + pkg.replace(/[^a-z_]/g, '') + '"]')) {
    form.elements['package'].value = pkg;
  }

  function showError(text) {
    errorBox.innerHTML = '';
    errorBox.appendChild(document.createTextNode(text + ' Email me instead at '));
    var a = document.createElement('a');
    a.href = 'mailto:' + EMAIL;
    a.textContent = EMAIL;
    errorBox.appendChild(a);
    errorBox.appendChild(document.createTextNode(' and I\'ll pick it up from there.'));
    errorBox.hidden = false;
  }

  function stopSending() {
    clearTimeout(slowTimer);
    form.classList.remove('is-sending');
    if (slow) slow.hidden = true;
  }

  function reset() {
    stopSending();
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = 'Send it';
  }

  function succeed() {
    stopSending();
    form.hidden = true;
    done.hidden = false;
    status.textContent = 'Message sent. Thank you.';
    done.focus();
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: 'contact-sent-' + from, title: 'Contact sent', event: true });
    }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    errorBox.hidden = true;

    // Bots: honeypot filled or far too fast. Say nothing.
    if (form.elements.website.value || Date.now() - loadedAt < MIN_MS) return;

    // Plain checks; the browser's own bubbles are turned off (novalidate) so we say it ourselves
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var missing = !name ? form.elements.name : !email || !form.elements.email.checkValidity() ? form.elements.email : !message ? form.elements.message : null;
    if (missing) {
      errorBox.textContent = missing === form.elements.email && email
        ? 'That email address doesn\'t look right. Mind checking it?'
        : 'I need your name, your email and a line about what\'s going on.';
      errorBox.hidden = false;
      missing.focus();
      return;
    }

    if (!endpoint) {
      showError('Sorry, the form isn\'t switched on yet.');
      return;
    }

    var data = {
      name: name,
      email: email,
      message: message,
      package: form.elements['package'].value,
      from: from,
      page: form.elements.page.value,
      website: form.elements.website.value,
      started: loadedAt,
      elapsed: Date.now() - loadedAt
    };

    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.innerHTML = 'Sending<span class="cf-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>';
    form.classList.add('is-sending');
    // Apps Script can take a few seconds on a cold start: say so, so it doesn't feel frozen
    slowTimer = setTimeout(function () { if (slow) slow.hidden = false; }, 4000);
    status.textContent = 'Sending your message.';

    fetch(endpoint, { method: 'POST', body: JSON.stringify(data) })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json && json.ok) { succeed(); return; }
        throw new Error('not ok');
      })
      .catch(function () {
        reset();
        status.textContent = '';
        showError('Sorry, that didn\'t send.');
      });
  });
})();
