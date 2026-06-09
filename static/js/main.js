document.addEventListener("DOMContentLoaded", function () {
  const btnAddProduct  = document.getElementById("btn-add-product");
  const btnAddEntry    = document.getElementById("btn-add-entry");
  const btnAddOutput   = document.getElementById("btn-add-output");
  const btnAddProvider = document.getElementById("btn-add-provider");
  const heroAddEntry   = document.getElementById("hero-add-entry");
  const heroAddProduct = document.getElementById("hero-add-product");
  const btnRefresh     = document.getElementById("btn-refresh");

  btnAddProduct  && btnAddProduct.addEventListener("click", openAddProduct);
  btnAddEntry    && btnAddEntry.addEventListener("click", openAddEntry);
  btnAddOutput   && btnAddOutput.addEventListener("click", openAddOutput);
  btnAddProvider && btnAddProvider.addEventListener("click", openAddProvider);
  heroAddEntry   && heroAddEntry.addEventListener("click", openAddEntry);
  heroAddProduct && heroAddProduct.addEventListener("click", openAddProduct);
  btnRefresh     && btnRefresh.addEventListener("click", () => location.reload());
});
