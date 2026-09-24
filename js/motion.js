/* ==========================================================================
   SURPLUS-TO-SHELTER FUN INTERACTIVE MOTION & CONFETTI PARTICLES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Attach Ripple Effect to all Buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, a.btn, input[type="submit"]');
    if (!btn) return;

    // Create ripple circle
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'buttonRipple 0.6s linear';
    circle.style.pointerEvents = 'none';

    // Ensure CSS animation keyframe exists
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.innerHTML = `
        @keyframes buttonRipple {
          to {
            transform: scale(3.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);

    // 2. Trigger Fun Confetti Burst on Primary Action Buttons (Accept, Donate, Claim, Save)
    const isPrimaryAction = btn.textContent.includes('Accept') || 
                            btn.textContent.includes('Claim') || 
                            btn.textContent.includes('Donate') || 
                            btn.textContent.includes('Post') ||
                            btn.textContent.includes('Confirm') ||
                            btn.textContent.includes('Save') ||
                            btn.classList.contains('bg-brand-green') ||
                            btn.classList.contains('bg-emerald-600');

    if (isPrimaryAction) {
      triggerConfettiBurst(e.clientX, e.clientY);
    }
  });

  // Fun Particle Burst Helper
  window.triggerConfettiBurst = function(x, y) {
    const colors = ['#16803C', '#059669', '#10B981', '#3B82F6', '#EAB308', '#EC4899', '#8B5CF6'];
    const particleCount = 24;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${Math.random() * 8 + 6}px`;
      particle.style.height = `${Math.random() * 8 + 6}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      particle.style.zIndex = '99999';
      particle.style.pointerEvents = 'none';

      const angle = (i / particleCount) * 360 * (Math.PI / 180);
      const velocity = Math.random() * 90 + 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      document.body.appendChild(particle);

      const startTime = performance.now();
      function animate(time) {
        const elapsed = (time - startTime) / 1000;
        if (elapsed > 0.75) {
          particle.remove();
          return;
        }
        const px = x + vx * elapsed;
        const py = y + vy * elapsed + 0.5 * 300 * elapsed * elapsed; // Gravity effect
        const opacity = 1 - elapsed / 0.75;
        const scale = 1 - elapsed / 0.75;
        const rotate = elapsed * 720;

        particle.style.transform = `translate(${px - x}px, ${py - y}px) scale(${scale}) rotate(${rotate}deg)`;
        particle.style.opacity = opacity;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(startTime);
    }
  };
});
