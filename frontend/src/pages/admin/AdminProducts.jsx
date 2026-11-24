import React, { useState, useEffect, useMemo, useRef } from 'react';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SearchBar from '../../components/SearchBar';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prods, cats] = await Promise.all([
        productService.getAllProducts({ ordering: '-created_at' }),
        categoryService.getAllCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err) {
      setError('Failed to load products.');
      addToast('Error loading product catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        p.category_name?.toLowerCase().includes(search.toLowerCase().trim());
      const matchesCat =
        !selectedCategoryFilter || p.category === parseInt(selectedCategoryFilter);
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategoryFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStockQuantity('');
    setCategory(categories[0]?.id || '');
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setStockQuantity(p.stock_quantity);
    setCategory(p.category);
    setImageFile(null);
    setImagePreview(getImageUrl(p.image));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, image: 'Image size must be under 5MB.' }));
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!name.trim()) errors.name = 'Product name is required.';
    if (!price || parseFloat(price) <= 0) errors.price = 'Price must be greater than 0.';
    if (stockQuantity === '' || parseInt(stockQuantity) < 0)
      errors.stock_quantity = 'Stock quantity cannot be negative.';
    if (!category) errors.category = 'Please select a valid category.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormSubmitting(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', parseFloat(price).toFixed(2));
    formData.append('stock_quantity', parseInt(stockQuantity, 10));
    formData.append('category', category);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData, true);
        addToast(`Product "${name}" updated successfully!`, 'success');
      } else {
        await productService.createProduct(formData);
        addToast(`Product "${name}" created successfully!`, 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      const resErrors = err.response?.data || {};
      const formatted = {};
      Object.keys(resErrors).forEach((key) => {
        formatted[key] = Array.isArray(resErrors[key]) ? resErrors[key][0] : resErrors[key];
      });
      setFormErrors(formatted);
      addToast('Failed to save product. Check validation errors.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (p) => {
    setProductToDelete(p);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      addToast(`Product "${productToDelete.name}" deleted.`, 'success');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadData();
    } catch (err) {
      addToast('Failed to delete product.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:8000';
    return `${base}${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage catalogue items, update stock, set pricing, and upload images.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search by name or category..."
          />

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end md:self-auto">
          Showing <span className="text-slate-800">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading inventory..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const imgUrl = getImageUrl(p.image);
                    const isOutOfStock = p.stock_quantity <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        {/* Image + Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{p.name}</p>
                              <span className="text-xs text-slate-400">ID: #{p.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-slate-700 font-semibold">
                            {p.category_name}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          ${parseFloat(p.price).toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Out of stock
                            </span>
                          ) : p.stock_quantity <= 5 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Low: {p.stock_quantity} left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> {p.stock_quantity} units
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(p)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wireless Noise Canceling Headphones"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.category}</p>
                  )}
                </div>

                {/* Price and Stock Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49.99"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                    />
                    {formErrors.price && (
                      <p className="text-xs text-rose-600 mt-1">{formErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Available Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="25"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                    />
                    {formErrors.stock_quantity && (
                      <p className="text-xs text-rose-600 mt-1">{formErrors.stock_quantity}</p>
                    )}
                  </div>
                </div>

                {/* Image Upload with Live Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Image (Max 5MB)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 bg-white text-slate-800 font-bold text-xs rounded-xl shadow-md hover:bg-gray-100 transition"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="p-1.5 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition bg-gray-50/50 hover:bg-brand-50/30 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Click to upload product image</p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                    </div>
                  )}

                  {formErrors.image && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.image}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
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
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Save Product'
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
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdminProducts;
