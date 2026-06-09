function initTablaMovimientos() {
  const input = document.getElementById('search-hist');
  if (!input) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll('#hist-table tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
