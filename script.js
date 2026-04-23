// Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Navbar scroll effect
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(el => observer.observe(el));

    // ── CALCULATOR ──
    const prices = {
      fljotandi: 4250, hardparket: 4750, vinil: 4250, gegnheilt: 6750
    };
    const typeNames = {
      fljotandi: 'Fljótandi parket', hardparket: 'Harðparket',
      vinil: 'Vínilparket', gegnheilt: 'Gegnheilt parket'
    };
    const patternExtra = { beint: 0, ska: 750, sildar: 1500 };
    const patternNames = { beint: 'Beint', ska: 'Skálagt', sildar: 'Síldarmunstur' };
    const tearoutPrice = 2250;
    const marginPct = 0.15;

    let calcState = { sqm: 60, type: 'fljotandi', pattern: 'beint', tearout: false };

    function fmt(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr';
    }

    function updateCalc() {
      const base = prices[calcState.type] * calcState.sqm;
      const patExtra = patternExtra[calcState.pattern] * calcState.sqm;
      const tearExtra = calcState.tearout ? tearoutPrice * calcState.sqm : 0;
      const total = base + patExtra + tearExtra;
      const lo = Math.round(total * (1 - marginPct));
      const hi = Math.round(total * (1 + marginPct));

      document.getElementById('resType').textContent = typeNames[calcState.type];
      document.getElementById('resTypePrice').textContent = fmt(base);

      const patRow = document.getElementById('resPatternRow');
      if (calcState.pattern !== 'beint') {
        patRow.style.display = 'flex';
        document.getElementById('resPattern').textContent = patternNames[calcState.pattern] + ' álag';
        document.getElementById('resPatternPrice').textContent = fmt(patExtra);
      } else {
        patRow.style.display = 'none';
      }

      const tearRow = document.getElementById('resTearoutRow');
      if (calcState.tearout) {
        tearRow.style.display = 'flex';
        document.getElementById('resTearoutPrice').textContent = fmt(tearExtra);
      } else {
        tearRow.style.display = 'none';
      }

      document.getElementById('resTotalRange').textContent = fmt(lo) + ' – ' + fmt(hi);
    }

    // Range slider
    const sqmRange = document.getElementById('sqmRange');
    const sqmDisplay = document.getElementById('sqmDisplay');
    sqmRange.addEventListener('input', () => {
      calcState.sqm = parseInt(sqmRange.value);
      sqmDisplay.textContent = calcState.sqm;
      updateCalc();
    });

    // Option selectors
    function setupOptions(containerId, stateKey) {
      const container = document.getElementById(containerId);
      container.querySelectorAll('.calc-opt').forEach(opt => {
        opt.addEventListener('click', () => {
          container.querySelectorAll('.calc-opt').forEach(o => o.classList.remove('active'));
          opt.classList.add('active');
          calcState[stateKey] = opt.dataset.value;
          updateCalc();
        });
      });
    }
    setupOptions('typeOptions', 'type');
    setupOptions('patternOptions', 'pattern');

    // Toggle
    document.getElementById('tearoutToggle').addEventListener('click', function() {
      this.classList.toggle('active');
      calcState.tearout = this.classList.contains('active');
      updateCalc();
    });

    // Init
    updateCalc();

    // Form handler (sendir í Web3Forms API)
    function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button');
      const data = new FormData(form);
      const resetBtn = () => {
        btn.innerHTML = 'Senda skilaboð <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.style.background = '';
      };
      fetch(form.action, { method: 'POST', body: data })
        .then(r => r.json().then(json => ({ ok: r.ok && json.success, json })))
        .then(({ ok }) => {
          if (!ok) throw new Error('submit failed');
          btn.textContent = 'Skilaboð send! ✓';
          btn.style.background = '#4a8c5c';
          setTimeout(() => { resetBtn(); form.reset(); }, 3000);
        })
        .catch(() => {
          btn.textContent = 'Villa — reyndu aftur';
          btn.style.background = '#c0392b';
          setTimeout(resetBtn, 3000);
        });
    }
