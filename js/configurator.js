const configurator = document.querySelector('[data-configurator]');
if (configurator) {
  const optionGroups = configurator.querySelectorAll('[data-configurator-group]');
  const summaryList = configurator.querySelector('[data-configurator-summary]');
  const totalElement = configurator.querySelector('[data-configurator-total]');

  const basePrice = Number(configurator.dataset.basePrice || 39000);
  const selections = {};

  optionGroups.forEach((group) => {
    const options = group.querySelectorAll('[data-configurator-option]');
    options.forEach((option) => {
      option.addEventListener('click', () => {
        const name = group.dataset.configuratorGroup;
        options.forEach((opt) => opt.classList.remove('is-active'));
        option.classList.add('is-active');
        selections[name] = {
          label: option.dataset.optionLabel,
          price: Number(option.dataset.optionPrice || 0)
        };
        updateSummary();
      });
    });
  });

  function updateSummary() {
    if (!summaryList || !totalElement) return;
    summaryList.innerHTML = '';

    let total = basePrice;

    Object.entries(selections).forEach(([group, choice]) => {
      const line = document.createElement('div');
      line.className = 'configurator__line';
      line.innerHTML = `<span>${choice.label}</span><span>+ €${choice.price.toLocaleString('ro-RO')}</span>`;
      summaryList.appendChild(line);
      total += choice.price;
    });

    totalElement.textContent = `€${total.toLocaleString('ro-RO')}`;
  }

  updateSummary();
}
