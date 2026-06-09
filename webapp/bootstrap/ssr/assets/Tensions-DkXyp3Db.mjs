import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState, useMemo } from "react";
import { A as Authenticated } from "./AuthenticatedLayout-dpwVNFAu.mjs";
import { router, useForm, Head } from "@inertiajs/react";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-DRB3Bbat.mjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import { A as AdminPagination } from "./AdminPagination-D6_hrmXq.mjs";
import { M as Modal } from "./Modal-BnFbDATV.mjs";
import { I as InputError } from "./InputError-cRVTeK4i.mjs";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "./SeoHead-9Gv-Y1Y7.mjs";
function TensionsStatsCard({ stats = {} }) {
  return /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Totali" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-slate-900", children: stats.total ?? 0 })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Rischio alto (≥70)" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-slate-900", children: stats.high ?? 0 })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Rischio medio" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-slate-900", children: stats.avg ?? 0 })
    ] })
  ] }) });
}
const TREND_LABELS = {
  rising: "In crescita",
  falling: "In calo",
  stable: "Stabile"
};
function emptyTensionForm() {
  return {
    region_name: "",
    display_region_name: "",
    risk_score: 50,
    trend_direction: "stable",
    status_label: "",
    featured_article_id: "",
    latitude: "",
    longitude: ""
  };
}
function emptyEditTensionForm() {
  return {
    _method: "put",
    ...emptyTensionForm()
  };
}
function tensionToEditFormData(item) {
  return {
    _method: "put",
    region_name: item.region_name || "",
    display_region_name: item.display_region_name || "",
    risk_score: item.risk_score || 50,
    trend_direction: item.trend_direction || "stable",
    status_label: item.status_label || "",
    featured_article_id: item.featured_article_id ? String(item.featured_article_id) : "",
    latitude: item.latitude ?? "",
    longitude: item.longitude ?? ""
  };
}
function articleOptionLabel(article) {
  const status = article.status ? ` (${article.status})` : "";
  return `${article.title}${status}`;
}
function TensionsTableRow({ tension, onEdit, onDelete }) {
  const trend = TREND_LABELS[tension.trend_direction] || TREND_LABELS.stable;
  const regionLabel = tension.display_region_name || tension.region_name;
  return /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100", children: [
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 font-medium text-slate-900", children: regionLabel }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-slate-600", children: tension.risk_score }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-slate-600", children: trend }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-slate-600", children: tension.status_label }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: tension.featured_article ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-800", children: tension.featured_article.title }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
        "ID ",
        tension.featured_article.id,
        tension.featured_article.status ? ` • ${tension.featured_article.status}` : ""
      ] })
    ] }) : /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "—" }) }),
    /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onEdit(tension),
          className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50",
          "aria-label": "Modifica tensione",
          children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onDelete(tension),
          className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50",
          "aria-label": "Elimina tensione",
          children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
        }
      )
    ] }) })
  ] });
}
function TensionsTable({ tensions = [], onEdit, onDelete }) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "border-b border-slate-200 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { className: "text-left", children: [
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Regione" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Risk" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Trend" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Stato" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 font-medium", children: "Articolo di riferimento" }),
      /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 text-right font-medium", children: "Azioni" })
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      tensions.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "6", className: "py-6 text-slate-500", children: "Nessuna tensione." }) }),
      tensions.map((tension) => /* @__PURE__ */ jsx(
        TensionsTableRow,
        {
          tension,
          onEdit,
          onDelete
        },
        tension.id
      ))
    ] })
  ] }) });
}
function TensionsManagementCard({
  tensions = [],
  paginationLinks = [],
  searchQuery = "",
  onSearchChange,
  onCreateClick,
  onEdit,
  onDelete
}) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Gestione tensioni" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "CRUD per la barra tensioni del blog. Ogni tensione è collegata a un articolo." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: onCreateClick,
          className: "inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Nuova tensione"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
        "input",
        {
          defaultValue: searchQuery,
          placeholder: "Cerca regione, stato o articolo",
          className: "w-full rounded-md border border-slate-200 px-3 py-2 text-sm",
          onChange: (e) => onSearchChange(e.target.value)
        },
        searchQuery
      ) }),
      /* @__PURE__ */ jsx(TensionsTable, { tensions, onEdit, onDelete }),
      /* @__PURE__ */ jsx(AdminPagination, { links: paginationLinks })
    ] })
  ] });
}
function TensionFormField({ label, error, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-slate-600", children: label }),
    children,
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
const inputClassName = "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm";
function TensionForm({
  form,
  articles = [],
  submitLabel = "Salva",
  onSubmit,
  onCancel
}) {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: (event) => {
        event.preventDefault();
        onSubmit();
      },
      className: "mt-4 space-y-4",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(TensionFormField, { label: "Regione", error: form.errors.region_name, children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputClassName,
              value: form.data.region_name,
              onChange: (e) => form.setData("region_name", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(
            TensionFormField,
            {
              label: "Nome parlante",
              error: form.errors.display_region_name,
              children: /* @__PURE__ */ jsx(
                "input",
                {
                  className: inputClassName,
                  value: form.data.display_region_name,
                  onChange: (e) => form.setData("display_region_name", e.target.value),
                  placeholder: "Es. USA-Iran, Cina-Taiwan"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(TensionFormField, { label: "Risk score (1-100)", error: form.errors.risk_score, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "100",
              className: inputClassName,
              value: form.data.risk_score,
              onChange: (e) => form.setData("risk_score", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(TensionFormField, { label: "Trend", error: form.errors.trend_direction, children: /* @__PURE__ */ jsxs(
            "select",
            {
              className: inputClassName,
              value: form.data.trend_direction,
              onChange: (e) => form.setData("trend_direction", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "stable", children: "Stabile" }),
                /* @__PURE__ */ jsx("option", { value: "rising", children: "In crescita" }),
                /* @__PURE__ */ jsx("option", { value: "falling", children: "In calo" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(TensionFormField, { label: "Etichetta stato", error: form.errors.status_label, children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputClassName,
              value: form.data.status_label,
              onChange: (e) => form.setData("status_label", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(
            TensionFormField,
            {
              label: "Articolo di riferimento",
              error: form.errors.featured_article_id,
              children: /* @__PURE__ */ jsxs(
                "select",
                {
                  className: inputClassName,
                  value: form.data.featured_article_id,
                  onChange: (e) => form.setData("featured_article_id", e.target.value),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Seleziona un articolo" }),
                    articles.map((article) => /* @__PURE__ */ jsx("option", { value: String(article.id), children: articleOptionLabel(article) }, article.id))
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsx(TensionFormField, { label: "Latitudine", error: form.errors.latitude, children: /* @__PURE__ */ jsx(
              "input",
              {
                className: inputClassName,
                value: form.data.latitude,
                onChange: (e) => form.setData("latitude", e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx(TensionFormField, { label: "Longitudine", error: form.errors.longitude, children: /* @__PURE__ */ jsx(
              "input",
              {
                className: inputClassName,
                value: form.data.longitude,
                onChange: (e) => form.setData("longitude", e.target.value)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          onCancel && /* @__PURE__ */ jsx(
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
              className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60",
              children: submitLabel
            }
          )
        ] })
      ]
    }
  );
}
function CreateTensionModal({
  show,
  onClose,
  form,
  articles,
  onSubmit
}) {
  return /* @__PURE__ */ jsx(Modal, { show, onClose, maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Nuova tensione" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Collega la tensione a un articolo esistente." }),
    /* @__PURE__ */ jsx(
      TensionForm,
      {
        form,
        articles,
        submitLabel: "Salva",
        onSubmit,
        onCancel: onClose
      }
    )
  ] }) });
}
function EditTensionModal({
  show,
  onClose,
  form,
  articles,
  onSubmit
}) {
  return /* @__PURE__ */ jsx(Modal, { show, onClose, maxWidth: "2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Modifica tensione" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Aggiorna i dati mostrati nella barra tensioni del blog." }),
    /* @__PURE__ */ jsx(
      TensionForm,
      {
        form,
        articles,
        submitLabel: "Aggiorna",
        onSubmit,
        onCancel: onClose
      }
    )
  ] }) });
}
function useTensionsSearch(initialQuery = "") {
  const debounceRef = useRef(null);
  const applySearch = (q) => {
    router.get(
      route("admin.tensions.index"),
      { q },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };
  const onSearchChange = (value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      applySearch(value);
    }, 350);
  };
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  return {
    initialQuery,
    onSearchChange
  };
}
function Tensions({
  auth,
  tensions = { data: [], links: [] },
  filters = {},
  articles = [],
  stats = {}
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const createForm = useForm(emptyTensionForm());
  const editForm = useForm(emptyEditTensionForm());
  const rows = useMemo(() => tensions?.data || [], [tensions]);
  const paginationLinks = useMemo(() => tensions?.links || [], [tensions]);
  const { initialQuery, onSearchChange } = useTensionsSearch(filters.q || "");
  const openEdit = (item) => {
    setEditingId(item.id);
    editForm.setData(tensionToEditFormData(item));
    setShowEdit(true);
  };
  const handleDelete = (item) => {
    if (!confirm(`Eliminare la tensione "${item.display_region_name || item.region_name}"?`)) {
      return;
    }
    editForm.delete(route("admin.tensions.destroy", item.id), {
      preserveScroll: true
    });
  };
  const openCreate = () => {
    createForm.reset();
    createForm.clearErrors();
    setShowCreate(true);
  };
  const handleCreateSubmit = () => {
    createForm.post(route("admin.tensions.store"), {
      preserveScroll: true,
      onSuccess: () => {
        setShowCreate(false);
        createForm.reset();
      }
    });
  };
  const handleEditSubmit = () => {
    if (!editingId) {
      return;
    }
    editForm.post(route("admin.tensions.update", editingId), {
      preserveScroll: true,
      onSuccess: () => {
        setShowEdit(false);
        setEditingId(null);
      }
    });
  };
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold leading-tight text-gray-800", children: "Tensioni" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Tensioni" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx(TensionsStatsCard, { stats }),
          /* @__PURE__ */ jsx(
            TensionsManagementCard,
            {
              tensions: rows,
              paginationLinks,
              searchQuery: initialQuery,
              onSearchChange,
              onCreateClick: openCreate,
              onEdit: openEdit,
              onDelete: handleDelete
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          CreateTensionModal,
          {
            show: showCreate,
            onClose: () => setShowCreate(false),
            form: createForm,
            articles,
            onSubmit: handleCreateSubmit
          }
        ),
        /* @__PURE__ */ jsx(
          EditTensionModal,
          {
            show: showEdit,
            onClose: () => setShowEdit(false),
            form: editForm,
            articles,
            onSubmit: handleEditSubmit
          }
        )
      ]
    }
  );
}
export {
  Tensions as default
};
