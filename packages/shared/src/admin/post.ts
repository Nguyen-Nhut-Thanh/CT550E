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

export type PostCategory = {
  category_id: number;
  name: string;
  description?: string | null;
  _count?: {
    posts?: number;
  };
};

export type PostItem = {
  post_id: number;
  title: string;
  summary: string | null;
  content: string;
  thumbnail: string | null;
  category_id: number;
  status: number;
  created_at?: string;
  slug?: string;
  category?: {
    name?: string | null;
  } | null;
};

export type PostEditorForm = {
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  category_id: string;
  status: number;
};

export type PostCategoryDraft = {
  name: string;
  description: string;
};
