import Modal from "@/Components/Modal";
import TensionForm from "@/Components/admin/tensions/form/TensionForm";

export default function EditTensionModal({
    show,
    onClose,
    form,
    articles,
    onSubmit,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">Modifica tensione</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Aggiorna i dati mostrati nella barra tensioni del blog.
                </p>
                <TensionForm
                    form={form}
                    articles={articles}
                    submitLabel="Aggiorna"
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
