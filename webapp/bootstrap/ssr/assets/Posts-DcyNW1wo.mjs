import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from "react";
import { A as Authenticated } from "./AuthenticatedLayout-DuqH5o4I.mjs";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-DRB3Bbat.mjs";
import { M as Modal } from "./Modal-BnFbDATV.mjs";
import { I as InputError } from "./InputError-cRVTeK4i.mjs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "./SeoHead-Bfgu-MHE.mjs";
const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700"
};
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
  const [tableFilters, setTableFilters] = useState({
    q: filters.q || "",
    status: filters.status || "",
    created_by: filters.created_by || "",
    publication: filters.publication || "",
    category_ids: filters.category_ids || "",
    per_page: String(filters.per_page || 15)
  });
  const [createCoverPreview, setCreateCoverPreview] = useState(null);
  const [createThumbPreview, setCreateThumbPreview] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [editThumbPreview, setEditThumbPreview] = useState(null);
  const [createCategoryToAdd, setCreateCategoryToAdd] = useState("");
  const [editCategoryToAdd, setEditCategoryToAdd] = useState("");
  const [imageTime, setImageTime] = useState(Date.now());
  const searchDebounceRef = useRef(null);
  const createForm = useForm({
    title: "",
    slug: "",
    summary: "",
    content: "",
    category_ids: [],
    status: "draft",
    published_at: "",
    cover: null,
    thumb: null
  });
  const editForm = useForm({
    id: null,
    _method: "put",
    title: "",
    slug: "",
    summary: "",
    content: "",
    category_ids: [],
    status: "draft",
    published_at: "",
    cover: null,
    thumb: null
  });
  const articleRows = useMemo(() => articles?.data || [], [articles]);
  const paginationLinks = useMemo(() => articles?.links || [], [articles]);
  const openEdit = (article) => {
    setEditingId(article.id);
    setEditingArticle(article);
    setEditCategoryToAdd("");
    setImageTime(Date.now());
    editForm.setData({
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
    });
    setShowEdit(true);
  };
  const storageUrl = (path, time = null) => {
    if (!path) {
      return null;
    }
    return time ? `/storage/${path}?t=${time}` : `/storage/${path}`;
  };
  useEffect(() => {
    if (!createForm.data.cover) {
      setCreateCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(createForm.data.cover);
    setCreateCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createForm.data.cover]);
  useEffect(() => {
    if (!createForm.data.thumb) {
      setCreateThumbPreview(null);
      return;
    }
    const url = URL.createObjectURL(createForm.data.thumb);
    setCreateThumbPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createForm.data.thumb]);
  useEffect(() => {
    if (!editForm.data.cover) {
      setEditCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(editForm.data.cover);
    setEditCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editForm.data.cover]);
  useEffect(() => {
    if (!editForm.data.thumb) {
      setEditThumbPreview(null);
      return;
    }
    const url = URL.createObjectURL(editForm.data.thumb);
    setEditThumbPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editForm.data.thumb]);
  const handleDelete = (article) => {
    if (!confirm(`Eliminare l'articolo "${article.title}"?`)) {
      return;
    }
    editForm.delete(route("admin.posts.destroy", article.id), {
      preserveScroll: true
    });
  };
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
    const reset = {
      q: "",
      status: "",
      created_by: "",
      publication: "",
      category_ids: "",
      per_page: "15"
    };
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
  const addCategoryToCreate = () => {
    if (!createCategoryToAdd) {
      return;
    }
    const current = Array.isArray(createForm.data.category_ids) ? createForm.data.category_ids : [];
    if (!current.includes(createCategoryToAdd)) {
      createForm.setData("category_ids", [...current, createCategoryToAdd]);
    }
  };
  const addCategoryToEdit = () => {
    if (!editCategoryToAdd) {
      return;
    }
    const current = Array.isArray(editForm.data.category_ids) ? editForm.data.category_ids : [];
    if (!current.includes(editCategoryToAdd)) {
      editForm.setData("category_ids", [...current, editCategoryToAdd]);
    }
  };
  const removeCategoryFromCreate = (categoryId) => {
    const current = Array.isArray(createForm.data.category_ids) ? createForm.data.category_ids : [];
    createForm.setData(
      "category_ids",
      current.filter((id) => id !== categoryId)
    );
  };
  const removeCategoryFromEdit = (categoryId) => {
    const current = Array.isArray(editForm.data.category_ids) ? editForm.data.category_ids : [];
    editForm.setData(
      "category_ids",
      current.filter((id) => id !== categoryId)
    );
  };
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Articoli" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Articoli" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Gestione articoli" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Lista articoli con stato editoriale." })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setCreateCategoryToAdd("");
                  setShowCreate(true);
                },
                className: "inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  "Nuovo articolo"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                  placeholder: "Cerca (titolo, slug, id)",
                  value: tableFilters.q,
                  onChange: (e) => updateFilters(
                    { q: e.target.value },
                    { debounce: true }
                  )
                }
              ),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                  value: tableFilters.status,
                  onChange: (e) => updateFilters({ status: e.target.value }),
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
                  value: tableFilters.created_by,
                  onChange: (e) => updateFilters({ created_by: e.target.value }),
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
                  value: tableFilters.publication,
                  onChange: (e) => updateFilters({ publication: e.target.value }),
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
                  value: tableFilters.category_ids || "",
                  onChange: (e) => updateFilters({ category_ids: e.target.value }),
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
                  value: tableFilters.per_page,
                  onChange: (e) => updateFilters({ per_page: e.target.value }),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "10", children: "10 / pagina" }),
                    /* @__PURE__ */ jsx("option", { value: "15", children: "15 / pagina" }),
                    /* @__PURE__ */ jsx("option", { value: "25", children: "25 / pagina" }),
                    /* @__PURE__ */ jsx("option", { value: "50", children: "50 / pagina" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "sm:col-span-2 lg:col-span-6 flex justify-end gap-2", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: resetFilters,
                  className: "rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700",
                  children: "Reset"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { className: "border-b border-slate-200 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { className: "text-left", children: [
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleSort("id"), children: [
                  "ID",
                  sortLabel("id")
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleSort("title"), children: [
                  "Titolo",
                  sortLabel("title")
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Categorie" }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleSort("status"), children: [
                  "Stato",
                  sortLabel("status")
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleSort("published_at"), children: [
                  "Pubblicazione",
                  sortLabel("published_at")
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleSort("created_at"), children: [
                  "Creato il",
                  sortLabel("created_at")
                ] }) }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium text-right", children: "Azioni" })
              ] }) }),
              /* @__PURE__ */ jsxs("tbody", { children: [
                articleRows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "py-6 text-slate-500", colSpan: "7", children: "Nessun articolo presente." }) }),
                articleRows.map((article) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: article.id }),
                  /* @__PURE__ */ jsxs("td", { className: "py-4 pr-4", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-slate-900", children: article.title }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: article.slug })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: Array.isArray(article.categories) && article.categories.length > 0 ? article.categories.map((category) => category.name).join(", ") : "-" }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4", children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[article.status] || statusStyles.draft}`,
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
                        onClick: () => openEdit(article),
                        className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50",
                        "aria-label": "Modifica",
                        children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleDelete(article),
                        className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50",
                        "aria-label": "Elimina",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }) })
                ] }, article.id))
              ] })
            ] }) }),
            paginationLinks.length > 3 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: paginationLinks.map((link, idx) => {
              const label = link.label.replace("&laquo;", "«").replace("&raquo;", "»");
              if (!link.url) {
                return /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-400",
                    children: label
                  },
                  `${idx}-${label}`
                );
              }
              return /* @__PURE__ */ jsx(
                Link,
                {
                  href: link.url,
                  preserveScroll: true,
                  preserveState: true,
                  className: `rounded-md border px-3 py-1 text-sm ${link.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`,
                  children: label
                },
                `${idx}-${label}`
              );
            }) })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Modal, { show: showCreate, onClose: () => setShowCreate(false), maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Nuovo articolo" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Inserisci i dettagli principali." }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (event) => {
                event.preventDefault();
                createForm.post(route("admin.posts.store"), {
                  forceFormData: true,
                  preserveScroll: true,
                  onSuccess: () => {
                    setShowCreate(false);
                    createForm.reset();
                    setCreateCategoryToAdd("");
                  }
                });
              },
              className: "mt-6 space-y-4",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Titolo" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: createForm.data.title,
                        onChange: (e) => createForm.setData("title", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.title, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Slug" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: createForm.data.slug,
                        onChange: (e) => createForm.setData("slug", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.slug, className: "mt-1" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Summary" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      rows: "3",
                      value: createForm.data.summary,
                      onChange: (e) => createForm.setData("summary", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: createForm.errors.summary, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Contenuto" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      rows: "6",
                      value: createForm.data.content,
                      onChange: (e) => createForm.setData("content", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: createForm.errors.content, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Categorie" }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                          value: createCategoryToAdd,
                          onChange: (e) => setCreateCategoryToAdd(e.target.value),
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
                          onClick: addCategoryToCreate,
                          className: "rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700",
                          children: "Aggiungi"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: (createForm.data.category_ids || []).map((categoryId) => {
                      const category = categories.find((item) => String(item.id) === String(categoryId));
                      return /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => removeCategoryFromCreate(categoryId),
                          className: "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700",
                          children: [
                            category?.name || `ID ${categoryId}`,
                            " ×"
                          ]
                        },
                        `create-cat-${categoryId}`
                      );
                    }) }),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.category_ids, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Stato" }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: createForm.data.status,
                        onChange: (e) => createForm.setData("status", e.target.value),
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                          /* @__PURE__ */ jsx("option", { value: "review", children: "Review" }),
                          /* @__PURE__ */ jsx("option", { value: "published", children: "Published" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.status, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Pubblicato il" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "date",
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: createForm.data.published_at,
                        onChange: (e) => createForm.setData("published_at", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.published_at, className: "mt-1" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("label", { className: "group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: "Cover" }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: createForm.data.cover?.name || "Seleziona immagine" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300", children: "Carica" })
                    ] }),
                    createCoverPreview && /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-md border border-slate-200 bg-white", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: createCoverPreview,
                        alt: "Preview cover",
                        className: "h-32 w-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        className: "sr-only",
                        onChange: (e) => createForm.setData("cover", e.target.files[0])
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.cover, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: "Thumb" }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: createForm.data.thumb?.name || "Seleziona immagine" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300", children: "Carica" })
                    ] }),
                    createThumbPreview && /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-md border border-slate-200 bg-white", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: createThumbPreview,
                        alt: "Preview thumb",
                        className: "h-32 w-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        className: "sr-only",
                        onChange: (e) => createForm.setData("thumb", e.target.files[0])
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: createForm.errors.thumb, className: "mt-2" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowCreate(false),
                      className: "rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600",
                      children: "Annulla"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: createForm.processing,
                      className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
                      children: "Salva"
                    }
                  )
                ] })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(Modal, { show: showEdit, onClose: () => setShowEdit(false), maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Modifica articolo" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Aggiorna i dettagli principali." }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (event) => {
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
                    setEditCategoryToAdd("");
                  }
                });
              },
              className: "mt-6 space-y-4",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Titolo" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: editForm.data.title,
                        onChange: (e) => editForm.setData("title", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.title, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Slug" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: editForm.data.slug,
                        onChange: (e) => editForm.setData("slug", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.slug, className: "mt-1" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Summary" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      rows: "3",
                      value: editForm.data.summary,
                      onChange: (e) => editForm.setData("summary", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: editForm.errors.summary, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Contenuto" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      rows: "6",
                      value: editForm.data.content,
                      onChange: (e) => editForm.setData("content", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: editForm.errors.content, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Categorie" }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                          value: editCategoryToAdd,
                          onChange: (e) => setEditCategoryToAdd(e.target.value),
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
                          onClick: addCategoryToEdit,
                          className: "rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700",
                          children: "Aggiungi"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: (editForm.data.category_ids || []).map((categoryId) => {
                      const category = categories.find((item) => String(item.id) === String(categoryId));
                      return /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => removeCategoryFromEdit(categoryId),
                          className: "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700",
                          children: [
                            category?.name || `ID ${categoryId}`,
                            " ×"
                          ]
                        },
                        `edit-cat-${categoryId}`
                      );
                    }) }),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.category_ids, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Stato" }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: editForm.data.status,
                        onChange: (e) => editForm.setData("status", e.target.value),
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                          /* @__PURE__ */ jsx("option", { value: "review", children: "Review" }),
                          /* @__PURE__ */ jsx("option", { value: "published", children: "Published" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.status, className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Pubblicato il" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "date",
                        className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                        value: editForm.data.published_at,
                        onChange: (e) => editForm.setData("published_at", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.published_at, className: "mt-1" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("label", { className: "group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: "Cover" }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: editForm.data.cover?.name || "Seleziona immagine" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300", children: "Carica" })
                    ] }),
                    (editCoverPreview || storageUrl(editingArticle?.cover_path)) && /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-md border border-slate-200 bg-white", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: editCoverPreview || storageUrl(editingArticle?.cover_path, imageTime),
                        alt: "Preview cover",
                        className: "h-32 w-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        className: "sr-only",
                        onChange: (e) => editForm.setData("cover", e.target.files[0])
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.cover, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: "Thumb" }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: editForm.data.thumb?.name || "Seleziona immagine" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300", children: "Carica" })
                    ] }),
                    (editThumbPreview || storageUrl(editingArticle?.thumb_path)) && /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-md border border-slate-200 bg-white", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: editThumbPreview || storageUrl(editingArticle?.thumb_path, imageTime),
                        alt: "Preview thumb",
                        className: "h-32 w-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        className: "sr-only",
                        onChange: (e) => editForm.setData("thumb", e.target.files[0])
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: editForm.errors.thumb, className: "mt-2" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowEdit(false),
                      className: "rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600",
                      children: "Annulla"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: editForm.processing,
                      className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
                      children: "Aggiorna"
                    }
                  )
                ] })
              ]
            }
          )
        ] }) })
      ]
    }
  );
}
export {
  Posts as default
};
