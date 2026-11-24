import React, { useState, useEffect, useMemo } from 'react';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SearchBar from '../../components/SearchBar';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Calendar, 
  Package 
} from 'lucide-react';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      setError('Failed to load categories.');
      addToast('Error loading categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [categories, search]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name: categoryName.trim() });
        addToast(`Category "${categoryName}" updated successfully!`, 'success');
      } else {
        await categoryService.createCategory({ name: categoryName.trim() });
        addToast(`Category "${categoryName}" created successfully!`, 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.error ||
        'Failed to save category. Please ensure the name is unique.';
      setFormError(msg);
      addToast(msg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      addToast(`Category "${categoryToDelete.name}" deleted successfully.`, 'success');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete category.';
      addToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize catalog products into customer-facing departments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search categories by name..."
        />
        <div className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
          Showing <span className="text-slate-800">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading categories..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Products Linked</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No categories found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-400 text-xs">#{cat.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-xs">
                          {cat.name.charAt(0)}
                        </div>
                        {cat.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-slate-700">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {cat.products_count !== undefined ? `${cat.products_count} items` : '0 items'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(cat.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(cat)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Home Appliances"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm shadow-brand-500/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    'Update Category'
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Any linked products will also be affected.`}
        confirmLabel="Yes, Delete"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdminCategories;
