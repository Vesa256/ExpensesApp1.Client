const STORAGE_KEY = 'expenses';

function getExpenses() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveExpenses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.classList.remove('show');
    toast.style.display = 'none';
  }, 2500);
}

function startClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;
  const tick = () => (clock.textContent = new Date().toLocaleTimeString());
  tick();
  setInterval(tick, 1000);
}

function validate(form) {
  const rules = {
    title: (v) => (v.trim() ? '' : 'Title is required.'),
    amount: (v) => (Number(v) >= 1 ? '' : 'Amount must be at least 1.'),
    category: (v) => (v ? '' : 'Choose a category.'),
    date: (v) => (v ? '' : 'Pick a date.'),
  };
  let ok = true;
  for (const name in rules) {
    const input = form.elements[name];
    const message = rules[name](input.value);
    const errorBox = form.querySelector(`.error[data-for="${name}"]`);
    input.classList.toggle('is-invalid', !!message);
    if (errorBox) errorBox.textContent = message;
    if (message) ok = false;
  }
  return ok;
}

const form = document.getElementById('expense-form');
const recentSection = document.getElementById('recent');
const recentList = document.getElementById('recent-list');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validate(form)) return;

  const expense = {
    id: Date.now(),
    title: form.elements.title.value.trim(),
    amount: Number(form.elements.amount.value),
    category: form.elements.category.value,
    date: form.elements.date.value,
  };

  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);

  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between';
  li.innerHTML = `<span>${escapeHtml(expense.title)} <small class="text-secondary">(${escapeHtml(expense.category)}, ${expense.date})</small></span><strong>${expense.amount} Lek</strong>`;
  recentList.prepend(li);
  recentSection.classList.remove('d-none');

  form.reset();
  showToast('Expense added');
});

startClock();