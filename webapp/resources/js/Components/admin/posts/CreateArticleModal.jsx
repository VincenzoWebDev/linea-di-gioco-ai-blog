import Modal from "@/Components/Modal";
import ArticleForm from "@/Components/admin/posts/form/ArticleForm";

export default function CreateArticleModal({
    show,
    onClose,
    form,
    categories,
    categoryPicker,
    coverPreview,
    thumbPreview,
    onSubmit,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">Nuovo articolo</h3>
                <p className="mt-1 text-sm text-slate-500">Inserisci i dettagli principali.</p>
                <ArticleForm
                    form={form}
                    categories={categories}
                    categoryPicker={categoryPicker}
                    coverPreview={coverPreview}
                    thumbPreview={thumbPreview}
                    idPrefix="create"
                    submitLabel="Salva"
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
