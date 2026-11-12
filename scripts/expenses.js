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

const listEl = document.getElementById('expense-list');
const emptyMessage = document.getElementById('empty-message');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter-category');
const editForm = document.getElementById('edit-form');
const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));

function renderStats(expenses) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const biggest = expenses.reduce((max, e) => (!max || e.amount > max.amount ? e : max), null);
  document.getElementById('stat-total').textContent = `${total} Lek`;
  document.getElementById('stat-count').textContent = count;
  document.getElementById('stat-average').textContent = `${count ? Math.round(total / count) : 0} Lek`;
  document.getElementById('stat-biggest').textContent = biggest ? `${biggest.title} (${biggest.amount} Lek)` : 'none';
}

function render() {
  const all = getExpenses();
  renderStats(all);

  const term = searchInput.value.trim().toLowerCase();
  const category = filterSelect.value;
  const shown = all
    .filter((e) => e.title.toLowerCase().includes(term))
    .filter((e) => !category || e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById('count').textContent = shown.length;
  emptyMessage.classList.toggle('d-none', all.length > 0);

  listEl.innerHTML = shown
    .map(
      (e) => `
      <tr>
        <td>${escapeHtml(e.date)}</td>
        <td>${escapeHtml(e.title)}</td>
        <td><span class="badge text-bg-light border">${escapeHtml(e.category)}</span></td>
        <td class="text-end">${e.amount} Lek</td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${e.id}">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${e.id}">Delete</button>
        </td>
      </tr>`
    )
    .join('');
}

// Edit / delete buttons (event delegation)
listEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  const expenses = getExpenses();

  if (button.dataset.action === 'delete') {
    if (!confirm('Delete this expense?')) return;
    saveExpenses(expenses.filter((e) => e.id !== id));
    render();
    showToast('Expense deleted');
  }

  if (button.dataset.action === 'edit') {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-title').value = expense.title;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;
    editForm.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    editModal.show();
  }
});

// Validate and save the edit
function validateEdit() {
  const rules = {
    title: (v) => (v.trim() ? '' : 'Title is required.'),
    amount: (v) => (Number(v) >= 1 ? '' : 'Amount must be at least 1.'),
    category: (v) => (v ? '' : 'Choose a category.'),
    date: (v) => (v ? '' : 'Pick a date.'),
  };
  let ok = true;
  for (const name in rules) {
    const input = editForm.elements[name];
    const message = rules[name](input.value);
    const errorBox = editForm.querySelector(`.error[data-for="${name}"]`);
    input.classList.toggle('is-invalid', !!message);
    if (errorBox) errorBox.textContent = message;
    if (message) ok = false;
  }
  return ok;
}

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateEdit()) return;

  const id = Number(document.getElementById('edit-id').value);
  const expenses = getExpenses().map((e) =>
    e.id === id
      ? {
          ...e,
          title: editForm.elements.title.value.trim(),
          amount: Number(editForm.elements.amount.value),
          category: editForm.elements.category.value,
          date: editForm.elements.date.value,
        }
      : e
  );
  saveExpenses(expenses);
  editModal.hide();
  render();
  showToast('Expense updated');
});

// Search and filter
searchInput.addEventListener('input', render);
filterSelect.addEventListener('change', render);

// Sample data
document.getElementById('load-sample').addEventListener('click', () => {
  const today = new Date().toISOString().slice(0, 10);
  const sample = [
    { title: 'Coffee with friends', amount: 350, category: 'Food', date: today },
    { title: 'Bus ticket', amount: 40, category: 'Transport', date: today },
    { title: 'Textbook', amount: 2400, category: 'Books', date: today },
    { title: 'Monthly rent', amount: 25000, category: 'Rent', date: today },
    { title: 'Cinema', amount: 600, category: 'Fun', date: today },
  ].map((e, i) => ({ ...e, id: Date.now() + i }));
  saveExpenses([...getExpenses(), ...sample]);
  render();
});

// Delete all
document.getElementById('clear-all').addEventListener('click', () => {
  if (!confirm('Delete ALL expenses?')) return;
  saveExpenses([]);
  render();
  showToast('All expenses deleted');
});

startClock();
render();