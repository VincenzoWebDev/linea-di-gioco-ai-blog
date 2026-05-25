import Modal from "@/Components/Modal";
import TensionForm from "@/Components/admin/tensions/form/TensionForm";

export default function CreateTensionModal({
    show,
    onClose,
    form,
    articles,
    onSubmit,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">Nuova tensione</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Collega la tensione a un articolo esistente.
                </p>
                <TensionForm
                    form={form}
                    articles={articles}
                    submitLabel="Salva"
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
