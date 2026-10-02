import React, { useState, useEffect } from 'react';
import {
  createProduct,
  updateProduct,
  getCategories,
  uploadProductImage,
} from '../../firebase/services';
import { Product, Category, ProductVariant } from '../../firebase/types';
import { slugify } from '../../utils/formatters';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Grid,
} from 'lucide-react';

interface AdminProductFormPageProps {
  initialProduct?: Product | null;
  onBack: () => void;
  onSaved: () => void;
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Purple', hex: '#6D28D9' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Maroon', hex: '#831843' },
];

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({
  initialProduct,
  onBack,
  onSaved,
}) => {
  const isEditing = Boolean(initialProduct);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '');
  const [brand, setBrand] = useState(initialProduct?.brand || 'BTS Army');
  const [gender, setGender] = useState(initialProduct?.gender || 'Unisex');
  const [fabric, setFabric] = useState(initialProduct?.fabric || '100% Combed Cotton (180 GSM)');
  const [price, setPrice] = useState<number>(initialProduct?.price || 0);
  const [salePrice, setSalePrice] = useState<number | undefined>(initialProduct?.salePrice);
  const [costPrice, setCostPrice] = useState<number | undefined>(initialProduct?.costPrice);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [newArrival, setNewArrival] = useState(initialProduct?.newArrival || false);
  const [bestSeller, setBestSeller] = useState(initialProduct?.bestSeller || false);
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || '');

  // Images
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sizes & Colors
  const [sizes, setSizes] = useState<string[]>(initialProduct?.sizes || ['M', 'L', 'XL']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    initialProduct?.colors || [{ name: 'Black', hex: '#000000' }, { name: 'Purple', hex: '#6D28D9' }]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  // Variants matrix
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || []
  );

  // Simple stock if no variants
  const [simpleStock, setSimpleStock] = useState<number>(initialProduct?.totalStock || 10);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Auto-generate slug on name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  // Re-generate or sync variants matrix when sizes or colors change
  const generateVariantMatrix = () => {
    if (sizes.length === 0 && colors.length === 0) return;

    const newVariants: ProductVariant[] = [];
    const sizesToUse = sizes.length > 0 ? sizes : ['Standard'];
    const colorsToUse = colors.length > 0 ? colors : [{ name: 'Standard', hex: '#000000' }];

    sizesToUse.forEach((s) => {
      colorsToUse.forEach((c) => {
        const existing = variants.find((v) => v.size === s && v.color === c.name);
        newVariants.push({
          id: existing?.id || `${s}-${c.name}-${Date.now()}`,
          size: s,
          color: c.name,
          colorHex: c.hex,
          sku: existing?.sku || `${sku ? `${sku}-` : ''}${s[0]}${c.name.slice(0, 2).toUpperCase()}`,
          stock: existing?.stock !== undefined ? existing.stock : 10,
        });
      });
    });

    setVariants(newVariants);
  };

  // Total stock calculated from variants or simpleStock
  const totalStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : simpleStock;

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const url = await uploadProductImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      console.warn('Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakeThumbnail = (index: number) => {
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([selected, ...rest]);
  };

  // Size chips
  const handleAddSize = () => {
    const s = newSizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setNewSizeInput('');
    }
  };

  const handleRemoveSize = (s: string) => {
    setSizes(sizes.filter((item) => item !== s));
  };

  // Color chips
  const handleAddColor = () => {
    if (newColorName.trim() && !colors.some((c) => c.name.toLowerCase() === newColorName.toLowerCase())) {
      setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName('');
    }
  };

  const handleRemoveColor = (cName: string) => {
    setColors(colors.filter((item) => item.name !== cName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    if (!price || price <= 0) {
      setErrorMsg('Please specify a valid price.');
      return;
    }

    if (!category) {
      setErrorMsg('Please select or specify a category.');
      return;
    }

    setLoading(true);

    try {
      const finalImages = images.length > 0 ? images : ['/logo.jpg'];
      const sanitizedVariants = variants.map((v) => {
        const variantObj: ProductVariant = {
          id: v.id,
          size: v.size,
          color: v.color,
          stock: Number(v.stock) || 0,
        };
        if (v.sku) variantObj.sku = v.sku;
        if (v.colorHex) variantObj.colorHex = v.colorHex;
        if (typeof v.price === 'number' && !isNaN(v.price) && v.price > 0) {
          variantObj.price = Number(v.price);
        }
        if (typeof v.salePrice === 'number' && !isNaN(v.salePrice) && v.salePrice > 0) {
          variantObj.salePrice = Number(v.salePrice);
        }
        return variantObj;
      });

      const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        sku: sku.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        category,
        subcategory: subcategory.trim(),
        brand: brand.trim(),
        gender,
        fabric: fabric.trim(),
        images: finalImages,
        thumbnail: finalImages[0],
        price: Number(price),
        sizes,
        colors,
        variants: sanitizedVariants,
        totalStock,
        tags: [category, gender, brand].filter(Boolean),
        featured,
        newArrival,
        bestSeller,
        active,
        seoTitle: seoTitle.trim() || `${name} | BTS Army Bangladesh`,
        seoDescription: seoDescription.trim() || `${name} in Bangladesh. Cash on delivery.`,
      };

      if (typeof salePrice === 'number' && !isNaN(salePrice) && salePrice > 0) {
        payload.salePrice = Number(salePrice);
      }
      if (typeof costPrice === 'number' && !isNaN(costPrice) && costPrice > 0) {
        payload.costPrice = Number(costPrice);
      }

      if (isEditing && initialProduct) {
        await updateProduct(initialProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-950">
          {isEditing ? `Editing Product: ${initialProduct?.name}` : 'New Clothing Item'}
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Basic Details Card */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Basic Clothing Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-700 uppercase mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. BTS Army Premium Oversized Graphic Hoodie"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Product Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="bts-army-oversized-graphic-hoodie"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="BTS-HD-001"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Category *</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs cursor-pointer"
                >
                  <option value="">Select or Type Below</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="Hoodies">Hoodies</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Panjabi">Panjabi</option>
                  <option value="Pants">Pants</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Sweatshirts">Sweatshirts</option>
                  <option value="Caps & Accessories">Caps & Accessories</option>
                </select>
                <input
                  type="text"
                  placeholder="Or custom"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-32 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Target Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="Unisex">Unisex</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-700 uppercase mb-1">Fabric & Material Composition</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. 100% Organic Cotton Terry, 320 GSM Fleece"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs"
              />
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Pricing (BDT ৳)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Regular Price (৳) *</label>
              <input
                type="number"
                required
                min="0"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="1500"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Sale / Discount Price (৳)</label>
              <input
                type="number"
                min="0"
                value={salePrice || ''}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1250 (Optional)"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-bold text-purple-900"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Cost Price (Admin Only ৳)</label>
              <input
                type="number"
                min="0"
                value={costPrice || ''}
                onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="750"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Images Upload Card */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Product Images</h3>
            <span className="text-[11px] text-zinc-400">First image is the main thumbnail</span>
          </div>

          {/* Current Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-3/4 rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-100">
                  <img src={img} alt={`prod-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleMakeThumbnail(idx)}
                        className="px-2 py-1 bg-white text-zinc-900 rounded font-bold text-[10px]"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-rose-600 text-white rounded font-bold text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-purple-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload and URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="border-2 border-dashed border-zinc-200 hover:border-purple-600 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-6 h-6 text-purple-900 mb-1" />
              <span className="font-bold text-zinc-800">
                {uploadingImage ? 'Uploading image...' : 'Upload Image from Computer'}
              </span>
              <span className="text-[10px] text-zinc-400">PNG, JPG, WEBP up to 5MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <div className="flex flex-col justify-center space-y-2">
              <label className="font-bold text-zinc-700 uppercase">Or Add Image via Web URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/product-photo.jpg"
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes & Colors Configuration */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-zinc-900">Sizes & Colors</h3>

          {/* Sizes Chips */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-700 uppercase">Available Sizes</label>
            <div className="flex flex-wrap gap-2 items-center">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(s)}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add size (e.g. 3XL)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                  className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg w-32"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-2 py-1 bg-zinc-900 text-white rounded-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Colors Chips */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <label className="block font-bold text-zinc-700 uppercase">Available Colors</label>
            <div className="flex flex-wrap gap-2 items-center">
              {colors.map((c) => (
                <span
                  key={c.name}
                  className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold flex items-center gap-2"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(c.name)}
                    className="text-zinc-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Color name"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg w-28"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-2 py-1 bg-zinc-900 text-white rounded-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Variant Matrix Generator Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={generateVariantMatrix}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>Generate / Refresh Variant Inventory Matrix ({sizes.length} × {colors.length})</span>
            </button>
          </div>
        </div>

        {/* Variant Stock Matrix Table */}
        {variants.length > 0 && (
          <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Variant Stock & Inventory Matrix ({variants.length} combinations)
              </h3>
              <span className="font-extrabold text-purple-950 text-xs">
                Total Stock: {totalStock}
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3">Variant SKU</th>
                    <th className="py-2.5 px-3">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-2 px-3 font-bold text-zinc-900">{v.size}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-zinc-300"
                            style={{ backgroundColor: v.colorHex || '#000000' }}
                          />
                          <span>{v.color}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].sku = e.target.value;
                            setVariants(updated);
                          }}
                          className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs w-32"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].stock = Number(e.target.value);
                            setVariants(updated);
                          }}
                          className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs w-20 font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Description & Details */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Description & Sizing Notes</h3>
          <div>
            <label className="block font-bold text-zinc-700 uppercase mb-1">Full Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed information about the garment, fit, washing instructions, and fabric..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden text-xs"
            />
          </div>
        </div>

        {/* Merchandising & Visibility Flags */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Merchandising Badges & Visibility</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 cursor-pointer bg-zinc-50/50">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-purple-900"
              />
              <span className="font-bold text-zinc-800">Active Online</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 cursor-pointer bg-zinc-50/50">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-purple-900"
              />
              <span className="font-bold text-zinc-800">Featured</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 cursor-pointer bg-zinc-50/50">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="w-4 h-4 accent-purple-900"
              />
              <span className="font-bold text-zinc-800">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 cursor-pointer bg-zinc-50/50">
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={(e) => setBestSeller(e.target.checked)}
                className="w-4 h-4 accent-purple-900"
              />
              <span className="font-bold text-zinc-800">Best Seller</span>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 font-bold text-zinc-700 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-2 py-3.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Saving to Database...' : isEditing ? 'Update Clothing Product' : 'Publish Product to Store'}
          </button>
        </div>

      </form>
    </div>
  );
};
