import { useState } from "react";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  Palette,
  Scissors,
  FileText,
} from "lucide-react";
import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "",
    material: product?.material || "",
    weight: product?.weight || "",
    dimensions: product?.dimensions || "",
    images: product?.images || [],
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    features: product?.features || [],
    customization: {
      embroidery: product?.customization?.embroidery || false,
      embroideryPrice: product?.customization?.embroideryPrice || "",
      printing: product?.customization?.printing || false,
      printingPrice: product?.customization?.printingPrice || "",
      sublimation: product?.customization?.sublimation || false,
      sublimationPrice: product?.customization?.sublimationPrice || "",
      paint: product?.customization?.paint || false,
      paintPrice: product?.customization?.paintPrice || "",
    },
    specifications: product?.specifications || {
      fabric: "",
      composition: "",
      care: "",
      origin: "",
    },
    status: product?.status || "active",
  });

  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newColor, setNewColor] = useState("");

  const availableSizes = ["PP", "P", "M", "G", "GG", "XG"];
  const availableColors = [
    "Branco",
    "Preto",
    "Azul",
    "Vermelho",
    "Verde",
    "Amarelo",
    "Cinza",
    "Marrom",
    "Rosa",
    "Roxo",
    "Laranja",
    "Bege",
  ];

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadURL);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(
        `${uploadedUrls.length} imagem(ns) carregada(s) com sucesso!`
      );
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converter preço para número
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      customization: {
        ...formData.customization,
        embroideryPrice:
          parseFloat(formData.customization.embroideryPrice) || 0,
        printingPrice: parseFloat(formData.customization.printingPrice) || 0,
        sublimationPrice:
          parseFloat(formData.customization.sublimationPrice) || 0,
        paintPrice: parseFloat(formData.customization.paintPrice) || 0,
      },
    };

    onSubmit(productData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? "Editar Produto" : "Adicionar Novo Produto"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                placeholder="Ex: Uniforme Industrial Básico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input-field"
              >
                <option value="">Selecione uma categoria</option>
                <option value="Uniformes Industriais">
                  Uniformes Industriais
                </option>
                <option value="Uniformes Corporativos">
                  Uniformes Corporativos
                </option>
                <option value="EPI">EPI</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Promocionais">Promocionais</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Detalhada *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              className="input-field"
              placeholder="Descreva o produto, suas características, benefícios..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
                className="input-field"
                placeholder="Ex: 100% Algodão"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (g)
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="input-field"
                placeholder="Ex: 180g"
              />
            </div>
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Produto
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {uploading
                    ? "Carregando..."
                    : "Clique para selecionar imagens"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG até 5MB cada
                </p>
              </label>
            </div>

            {/* Preview das imagens */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tamanhos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanhos Disponíveis
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                    formData.sizes.includes(size)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Cores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cores Disponíveis
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                    formData.colors.includes(color)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Personalização */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Scissors className="w-5 h-5 mr-2" />
              Opções de Personalização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="embroidery"
                  checked={formData.customization.embroidery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customization: {
                        ...formData.customization,
                        embroidery: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="embroidery" className="text-sm font-medium">
                  Bordado
                </label>
                {formData.customization.embroidery && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={formData.customization.embroideryPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customization: {
                          ...formData.customization,
                          embroideryPrice: e.target.value,
                        },
                      })
                    }
                    className="input-field w-24"
                  />
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="printing"
                  checked={formData.customization.printing}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customization: {
                        ...formData.customization,
                        printing: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="printing" className="text-sm font-medium">
                  Estamparia
                </label>
                {formData.customization.printing && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={formData.customization.printingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customization: {
                          ...formData.customization,
                          printingPrice: e.target.value,
                        },
                      })
                    }
                    className="input-field w-24"
                  />
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sublimation"
                  checked={formData.customization.sublimation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customization: {
                        ...formData.customization,
                        sublimation: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="sublimation" className="text-sm font-medium">
                  Sublimação
                </label>
                {formData.customization.sublimation && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={formData.customization.sublimationPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customization: {
                          ...formData.customization,
                          sublimationPrice: e.target.value,
                        },
                      })
                    }
                    className="input-field w-24"
                  />
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="paint"
                  checked={formData.customization.paint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customization: {
                        ...formData.customization,
                        paint: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="paint" className="text-sm font-medium">
                  Pintura com Tinta
                </label>
                {formData.customization.paint && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={formData.customization.paintPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customization: {
                          ...formData.customization,
                          paintPrice: e.target.value,
                        },
                      })
                    }
                    className="input-field w-24"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Especificações Técnicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Tecido
                </label>
                <input
                  type="text"
                  value={formData.specifications.fabric}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        fabric: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                  placeholder="Ex: Malha 100% Algodão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Composição
                </label>
                <input
                  type="text"
                  value={formData.specifications.composition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        composition: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                  placeholder="Ex: 100% Algodão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções de Cuidado
                </label>
                <input
                  type="text"
                  value={formData.specifications.care}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        care: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                  placeholder="Ex: Lavar a 30°C"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origem
                </label>
                <input
                  type="text"
                  value={formData.specifications.origin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        origin: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                  placeholder="Ex: Brasil"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Características Especiais
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="input-field flex-1"
                placeholder="Ex: Resistente ao fogo"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
              />
              <button
                type="button"
                onClick={addFeature}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Produto
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="input-field"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="out_of_stock">Sem Estoque</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Salvando..." : product ? "Atualizar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
