"use client";
import { useState, useEffect } from "react";
import { Product, ProductFormData } from "@/types/admin/products";
import ProductForm from "@/app/admin/products/components/ProductForm";
import ProductTable from "@/app/admin/products/components/ProductTable";
import { toast } from 'react-hot-toast';

// Delete Modal (copied from AdminPanel)
interface DeleteModalProps {
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}
function DeleteModal({ itemName, onCancel, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center pointer-events-auto border border-gray-200">
        <div className="text-xl font-bold text-gray-900 mb-4">Delete Confirmation</div>
        <div className="mb-6 text-center text-gray-900 font-semibold">
          Are you sure you want to delete <span className="font-bold">{itemName}</span>?
        </div>
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<Product | undefined>(undefined);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tireSizeFilter, setTireSizeFilter] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");

  // --- Compute unique brands and years from products ---
  const brandOptions = [
    "All Brands",
    ...Array.from(
      new Set(
        products
          .map((p) => p.brand?.name || null)
          .filter((b): b is string => !!b)
      )
    ),
  ];

  const yearOptions = [
    "All Years",
    ...Array.from(
      new Set(
        products
          .map((p) => p.year?.toString())
          .filter((y): y is string => !!y)
      )
    ).sort((a, b) => Number(b) - Number(a))
  ];

  // --- Filtering Logic ---
  const filteredProducts = products.filter((product) => {
    // Brand filter
    if (selectedBrand !== "All Brands" && product.brand?.name !== selectedBrand) {
      return false;
    }

    // Year filter
    if (selectedYear !== "All Years" && product.year?.toString() !== selectedYear) {
      return false;
    }

    // Availability filter
    if (availabilityFilter) {
      const availMap: Record<string, string> = {
        "In Stock": "IN_STOCK",
        "Low Stock": "LOW_STOCK",
        "Out of Stock": "OUT_OF_STOCK",
        "Contact Us": "CONTACT_US",
      };
      if (product.availability !== availMap[availabilityFilter]) {
        return false;
      }
    }

    // Price range filter
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price);
    if (minPrice && price < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && price > parseFloat(maxPrice)) {
      return false;
    }

    // Tire size filter
    if (tireSizeFilter && typeof product.width === 'string') {
      if (!product.width.toLowerCase().includes(tireSizeFilter.toLowerCase())) {
        return false;
      }
    }

    // Search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.trim().toLowerCase();
      const nameMatch = product.pattern.toLowerCase().includes(term);
      const brandMatch = product.brand?.name?.toLowerCase().includes(term);
      const tireSizeMatch = typeof product.width === 'string' && product.width.toLowerCase().includes(term);
      if (!nameMatch && !brandMatch && !tireSizeMatch) {
        return false;
      }
    }

    return true;
  });

  // --- Reset all filters ---
  const resetFilters = () => {
    setAvailabilityFilter("");
    setMinPrice("");
    setMaxPrice("");
    setTireSizeFilter("");
    setSelectedYear("All Years");
  };

  // --- Close filter menu when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-popover') && !target.closest('.filter-button')) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setShowProductModal(true);
  };

  async function handleAddOrEditProduct(data: ProductFormData) {
    console.log('Received form data:', data);
    const productData = {
      pattern: data.pattern,
      price: Number(data.price),
      image: data.image,
      brandId: data.brandId ? Number(data.brandId) : null,
      width: data.width,
      profile: data.profile,
      diameter: data.diameter,
      loadIndex: data.loadIndex,
      speedRating: data.speedRating,
      warranty: data.warranty,
      availability: (typeof data.availability === 'string' && data.availability.toUpperCase().replace(/\s/g, '_')) || 'IN_STOCK',
      year: Number(data.year),
      origin: data.origin,
      offer: data.offer,
      offerText: data.offerText,
      description: data.description,
    };
    console.log('Product data to send to API:', productData);
    try {
      if (editProduct) {
        const response = await fetch(`/api/products/${editProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to update product');
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === editProduct.id ? updatedProduct : p));
        toast.success('Product updated successfully');
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to create product');
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        toast.success('Product created successfully');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setShowProductModal(false);
      setEditProduct(undefined);
    }
  }

  async function handleDeleteProduct(product: Product) {
    setDeleteProduct(product);
  }

  async function handleConfirmDelete() {
    if (!deleteProduct) return;
    try {
      const response = await fetch(`/api/products/${deleteProduct.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setProducts(products.filter(p => p.id !== deleteProduct.id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteProduct(undefined);
    }
  }

  return (
    <div className="pb-8 px-2">
      <section className="w-full ml-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold text-[#222] leading-tight tracking-tight">Product Management</div>
            <div className="text-base text-gray-700 mt-1 font-medium">Add, edit, or remove tire products from your inventory.</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              type="button"
              onClick={() => { setEditProduct(undefined); setShowProductModal(true); }}
              className="bg-[#0a1c58] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132b7c] transition text-base flex items-center gap-2 shadow-sm"
            >
              + Add Product
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 w-full">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] focus:outline-none text-base font-normal text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
          {/* Filter Button (Availability) */}
          <div className="relative">
            <button
              type="button"
              className="filter-button flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-[#0a1c58] font-semibold hover:bg-gray-100 transition shadow-sm text-base"
              onClick={() => setShowFilterMenu((v) => !v)}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" /></svg>
              Filter
              <svg className="ml-1" width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" /></svg>
              {(availabilityFilter || minPrice || maxPrice || tireSizeFilter || selectedYear !== "All Years") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
            {showFilterMenu && (
              <div className="filter-popover absolute z-10 mt-2 w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg py-3">
                <div className="px-4 pb-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-gray-700 hover:text-gray-900"
                    >
                      Reset All
                    </button>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <div className="space-y-1">
                    {["In Stock", "Low Stock", "Out of Stock", "Contact Us"].map((option) => (
                      <button
                        key={option}
                        className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${availabilityFilter === option ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-900"
                          }`}
                        onClick={() => setAvailabilityFilter(option === availabilityFilter ? "" : option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0a1c58] focus:border-[#0a1c58] placeholder:text-gray-500 text-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0a1c58] focus:border-[#0a1c58] placeholder:text-gray-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Tire Size Filter */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tire Size</label>
                  <input
                    type="text"
                    placeholder="Search tire size..."
                    value={tireSizeFilter}
                    onChange={(e) => setTireSizeFilter(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0a1c58] focus:border-[#0a1c58] placeholder:text-gray-500 text-gray-900"
                  />
                </div>

                {/* Year Filter */}
                <div className="px-4 py-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year} className="text-gray-900">{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          {/* Brand Dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 px-4 pr-10 py-2 rounded-lg text-[#0a1c58] font-semibold focus:outline-none shadow-sm text-base"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brandOptions.filter((b): b is string => !!b).map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#0a1c58" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>
        {showProductModal ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-extrabold text-[#222] mb-6">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <ProductForm product={editProduct} onSubmit={handleAddOrEditProduct} onCancel={() => { setShowProductModal(false); setEditProduct(undefined); }} />
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-[1000px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="shadow-md rounded-lg bg-white">
                <ProductTable
                  products={filteredProducts}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </div>
            )}
          </div>
        )}
        {deleteProduct && (
          <DeleteModal
            itemName={deleteProduct.pattern}
            onCancel={() => setDeleteProduct(undefined)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </section>
    </div>
  );
} 