// داشبورد پروژه‌ها

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  currentUser = await requireAuth();
  if (!currentUser) return;

  // نمایش ایمیل کاربر
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl) {
    userEmailEl.textContent = currentUser.user_metadata?.username || currentUser.email?.split("@")[0] || "کاربر";
  }

  // دکمه خروج
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => signOut());
  }

  // دکمه ساخت پروژه جدید
  const createBtn = document.getElementById('create-project-btn');
  const modal = document.getElementById('create-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const createForm = document.getElementById('create-project-form');

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.getElementById('project-name').focus();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  // کلیک بیرون از مودال
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await createNewProject();
    });
  }

  // لود پروژه‌ها
  await loadProjects();
});

async function loadProjects() {
  const container = document.getElementById('projects-list');
  const emptyState = document.getElementById('empty-state');
  const loading = document.getElementById('loading');

  if (loading) loading.classList.remove('hidden');
  if (container) container.innerHTML = '';

  const { data: projects, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('updated_at', { ascending: false });

  if (loading) loading.classList.add('hidden');

  if (error) {
    console.error(error);
    showToast('مشکلی پیش اومد موقع لود پروژه‌ها. دوباره امتحان کن.', 'error');
    return;
  }

  if (!projects || projects.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  projects.forEach(project => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.id = project.id;

  const updated = new Date(project.updated_at).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  card.innerHTML = `
    <div class="project-card-header">
      <h3 class="project-title">${escapeHtml(project.name)}</h3>
      <div class="project-actions">
        <button class="btn-icon btn-open" title="باز کردن پروژه">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
        <button class="btn-icon btn-delete" title="حذف پروژه">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
    <p class="project-desc">${escapeHtml(project.description || 'بدون توضیحات')}</p>
    <div class="project-meta">
      <span>آخرین ویرایش: ${updated}</span>
    </div>
  `;

  // باز کردن
  card.querySelector('.btn-open').addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `editor.html?id=${project.id}`;
  });

  // کلیک روی کل کارت هم باز کنه
  card.addEventListener('click', () => {
    window.location.href = `editor.html?id=${project.id}`;
  });

  // حذف
  card.querySelector('.btn-delete').addEventListener('click', async (e) => {
    e.stopPropagation();
    const confirmed = confirm(`مطمئنی می‌خوای پروژه «${project.name}» رو برای همیشه حذف کنی؟\nاین کار قابل برگشت نیست.`);
    if (!confirmed) return;

    const { error } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (error) {
      showToast('نتونستم پروژه رو حذف کنم. دوباره امتحان کن.', 'error');
      return;
    }

    showToast('پروژه حذف شد.', 'success');
    card.remove();

    // اگر دیگه پروژه‌ای نمونده، empty state نشون بده
    const remaining = document.querySelectorAll('.project-card');
    if (remaining.length === 0) {
      document.getElementById('empty-state')?.classList.remove('hidden');
    }
  });

  return card;
}

async function createNewProject() {
  const nameInput = document.getElementById('project-name');
  const descInput = document.getElementById('project-desc');
  const name = nameInput.value.trim();
  const description = descInput.value.trim();

  if (!name) {
    showToast('اسم پروژه رو بنویس لطفاً.', 'error');
    return;
  }

  const submitBtn = document.querySelector('#create-project-form button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'دارم می‌سازم...';

  // ساخت پروژه
  const { data: project, error } = await supabaseClient
    .from('projects')
    .insert({
      user_id: currentUser.id,
      name,
      description
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    showToast('ساخت پروژه با مشکل مواجه شد.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'بساز';
    return;
  }

  // فایل اولیه index.html رو هم بساز
  const starterHTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>سلام! به پروژه «${name}» خوش اومدی 👋</h1>
  <p>اینجا می‌تونی هر چی دلت می‌خواد بسازی.</p>
  <script src="script.js"></script>
</body>
</html>`;

  const starterCSS = `/* استایل‌های پروژه ${name} */
body {
  font-family: Tahoma, Arial, sans-serif;
  background: #f0f4f8;
  color: #1a202c;
  padding: 40px 20px;
  text-align: center;
  direction: rtl;
}

h1 {
  color: #2b6cb0;
  margin-bottom: 12px;
}

p {
  font-size: 1.1rem;
  color: #4a5568;
}`;

  const starterJS = `// اسکریپت پروژه ${name}
console.log('پروژه ${name} با موفقیت لود شد!');

document.addEventListener('DOMContentLoaded', () => {
  // اینجا کدهای جاوااسکریپتت رو بنویس
});`;

  const filesToCreate = [
    { name: 'index.html', content: starterHTML, file_type: 'html' },
    { name: 'style.css', content: starterCSS, file_type: 'css' },
    { name: 'script.js', content: starterJS, file_type: 'js' }
  ];

  for (const file of filesToCreate) {
    await supabaseClient.from('files').insert({
      project_id: project.id,
      name: file.name,
      content: file.content,
      file_type: file.file_type
    });
  }

  showToast('پروژه ساخته شد! داری می‌ری توش...', 'success');
  setTimeout(() => {
    window.location.href = `editor.html?id=${project.id}`;
  }, 700);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
