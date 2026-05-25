import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from "react";
import { A as Authenticated } from "./AuthenticatedLayout-Bc07UTqA.mjs";
import { router, useForm, Head } from "@inertiajs/react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-DRB3Bbat.mjs";
import { A as AdminPagination } from "./AdminPagination-D6_hrmXq.mjs";
import { M as Modal } from "./Modal-BnFbDATV.mjs";
import { I as InputError } from "./InputError-cRVTeK4i.mjs";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "./SeoHead-9Gv-Y1Y7.mjs";
function PostsFilters({
  filters,
  categories = [],
  onChange,
  onReset
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        placeholder: "Cerca (titolo, slug, id)",
        value: filters.q,
        onChange: (e) => onChange({ q: e.target.value }, { debounce: true })
      }
    ),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        value: filters.status,
        onChange: (e) => onChange({ status: e.target.value }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Stato: tutti" }),
          /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
          /* @__PURE__ */ jsx("option", { value: "review", children: "Review" }),
          /* @__PURE__ */ jsx("option", { value: "published", children: "Published" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        value: filters.created_by,
        onChange: (e) => onChange({ created_by: e.target.value }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Creato da: tutti" }),
          /* @__PURE__ */ jsx("option", { value: "admin", children: "admin" }),
          /* @__PURE__ */ jsx("option", { value: "ai", children: "ai" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        value: filters.publication,
        onChange: (e) => onChange({ publication: e.target.value }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Pubblicazione: tutte" }),
          /* @__PURE__ */ jsx("option", { value: "published", children: "Pubblicati" }),
          /* @__PURE__ */ jsx("option", { value: "unpublished", children: "Non pubblicati" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        value: filters.category_ids || "",
        onChange: (e) => onChange({ category_ids: e.target.value }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Categorie: tutte" }),
          categories.map((category) => /* @__PURE__ */ jsx("option", { value: String(category.id), children: category.name }, category.id))
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
        value: filters.per_page,
        onChange: (e) => onChange({ per_page: e.target.value }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "10", children: "10 / pagina" }),
          /* @__PURE__ */ jsx("option", { value: "15", children: "15 / pagina" }),
          /* @__PURE__ */ jsx("option", { value: "25", children: "25 / pagina" }),
          /* @__PURE__ */ jsx("option", { value: "50", children: "50 / pagina" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2 sm:col-span-2 lg:col-span-6", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onReset,
        className: "rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700",
        children: "Reset"
      }
    ) })
  ] });
}
const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700"
};
const DEFAULT_POST_FILTERS = {
  q: "",
  status: "",
  created_by: "",
  publication: "",
  category_ids: "",
  per_page: "15"
};
function filtersFromProps(filters = {}) {
  return {
    q: filters.q || "",
    status: filters.status || "",
    created_by: filters.created_by || "",
    publication: filters.publication || "",
    category_ids: filters.category_ids || "",
    per_page: String(filters.per_page || 15)
  };
}
function emptyCreateForm() {
  return {
    title: "",
    slug: "",
    summary: "",
    content: "",
    category_ids: [],
    status: "draft",
    published_at: "",
    cover: null,
    thumb: null
  };
}
function emptyEditForm() {
  return {
    id: null,
    _method: "put",
    ...emptyCreateForm()
  };
}
function articleToEditFormData(article) {
  return {
    id: article.id,
    _method: "put",
    title: article.title || "",
    slug: article.slug || "",
    summary: article.summary || "",
    content: article.content || "",
    category_ids: Array.isArray(article.categories) ? article.categories.map((category) => String(category.id)) : [],
    status: article.status || "draft",
    published_at: article.published_at ? article.published_at.slice(0, 10) : "",
    cover: null,
    thumb: null
  };
}
function storageUrl(path, time = null) {
  if (!path) {
    return null;
  }
  return time ? `/storage/${path}?t=${time}` : `/storage/${path}`;
}
function PostsTableRow({ article, onEdit, onDelete }) {
  return /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: article.id }),
    /* @__PURE__ */ jsxs("td", { className: "py-4 pr-4", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-slate-900", children: article.title }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: article.slug })
    ] }),
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: Array.isArray(article.categories) && article.categories.length > 0 ? article.categories.map((category) => category.name).join(", ") : "-" }),
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4", children: /* @__PURE__ */ jsx(
      "span",
      {
        className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[article.status] || STATUS_STYLES.draft}`,
        children: article.status
      }
    ) }),
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: article.published_at ? new Date(article.published_at).toLocaleDateString("it-IT") : "-" }),
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: article.created_at ? new Date(article.created_at).toLocaleDateString("it-IT") : "-" }),
    /* @__PURE__ */ jsx("td", { className: "py-4 pr-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onEdit(article),
          className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50",
          "aria-label": "Modifica",
          children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onDelete(article),
          className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50",
          "aria-label": "Elimina",
          children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
        }
      )
    ] }) })
  ] });
}
function PostsTable({
  articles = [],
  onEdit,
  onDelete,
  onToggleSort,
  sortLabel
}) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "border-b border-slate-200 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { className: "text-left", children: [
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => onToggleSort("id"), children: [
        "ID",
        sortLabel("id")
      ] }) }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => onToggleSort("title"), children: [
        "Titolo",
        sortLabel("title")
      ] }) }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Categorie" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => onToggleSort("status"), children: [
        "Stato",
        sortLabel("status")
      ] }) }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onToggleSort("published_at"),
          children: [
            "Pubblicazione",
            sortLabel("published_at")
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => onToggleSort("created_at"), children: [
        "Creato il",
        sortLabel("created_at")
      ] }) }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 text-right font-medium", children: "Azioni" })
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      articles.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "py-6 text-slate-500", colSpan: "7", children: "Nessun articolo presente." }) }),
      articles.map((article) => /* @__PURE__ */ jsx(
        PostsTableRow,
        {
          article,
          onEdit,
          onDelete
        },
        article.id
      ))
    ] })
  ] }) });
}
function PostsManagementCard({
  articles = [],
  paginationLinks = [],
  categories = [],
  filters,
  onFilterChange,
  onFilterReset,
  onToggleSort,
  sortLabel,
  onCreateClick,
  onEdit,
  onDelete
}) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Gestione articoli" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Lista articoli con stato editoriale." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: onCreateClick,
          className: "inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Nuovo articolo"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsx(
        PostsFilters,
        {
          filters,
          categories,
          onChange: onFilterChange,
          onReset: onFilterReset
        }
      ),
      /* @__PURE__ */ jsx(
        PostsTable,
        {
          articles,
          onEdit,
          onDelete,
          onToggleSort,
          sortLabel
        }
      ),
      /* @__PURE__ */ jsx(AdminPagination, { links: paginationLinks })
    ] })
  ] });
}
function ArticleCategoryField({
  form,
  categories = [],
  categoryToAdd,
  onCategoryToAddChange,
  onAdd,
  onRemove,
  idPrefix = "article"
}) {
  const selectedIds = form.data.category_ids || [];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Categorie" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
          value: categoryToAdd,
          onChange: (e) => onCategoryToAddChange(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleziona categoria" }),
            categories.map((category) => /* @__PURE__ */ jsx("option", { value: String(category.id), children: category.name }, category.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onAdd,
          className: "rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700",
          children: "Aggiungi"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: selectedIds.map((categoryId) => {
      const category = categories.find(
        (item) => String(item.id) === String(categoryId)
      );
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onRemove(categoryId),
          className: "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700",
          children: [
            category?.name || `ID ${categoryId}`,
            " ×"
          ]
        },
        `${idPrefix}-cat-${categoryId}`
      );
    }) }),
    /* @__PURE__ */ jsx(InputError, { message: form.errors.category_ids, className: "mt-1" })
  ] });
}
function ArticleImageField({
  label,
  fileName,
  previewUrl,
  existingUrl,
  error,
  onChange
}) {
  const showPreview = previewUrl || existingUrl;
  return /* @__PURE__ */ jsxs("label", { className: "group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: label }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: fileName || "Seleziona immagine" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300", children: "Carica" })
    ] }),
    showPreview && /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-md border border-slate-200 bg-white", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: previewUrl || existingUrl,
        alt: `Preview ${label.toLowerCase()}`,
        className: "h-32 w-full object-cover"
      }
    ) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        accept: "image/*",
        className: "sr-only",
        onChange
      }
    ),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-2" })
  ] });
}
function ArticleForm({
  form,
  categories = [],
  categoryPicker,
  coverPreview,
  thumbPreview,
  existingCoverUrl,
  existingThumbUrl,
  idPrefix = "article",
  submitLabel,
  onSubmit,
  onCancel
}) {
  return /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Titolo" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
            value: form.data.title,
            onChange: (e) => form.setData("title", e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: form.errors.title, className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Slug" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
            value: form.data.slug,
            onChange: (e) => form.setData("slug", e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: form.errors.slug, className: "mt-1" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Summary" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
          rows: "3",
          value: form.data.summary,
          onChange: (e) => form.setData("summary", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: form.errors.summary, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Contenuto" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
          rows: "6",
          value: form.data.content,
          onChange: (e) => form.setData("content", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: form.errors.content, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        ArticleCategoryField,
        {
          form,
          categories,
          categoryToAdd: categoryPicker.categoryToAdd,
          onCategoryToAddChange: categoryPicker.setCategoryToAdd,
          onAdd: categoryPicker.add,
          onRemove: categoryPicker.remove,
          idPrefix
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Stato" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
            value: form.data.status,
            onChange: (e) => form.setData("status", e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "review", children: "Review" }),
              /* @__PURE__ */ jsx("option", { value: "published", children: "Published" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: form.errors.status, className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Pubblicato il" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
            value: form.data.published_at,
            onChange: (e) => form.setData("published_at", e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: form.errors.published_at, className: "mt-1" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        ArticleImageField,
        {
          label: "Cover",
          fileName: form.data.cover?.name,
          previewUrl: coverPreview,
          existingUrl: existingCoverUrl,
          error: form.errors.cover,
          onChange: (e) => form.setData("cover", e.target.files[0])
        }
      ),
      /* @__PURE__ */ jsx(
        ArticleImageField,
        {
          label: "Thumb",
          fileName: form.data.thumb?.name,
          previewUrl: thumbPreview,
          existingUrl: existingThumbUrl,
          error: form.errors.thumb,
          onChange: (e) => form.setData("thumb", e.target.files[0])
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600",
          children: "Annulla"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: form.processing,
          className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
          children: submitLabel
        }
      )
    ] })
  ] });
}
function CreateArticleModal({
  show,
  onClose,
  form,
  categories,
  categoryPicker,
  coverPreview,
  thumbPreview,
  onSubmit
}) {
  return /* @__PURE__ */ jsx(Modal, { show, onClose, maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Nuovo articolo" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Inserisci i dettagli principali." }),
    /* @__PURE__ */ jsx(
      ArticleForm,
      {
        form,
        categories,
        categoryPicker,
        coverPreview,
        thumbPreview,
        idPrefix: "create",
        submitLabel: "Salva",
        onSubmit,
        onCancel: onClose
      }
    )
  ] }) });
}
function EditArticleModal({
  show,
  onClose,
  form,
  article,
  categories,
  categoryPicker,
  coverPreview,
  thumbPreview,
  imageTime,
  onSubmit
}) {
  const existingCoverUrl = article?.cover_path ? storageUrl(article.cover_path, imageTime) : null;
  const existingThumbUrl = article?.thumb_path ? storageUrl(article.thumb_path, imageTime) : null;
  return /* @__PURE__ */ jsx(Modal, { show, onClose, maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Modifica articolo" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Aggiorna i dettagli principali." }),
    /* @__PURE__ */ jsx(
      ArticleForm,
      {
        form,
        categories,
        categoryPicker,
        coverPreview,
        thumbPreview,
        existingCoverUrl: coverPreview ? null : existingCoverUrl,
        existingThumbUrl: thumbPreview ? null : existingThumbUrl,
        idPrefix: "edit",
        submitLabel: "Aggiorna",
        onSubmit,
        onCancel: onClose
      }
    )
  ] }) });
}
function useCategoryPicker(form, fieldName = "category_ids") {
  const [categoryToAdd, setCategoryToAdd] = useState("");
  const add = () => {
    if (!categoryToAdd) {
      return;
    }
    const current = Array.isArray(form.data[fieldName]) ? form.data[fieldName] : [];
    if (!current.includes(categoryToAdd)) {
      form.setData(fieldName, [...current, categoryToAdd]);
    }
  };
  const remove = (categoryId) => {
    const current = Array.isArray(form.data[fieldName]) ? form.data[fieldName] : [];
    form.setData(
      fieldName,
      current.filter((id) => id !== categoryId)
    );
  };
  const reset = () => setCategoryToAdd("");
  return {
    categoryToAdd,
    setCategoryToAdd,
    add,
    remove,
    reset
  };
}
function useFilePreview(file) {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return preview;
}
function usePostsFilters(initialFilters = {}, sort = { field: "id", direction: "desc" }) {
  const [tableFilters, setTableFilters] = useState(() => filtersFromProps(initialFilters));
  const searchDebounceRef = useRef(null);
  const applyFilters = (nextFilters = tableFilters, sortField = sort.field, sortDirection = sort.direction) => {
    router.get(
      route("admin.posts.index"),
      {
        ...nextFilters,
        sort: sortField,
        direction: sortDirection
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true
      }
    );
  };
  const updateFilters = (partial, options = { debounce: false }) => {
    const next = {
      ...tableFilters,
      ...partial
    };
    setTableFilters(next);
    if (options.debounce) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        applyFilters(next);
      }, 350);
      return;
    }
    applyFilters(next);
  };
  const resetFilters = () => {
    const reset = { ...DEFAULT_POST_FILTERS };
    setTableFilters(reset);
    applyFilters(reset, "id", "desc");
  };
  const toggleSort = (field) => {
    const nextDirection = sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    applyFilters(tableFilters, field, nextDirection);
  };
  const sortLabel = (field) => {
    if (sort.field !== field) {
      return "";
    }
    return sort.direction === "asc" ? " ↑" : " ↓";
  };
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);
  return {
    tableFilters,
    updateFilters,
    resetFilters,
    toggleSort,
    sortLabel
  };
}
function Posts({
  auth,
  articles = { data: [], links: [] },
  filters = {},
  sort = { field: "id", direction: "desc" },
  categories = []
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [imageTime, setImageTime] = useState(Date.now());
  const createForm = useForm(emptyCreateForm());
  const editForm = useForm(emptyEditForm());
  const createCategoryPicker = useCategoryPicker(createForm);
  const editCategoryPicker = useCategoryPicker(editForm);
  const createCoverPreview = useFilePreview(createForm.data.cover);
  const createThumbPreview = useFilePreview(createForm.data.thumb);
  const editCoverPreview = useFilePreview(editForm.data.cover);
  const editThumbPreview = useFilePreview(editForm.data.thumb);
  const { tableFilters, updateFilters, resetFilters, toggleSort, sortLabel } = usePostsFilters(filters, sort);
  const articleRows = useMemo(() => articles?.data || [], [articles]);
  const paginationLinks = useMemo(() => articles?.links || [], [articles]);
  const openEdit = (article) => {
    setEditingId(article.id);
    setEditingArticle(article);
    editCategoryPicker.reset();
    setImageTime(Date.now());
    editForm.setData(articleToEditFormData(article));
    setShowEdit(true);
  };
  const handleDelete = (article) => {
    if (!confirm(`Eliminare l'articolo "${article.title}"?`)) {
      return;
    }
    editForm.delete(route("admin.posts.destroy", article.id), {
      preserveScroll: true
    });
  };
  const openCreate = () => {
    createCategoryPicker.reset();
    setShowCreate(true);
  };
  const handleCreateSubmit = (event) => {
    event.preventDefault();
    createForm.post(route("admin.posts.store"), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setShowCreate(false);
        createForm.reset();
        createCategoryPicker.reset();
      }
    });
  };
  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }
    editForm.post(route("admin.posts.update", editingId), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setShowEdit(false);
        setEditingId(null);
        setEditingArticle(null);
        editCategoryPicker.reset();
      }
    });
  };
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold leading-tight text-gray-800", children: "Articoli" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Articoli" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx(
          PostsManagementCard,
          {
            articles: articleRows,
            paginationLinks,
            categories,
            filters: tableFilters,
            onFilterChange: updateFilters,
            onFilterReset: resetFilters,
            onToggleSort: toggleSort,
            sortLabel,
            onCreateClick: openCreate,
            onEdit: openEdit,
            onDelete: handleDelete
          }
        ) }) }),
        /* @__PURE__ */ jsx(
          CreateArticleModal,
          {
            show: showCreate,
            onClose: () => setShowCreate(false),
            form: createForm,
            categories,
            categoryPicker: createCategoryPicker,
            coverPreview: createCoverPreview,
            thumbPreview: createThumbPreview,
            onSubmit: handleCreateSubmit
          }
        ),
        /* @__PURE__ */ jsx(
          EditArticleModal,
          {
            show: showEdit,
            onClose: () => setShowEdit(false),
            form: editForm,
            article: editingArticle,
            categories,
            categoryPicker: editCategoryPicker,
            coverPreview: editCoverPreview,
            thumbPreview: editThumbPreview,
            imageTime,
            onSubmit: handleEditSubmit
          }
        )
      ]
    }
  );
}
export {
  Posts as default
};
