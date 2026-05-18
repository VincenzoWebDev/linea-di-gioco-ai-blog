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
function Categories({
  auth,
  categories = { data: [], links: [] },
  filters = {}
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(filters.q || "");
  const debounceRef = useRef(null);
  const rows = useMemo(() => categories?.data || [], [categories]);
  const links = useMemo(() => categories?.links || [], [categories]);
  const createForm = useForm({
    name: "",
    slug: "",
    description: "",
    is_active: true
  });
  const editForm = useForm({
    _method: "put",
    name: "",
    slug: "",
    description: "",
    is_active: true
  });
  const applySearch = (q) => {
    router.get(
      route("admin.categories.index"),
      { q },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  const handleSearchChange = (value) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => applySearch(value), 300);
  };
  const openEdit = (category) => {
    setEditingId(category.id);
    editForm.setData({
      _method: "put",
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      is_active: Boolean(category.is_active)
    });
    setShowEdit(true);
  };
  const handleDelete = (category) => {
    if (!confirm(`Eliminare la categoria "${category.name}"?`)) {
      return;
    }
    router.delete(route("admin.categories.destroy", category.id), {
      preserveScroll: true,
      preserveState: true
    });
  };
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Categorie" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Categorie" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Gestione categorie" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Usate per classificare articoli manuali e AI." })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowCreate(true),
                className: "inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  "Nuova categoria"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm sm:max-w-sm",
                placeholder: "Cerca categoria...",
                value: search,
                onChange: (e) => handleSearchChange(e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { className: "border-b border-slate-200 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { className: "text-left", children: [
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "ID" }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Nome" }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Slug" }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Stato" }),
                /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium text-right", children: "Azioni" })
              ] }) }),
              /* @__PURE__ */ jsxs("tbody", { children: [
                rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "py-6 text-slate-500", colSpan: "5", children: "Nessuna categoria presente." }) }),
                rows.map((category) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: category.id }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-900 font-medium", children: category.name }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4 text-slate-600", children: category.slug }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4", children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${category.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`,
                      children: category.is_active ? "attiva" : "disattiva"
                    }
                  ) }),
                  /* @__PURE__ */ jsx("td", { className: "py-4 pr-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => openEdit(category),
                        className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50",
                        "aria-label": "Modifica",
                        children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleDelete(category),
                        className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50",
                        "aria-label": "Elimina",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }) })
                ] }, category.id))
              ] })
            ] }) }),
            links.length > 3 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: links.map((link, idx) => {
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
        /* @__PURE__ */ jsx(Modal, { show: showCreate, onClose: () => setShowCreate(false), maxWidth: "lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Nuova categoria" }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault();
                createForm.post(route("admin.categories.store"), {
                  preserveScroll: true,
                  onSuccess: () => {
                    setShowCreate(false);
                    createForm.reset();
                  }
                });
              },
              className: "mt-5 space-y-4",
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Nome" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      value: createForm.data.name,
                      onChange: (e) => createForm.setData("name", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: createForm.errors.name, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Slug (opzionale)" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      value: createForm.data.slug,
                      onChange: (e) => createForm.setData("slug", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: createForm.errors.slug, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Descrizione" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      rows: "3",
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      value: createForm.data.description,
                      onChange: (e) => createForm.setData("description", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: createForm.errors.description, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-slate-700", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: createForm.data.is_active,
                      onChange: (e) => createForm.setData("is_active", e.target.checked)
                    }
                  ),
                  "Categoria attiva"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
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
                      className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white",
                      children: "Salva"
                    }
                  )
                ] })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(Modal, { show: showEdit, onClose: () => setShowEdit(false), maxWidth: "lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Modifica categoria" }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault();
                if (!editingId) {
                  return;
                }
                editForm.post(route("admin.categories.update", editingId), {
                  preserveScroll: true,
                  onSuccess: () => {
                    setShowEdit(false);
                    setEditingId(null);
                  }
                });
              },
              className: "mt-5 space-y-4",
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Nome" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      value: editForm.data.name,
                      onChange: (e) => editForm.setData("name", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: editForm.errors.name, className: "mt-1" })
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
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: "Descrizione" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      rows: "3",
                      className: "mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
                      value: editForm.data.description,
                      onChange: (e) => editForm.setData("description", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: editForm.errors.description, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-slate-700", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: editForm.data.is_active,
                      onChange: (e) => editForm.setData("is_active", e.target.checked)
                    }
                  ),
                  "Categoria attiva"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
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
                      className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white",
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
  Categories as default
};
