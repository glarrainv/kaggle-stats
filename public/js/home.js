// Badge generator form + debounced live preview.
import Clarity from '@microsoft/clarity';

const projectId = process.env.CLARITY_ID || ""; 

const form = document.getElementById('generator');
const formError = document.getElementById('form-error');

const previewCard = document.getElementById('preview-card');
const previewSkeleton = document.getElementById('preview-skeleton');
const previewImg = document.getElementById('preview-img');
const previewError = document.getElementById('preview-error');

const clean = (value) => value.trim().replace(/[\s/]+/g, '');

Clarity.init(projectId);

function readFields() {
  return {
    svgType: form.elements.svgType.value,
    itemType: form.elements.itemType.value,
    username: clean(form.elements.username.value),
    slug: clean(form.elements.slug.value),
  };
}

function buildPath({ svgType, itemType, username, slug }) {
  return '/' + [svgType, itemType, username, slug].map(encodeURIComponent).join('/');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = readFields();
  if (!fields.username || !fields.slug) {
    Clarity.event("generate-error", { username: fields.username, slug: fields.slug });
    formError.classList.remove('hidden');
    return;
  }
  formError.classList.add('hidden');
  Clarity.event("generate-success", {   missingUsername: !fields.username, missingSlug: !fields.slug });
  location.href = buildPath(fields);
});

// ── Live preview (debounced) ──────────────────────────────────

let debounceTimer;

function requestPreview() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const fields = readFields();
    if (!fields.username || !fields.slug) return;

    previewCard.classList.remove('hidden');
    previewSkeleton.classList.remove('hidden');
    previewImg.classList.add('hidden');
    previewError.classList.add('hidden');

    previewImg.src = '/api' + buildPath(fields);
  }, 600);
}

previewImg.addEventListener('load', () => {
  previewSkeleton.classList.add('hidden');
  previewImg.classList.remove('hidden');
});

previewImg.addEventListener('error', () => {
  previewSkeleton.classList.add('hidden');
  previewError.classList.remove('hidden');
});

for (const el of form.elements) {
  el.addEventListener('input', requestPreview);
  el.addEventListener('change', requestPreview);
}
