document.addEventListener("DOMContentLoaded", function () {
  const btnRefresh = document.getElementById("btn-refresh");
  btnRefresh && btnRefresh.addEventListener("click", () => location.reload());
});