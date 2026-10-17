// ============================================
// ادیتور اصلی HTML Studio
// ============================================

let currentUser = null;
let currentProject = null;
let files = [];                 // آرایه فایل‌های پروژه
let activeFileId = null;        // فایل فعال در ادیتور
let editors = {};               // نمونه CodeMirror برای هر فایل
let isDirty = false;            // آیا تغییر ذخیره نشده داریم؟
let saveTimeout = null;

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  currentUser = await requireAuth();
  if (!currentUser) return;

  if (!projectId) {
    alert('پروژه‌ای انتخاب نشده. برمی‌گردی به داشبورد.');
    window.location.href = 'dashboard.html';
    return;
  }

  // دکمه‌ها
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (isDirty && !confirm('تغییرات ذخیره نشده‌ای داری. مطمئنی می‌خوای بری بیرون؟')) return;
    window.location.href = 'dashboard.html';
  });

  document.getElementById('save-btn')?.addEventListener('click', () => saveAllFiles(true));
  document.getElementById('preview-btn')?.addEventListener('click', () => runPreview());
  document.getElementById('logout-btn')?.addEventListener('click', () => signOut());

  // فایل‌منیجر
  document.getElementById('add-file-btn')?.addEventListener('click', () => showAddFileModal());
  document.getElementById('upload-file-btn')?.addEventListener('click', () => {
    document.getElementById('file-upload-input').click();
  });
  document.getElementById('file-upload-input')?.addEventListener('change', handleFileUpload);

  // مودال افزودن فایل
  document.getElementById('close-add-file')?.addEventListener('click', () => {
    document.getElementById('add-file-modal').classList.add('hidden');
  });
  document.getElementById('add-file-form')?.addEventListener('submit', handleAddFile);

  // لود پروژه
  await loadProject();
});

async function loadProject() {
  showStatus('دارم پروژه رو لود می‌کنم...');

  // اطلاعات پروژه
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projError || !project) {
    alert('پروژه پیدا نشد یا دسترسی نداری.');
    window.location.href = 'dashboard.html';
    return;
  }

  currentProject = project;
  document.getElementById('project-title').textContent = project.name;

  // فایل‌ها
  const { data: projectFiles, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('name');

  if (filesError) {
    console.error(filesError);
    showStatus('خطا در لود فایل‌ها', true);
    return;
  }

  files = projectFiles || [];
  renderFileList();
  renderTabs();

  // اولین فایل HTML رو باز کن، یا هر فایلی که هست
  const htmlFile = files.find(f => f.name.endsWith('.html')) || files[0];
  if (htmlFile) {
    openFile(htmlFile.id);
  }

  showStatus('آماده');
  runPreview();
}

function renderFileList() {
  const list = document.getElementById('file-list');
  if (!list) return;

  list.innerHTML = '';

  if (files.length === 0) {
    list.innerHTML = '<li class="empty-files">هنوز فایلی نداری. یکی اضافه کن!</li>';
    return;
  }

  files.forEach(file => {
    const li = document.createElement('li');
    li.className = `file-item ${file.id === activeFileId ? 'active' : ''}`;
    li.dataset.id = file.id;

    const icon = getFileIcon(file.name);
    li.innerHTML = `
      <span class="file-icon">${icon}</span>
      <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
      <div class="file-item-actions">
        <button class="btn-tiny rename-btn" title="تغییر نام">✏️</button>
        <button class="btn-tiny delete-btn" title="حذف">🗑️</button>
      </div>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.closest('.rename-btn') || e.target.closest('.delete-btn')) return;
      openFile(file.id);
    });

    li.querySelector('.rename-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      renameFile(file);
    });

    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFile(file);
    });

    list.appendChild(li);
  });
}

function renderTabs() {
  const tabsContainer = document.getElementById('editor-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = '';

  files.forEach(file => {
    const tab = document.createElement('div');
    tab.className = `editor-tab ${file.id === activeFileId ? 'active' : ''}`;
    tab.dataset.id = file.id;
    tab.innerHTML = `
      <span>${escapeHtml(file.name)}</span>
      <button class="tab-close" title="بستن">×</button>
    `;

    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close')) return;
      openFile(file.id);
    });

    tab.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      // فعلاً فقط از تب‌ها حذف نمی‌کنیم، چون فایل هنوز وجود داره
      // اگر خواستی می‌تونی منطق بستن تب اضافه کنی
    });

    tabsContainer.appendChild(tab);
  });
}

function openFile(fileId) {
  const file = files.find(f => f.id === fileId);
  if (!file) return;

  // ذخیره محتوای فعلی قبل از سوییچ
  if (activeFileId && editors[activeFileId]) {
    const currentContent = editors[activeFileId].getValue();
    const activeFile = files.find(f => f.id === activeFileId);
    if (activeFile && activeFile.content !== currentContent) {
      activeFile.content = currentContent;
      isDirty = true;
      scheduleAutoSave();
    }
  }

  activeFileId = fileId;
  renderFileList();
  renderTabs();

  // ادیتور رو نشون بده
  const editorWrapper = document.getElementById('editor-wrapper');
  editorWrapper.innerHTML = '';

  const textarea = document.createElement('textarea');
  textarea.id = `code-${fileId}`;
  textarea.value = file.content || '';
  editorWrapper.appendChild(textarea);

  // CodeMirror
  const mode = getCodeMirrorMode(file.name);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: mode,
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    autofocus: true,
    indentUnit: 2,
    tabSize: 2,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    extraKeys: {
      'Ctrl-S': () => saveAllFiles(true),
      'Cmd-S': () => saveAllFiles(true)
    }
  });

  editors[fileId] = editor;

  editor.on('change', () => {
    isDirty = true;
    document.getElementById('save-status').textContent = 'تغییرات ذخیره نشده';
    document.getElementById('save-status').classList.add('dirty');
    scheduleAutoSave();
    // پیش‌نمایش زنده با تأخیر کم
    clearTimeout(window.previewTimeout);
    window.previewTimeout = setTimeout(runPreview, 600);
  });

  // ارتفاع رو تنظیم کن
  setTimeout(() => editor.refresh(), 50);
}

function getCodeMirrorMode(filename) {
  if (filename.endsWith('.html') || filename.endsWith('.htm')) return 'htmlmixed';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.js') || filename.endsWith('.mjs')) return 'javascript';
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.md')) return 'markdown';
  return 'text/plain';
}

function getFileIcon(name) {
  if (name.endsWith('.html')) return '📄';
  if (name.endsWith('.css')) return '🎨';
  if (name.endsWith('.js')) return '⚡';
  if (name.endsWith('.json')) return '📋';
  if (name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return '🖼️';
  return '📁';
}

function scheduleAutoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveAllFiles(false), 2500);
}

async function saveAllFiles(showToastMsg = false) {
  // محتوای ادیتور فعال رو هم بگیر
  if (activeFileId && editors[activeFileId]) {
    const file = files.find(f => f.id === activeFileId);
    if (file) {
      file.content = editors[activeFileId].getValue();
    }
  }

  showStatus('در حال ذخیره...');

  let hasError = false;

  for (const file of files) {
    const { error } = await supabase
      .from('files')
      .update({
        content: file.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', file.id);

    if (error) {
      console.error('خطا در ذخیره فایل', file.name, error);
      hasError = true;
    }
  }

  // آپدیت زمان پروژه
  await supabase
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (hasError) {
    showStatus('بعضی فایل‌ها ذخیره نشدن', true);
    if (showToastMsg) showToast('مشکلی در ذخیره پیش اومد.', 'error');
  } else {
    isDirty = false;
    showStatus('همه چیز ذخیره شد ✓');
    document.getElementById('save-status').textContent = 'ذخیره شده';
    document.getElementById('save-status').classList.remove('dirty');
    if (showToastMsg) showToast('پروژه با موفقیت ذخیره شد.', 'success');
  }
}

function runPreview() {
  const iframe = document.getElementById('preview-frame');
  if (!iframe) return;

  // محتوای فعلی ادیتور فعال رو هم لحاظ کن
  if (activeFileId && editors[activeFileId]) {
    const file = files.find(f => f.id === activeFileId);
    if (file) file.content = editors[activeFileId].getValue();
  }

  // پیدا کردن فایل اصلی HTML
  let htmlFile = files.find(f => f.name === 'index.html') ||
                 files.find(f => f.name.endsWith('.html'));

  if (!htmlFile) {
    iframe.srcdoc = `
      <html dir="rtl">
        <body style="font-family:Tahoma;padding:40px;text-align:center;color:#666">
          <h2>هنوز فایل HTML نداری</h2>
          <p>یک فایل با پسوند .html بساز تا پیش‌نمایش فعال بشه.</p>
        </body>
      </html>`;
    return;
  }

  let htmlContent = htmlFile.content || '';

  // پیدا کردن و تزریق CSSها
  const cssFiles = files.filter(f => f.name.endsWith('.css'));
  let cssInject = '';
  cssFiles.forEach(css => {
    cssInject += `<style data-file="${css.name}">\n${css.content}\n</style>\n`;
  });

  // پیدا کردن و تزریق JSها
  const jsFiles = files.filter(f => f.name.endsWith('.js'));
  let jsInject = '';
  jsFiles.forEach(js => {
    jsInject += `<script data-file="${js.name}">\n${js.content}\n<\/script>\n`;
  });

  // اگر در HTML لینک به style.css یا script.js هست، اونا رو با محتوای واقعی جایگزین کن
  // (روش ساده: همه CSS و JS رو تزریق می‌کنیم)

  // اضافه کردن CSS به head
  if (htmlContent.includes('</head>')) {
    htmlContent = htmlContent.replace('</head>', cssInject + '</head>');
  } else {
    htmlContent = cssInject + htmlContent;
  }

  // اضافه کردن JS قبل از بسته شدن body
  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', jsInject + '</body>');
  } else {
    htmlContent += jsInject;
  }

  // برای امنیت نسبی
  iframe.srcdoc = htmlContent;
}

function showAddFileModal() {
  document.getElementById('add-file-modal').classList.remove('hidden');
  document.getElementById('new-file-name').value = '';
  document.getElementById('new-file-name').focus();
}

async function handleAddFile(e) {
  e.preventDefault();
  const nameInput = document.getElementById('new-file-name');
  let name = nameInput.value.trim();

  if (!name) {
    showToast('اسم فایل رو بنویس.', 'error');
    return;
  }

  // اگر پسوند نداشت، html در نظر بگیر
  if (!name.includes('.')) {
    name += '.html';
  }

  // چک تکراری نبودن
  if (files.some(f => f.name === name)) {
    showToast('فایلی با این اسم از قبل وجود داره.', 'error');
    return;
  }

  const fileType = name.endsWith('.css') ? 'css' :
                   name.endsWith('.js') ? 'js' :
                   name.endsWith('.html') ? 'html' : 'other';

  let defaultContent = '';
  if (fileType === 'html') {
    defaultContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>صفحه جدید</title>
</head>
<body>
  <h1>صفحه جدید</h1>
</body>
</html>`;
  } else if (fileType === 'css') {
    defaultContent = `/* فایل استایل جدید */\n`;
  } else if (fileType === 'js') {
    defaultContent = `// فایل اسکریپت جدید\nconsole.log('لود شد');\n`;
  }

  const { data: newFile, error } = await supabase
    .from('files')
    .insert({
      project_id: projectId,
      name,
      content: defaultContent,
      file_type: fileType
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    showToast('نتونستم فایل رو بسازم.', 'error');
    return;
  }

  files.push(newFile);
  renderFileList();
  renderTabs();
  openFile(newFile.id);

  document.getElementById('add-file-modal').classList.add('hidden');
  showToast(`فایل «${name}» ساخته شد.`, 'success');
  runPreview();
}

async function renameFile(file) {
  const newName = prompt('اسم جدید فایل رو بنویس:', file.name);
  if (!newName || newName.trim() === file.name) return;

  const trimmed = newName.trim();
  if (files.some(f => f.name === trimmed && f.id !== file.id)) {
    showToast('فایلی با این اسم از قبل هست.', 'error');
    return;
  }

  const { error } = await supabase
    .from('files')
    .update({ name: trimmed })
    .eq('id', file.id);

  if (error) {
    showToast('تغییر نام انجام نشد.', 'error');
    return;
  }

  file.name = trimmed;
  renderFileList();
  renderTabs();
  showToast('اسم فایل عوض شد.', 'success');
  runPreview();
}

async function deleteFile(file) {
  if (files.length <= 1) {
    showToast('نمی‌تونی آخرین فایل پروژه رو حذف کنی.', 'error');
    return;
  }

  if (!confirm(`مطمئنی می‌خوای «${file.name}» رو حذف کنی؟`)) return;

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', file.id);

  if (error) {
    showToast('حذف انجام نشد.', 'error');
    return;
  }

  // از آرایه محلی حذف کن
  files = files.filter(f => f.id !== file.id);

  // اگر فایل فعال بود، یکی دیگه باز کن
  if (activeFileId === file.id) {
    activeFileId = null;
    if (editors[file.id]) {
      delete editors[file.id];
    }
    const next = files[0];
    if (next) openFile(next.id);
    else {
      document.getElementById('editor-wrapper').innerHTML = '<p class="no-file">فایلی برای ویرایش نیست</p>';
    }
  }

  renderFileList();
  renderTabs();
  showToast('فایل حذف شد.', 'success');
  runPreview();
}

async function handleFileUpload(e) {
  const fileList = e.target.files;
  if (!fileList || fileList.length === 0) return;

  for (const file of fileList) {
    // فقط فایل‌های متنی رو فعلاً پشتیبانی می‌کنیم
    if (!file.type.startsWith('text/') && 
        !file.name.match(/\.(html|css|js|json|md|txt|svg)$/i)) {
      showToast(`فایل «${file.name}» پشتیبانی نمی‌شه (فعلاً فقط متنی).`, 'error');
      continue;
    }

    if (files.some(f => f.name === file.name)) {
      showToast(`فایل «${file.name}» از قبل وجود داره.`, 'error');
      continue;
    }

    const content = await readFileAsText(file);
    const fileType = file.name.endsWith('.css') ? 'css' :
                     file.name.endsWith('.js') ? 'js' :
                     file.name.endsWith('.html') ? 'html' : 'other';

    const { data: newFile, error } = await supabase
      .from('files')
      .insert({
        project_id: projectId,
        name: file.name,
        content,
        file_type: fileType
      })
      .select()
      .single();

    if (error) {
      showToast(`آپلود «${file.name}» شکست خورد.`, 'error');
      continue;
    }

    files.push(newFile);
  }

  renderFileList();
  renderTabs();
  e.target.value = ''; // ریست اینپوت
  showToast('فایل‌ها آپلود شدن.', 'success');
  runPreview();
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

function showStatus(text, isError = false) {
  const el = document.getElementById('status-bar');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// هشدار قبل از بستن تب اگر تغییر ذخیره نشده باشه
window.addEventListener('beforeunload', (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
