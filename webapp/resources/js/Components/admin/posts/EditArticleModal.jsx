import Modal from "@/Components/Modal";
import ArticleForm from "@/Components/admin/posts/form/ArticleForm";
import { storageUrl } from "@/lib/admin/posts";

export default function EditArticleModal({
    show,
    onClose,
    form,
    article,
    categories,
    categoryPicker,
    coverPreview,
    thumbPreview,
    imageTime,
    onSubmit,
}) {
    const existingCoverUrl = article?.cover_path
        ? storageUrl(article.cover_path, imageTime)
        : null;
    const existingThumbUrl = article?.thumb_path
        ? storageUrl(article.thumb_path, imageTime)
        : null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">Modifica articolo</h3>
                <p className="mt-1 text-sm text-slate-500">Aggiorna i dettagli principali.</p>
                <ArticleForm
                    form={form}
                    categories={categories}
                    categoryPicker={categoryPicker}
                    coverPreview={coverPreview}
                    thumbPreview={thumbPreview}
                    existingCoverUrl={coverPreview ? null : existingCoverUrl}
                    existingThumbUrl={thumbPreview ? null : existingThumbUrl}
                    idPrefix="edit"
                    submitLabel="Aggiorna"
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
