import InputError from "@/Components/InputError";

export default function TensionFormField({ label, error, children }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-600">{label}</label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}
