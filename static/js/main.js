document.addEventListener("DOMContentLoaded", function () {
  const heroActivity  = document.getElementById("hero-activity");
  const btnRefresh    = document.getElementById("btn-refresh");

  heroActivity  && heroActivity.addEventListener("click", openActivityModal);
  btnRefresh    && btnRefresh.addEventListener("click", () => location.reload());
});