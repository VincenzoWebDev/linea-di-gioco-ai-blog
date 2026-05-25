import { useState } from "react";

export function useCategoryPicker(form, fieldName = "category_ids") {
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
        reset,
    };
}
