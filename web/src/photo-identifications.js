// Dated evidence supplement; never merge photo counts into historic group counts.
import { escape } from "./ui.js";

export function photoIdentificationsHTML(collection, query = "", filter = "all") {
  if (!collection?.items) return '<div class="notice">Photo identifications are unavailable in this build.</div>';
  const term = String(query).trim().toLowerCase();
  const photos = (collection.photos || []).filter(photo =>
    (!term || JSON.stringify(photo).toLowerCase().includes(term)) &&
    (filter === "all" || filter === "Owned" || collection.items.some(item => item.category === filter && item.photos.includes(photo.path))));
  const gallery = '<details class="panel" open><summary>Source photos and annotation labels (' + photos.length + ')</summary><div class="component-grid">' + photos.map(photo => {
    if (!/^media\/parts\/2026-10-25\/IMG_\d{4}\.jpeg$/.test(photo.path)) return '';
    const annotated = /^media\/parts\/2026-10-25\/IMG_\d{4}_annotated\.svg$/.test(photo.annotatedPath || '') ? photo.annotatedPath : photo.path;
    return `<figure class="panel source-photo"><a href="repository/${escape(annotated)}" target="_blank" rel="noopener"><img src="repository/${escape(annotated)}" alt="${escape(photo.title)} — annotated" loading="lazy" style="width:100%;height:220px;object-fit:contain"></a><figcaption><strong>${escape(photo.filename)} · ${escape(photo.title)}</strong><p>${escape(photo.donor)}</p><ul>${(photo.annotations || []).map(label => `<li>${escape(label)}</li>`).join('')}</ul><small>Not electrically tested. Open annotated image to enlarge.</small><p><a href="repository/${escape(photo.path)}" target="_blank" rel="noopener">Source photograph</a></p></figcaption></figure>`;
  }).join('') + '</div></details>';
  const sheets = (collection.annotationSheets || []).filter(sheet => /^media\/parts\/2026-10-25\/annotations-\d\.png$/.test(sheet.path)).map(sheet => `<a href="repository/${escape(sheet.path)}" target="_blank" rel="noopener">${escape(sheet.title)}</a>`).join(' · ');
  const rows = collection.items.filter(item =>
    (!term || JSON.stringify(item).toLowerCase().includes(term)) &&
    (filter === "all" || filter === "Owned" || item.category === filter));
  return `<section class="panel"><h2>Photo identifications · ${escape(collection.date)}</h2>
    <p>${escape(collection.disclaimer)}</p><p>Open any photo for a larger view. Question marks identify uncertain parts.</p>
    <a href="repository/component-bank/PHOTO_IDENTIFICATIONS_2026-10-25.md" target="_blank" rel="noopener">Full annotated parts list</a> ·
    <a href="repository/component-bank/owner-photo-identifications.csv" download>Download CSV</a><p>${sheets}</p></section>` + gallery +
    (rows.length ? '<div class="component-grid">' + rows.map(item =>
      `<article class="panel component photo-identification"><span class="eyebrow">${escape(item.id)} · ${escape(item.category)}</span>
      <h3>${escape(item.name)}</h3><span class="pill">Not electrically tested</span>
      <dl><dt>Markings</dt><dd>${escape(item.partNumber)}</dd><dt>Quantity</dt><dd>${escape(item.quantity)}</dd>
      <dt>Photo evidence</dt><dd>${escape(item.evidence)}</dd><dt>Earlier inventory group</dt><dd>${escape(item.relatedReferenceId || "Not assigned; overlap unresolved")}</dd></dl>
      <p>${escape(item.use)}</p><p class="notice">${escape(item.limits)}</p>
      ${item.photos.filter(path => /^media\/parts\/2026-10-25\/IMG_\d{4}\.jpeg$/.test(path)).map(path =>
        `<a href="repository/${escape(path)}" target="_blank" rel="noopener"><img src="repository/${escape(path)}" alt="${escape(item.name)} — ${escape(path.split('/').pop())}" loading="lazy" style="width:100%;height:220px;object-fit:contain"><span>${escape(path.split('/').pop())} · Open photo</span></a>`
      ).join("")}</article>`).join("") + '</div>' : '<div class="empty panel">No photo identifications match your search.</div>');
}
