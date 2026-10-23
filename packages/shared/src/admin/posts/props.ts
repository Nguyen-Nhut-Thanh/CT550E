import type { PostCategoryDraft, PostEditorForm } from "./forms";
import type { PostCategory } from "./models";
export type PostCategoriesModalProps = {
    open: boolean;
    categories: PostCategory[];
    newCategory: PostCategoryDraft;
    saving: boolean;
    onClose: () => void;
    onCreate: () => void;
    onDraftChange: (draft: PostCategoryDraft) => void;
};
export type PostEditorContentProps = {
    form: PostEditorForm;
    onFormChange: (updater: (prev: PostEditorForm) => PostEditorForm) => void;
};
export type PostEditorSidebarProps = {
    isNew: boolean;
    saving: boolean;
    categories: PostCategory[];
    form: PostEditorForm;
    onSave: () => void;
    onCancel: () => void;
    onFormChange: (updater: (prev: PostEditorForm) => PostEditorForm) => void;
};
