import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Palette,
  Scissors,
  Package,
  Info,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

const ProdutoDetalhe = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const { addToCart } = useCart();

  const sizes = ["PP", "P", "M", "G", "GG", "XG"];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const productData = { id: docSnap.id, ...docSnap.data() };
        setProduct(productData);
        // Carregar produtos relacionados após carregar o produto principal
        if (productData.category) {
          loadRelatedProducts(productData.category, productData.id);
        }
      } else {
        toast.error("Produto não encontrado");
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      toast.error("Erro ao carregar produto");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category, currentProductId) => {
    setLoadingRelated(true);
    try {
      const q = query(
        collection(db, "products"),
        where("category", "==", category),
        where("status", "==", "active"),
        limit(4)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((product) => product.id !== currentProductId); // Excluir o produto atual

      setRelatedProducts(products);
    } catch (error) {
      console.error("Erro ao carregar produtos relacionados:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    try {
      // Calcular preço total incluindo personalizações
      let totalPrice = product.price || 0;
      let customizationDetails = [];

      Object.entries(selectedCustomizations).forEach(([key, value]) => {
        if (value && product.customization?.[key]) {
          const price = product.customization[`${key}Price`] || 0;
          totalPrice += parseFloat(price);
          customizationDetails.push(key);
        }
      });

      const productWithCustomization = {
        ...product,
        price: totalPrice,
        selectedSize: selectedSize,
        selectedColor: selectedColor || "",
        customizationDetails: customizationDetails,
        // Garantir que todos os campos obrigatórios existam
        id: product.id || "",
        name: product.name || "",
        images: product.images || [],
        image: product.image || "",
      };

      await addToCart(productWithCustomization, selectedSize, quantity);
      toast.success("Produto adicionado ao carrinho!");
      setQuantity(1);
      setSelectedCustomizations({});
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error("Erro ao adicionar ao carrinho");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 1) {
      setQuantity(value);
    } else if (value === 0) {
      setQuantity(1);
    }
  };

  const toggleCustomization = (key) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getTotalPrice = () => {
    if (!product) return 0;

    let total = product.price;
    Object.entries(selectedCustomizations).forEach(([key, value]) => {
      if (value && product.customization?.[key]) {
        const price = product.customization[`${key}Price`] || 0;
        total += parseFloat(price);
      }
    });

    return total * quantity;
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/300x300?text=Produto";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produto não encontrado
          </h2>
          <Link to="/produtos" className="btn-primary">
            Voltar aos Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/produtos"
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image Swiper */}
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              navigation
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper }}
              className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 rounded-lg"
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${product.name} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-24 h-24" />
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Thumbnail Swiper */}
            {product.images && product.images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                className="w-full"
              >
                {product.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-w-1 aspect-h-1 overflow-hidden bg-gray-200 rounded-lg cursor-pointer">
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-black">
                R$ {getTotalPrice().toFixed(2)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Características
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tamanho
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Cor
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {product.customization && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Scissors className="w-5 h-5 mr-2" />
                  Opções de Personalização
                </h3>
                <div className="space-y-3">
                  {product.customization.embroidery && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="embroidery"
                          checked={selectedCustomizations.embroidery || false}
                          onChange={() => toggleCustomization("embroidery")}
                          className="rounded"
                        />
                        <label
                          htmlFor="embroidery"
                          className="text-sm font-medium"
                        >
                          Bordado
                        </label>
                      </div>
                      {product.customization.embroideryPrice && (
                        <span className="text-sm text-gray-600">
                          +R${" "}
                          {parseFloat(
                            product.customization.embroideryPrice
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {product.customization.printing && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="printing"
                          checked={selectedCustomizations.printing || false}
                          onChange={() => toggleCustomization("printing")}
                          className="rounded"
                        />
                        <label
                          htmlFor="printing"
                          className="text-sm font-medium"
                        >
                          Estamparia
                        </label>
                      </div>
                      {product.customization.printingPrice && (
                        <span className="text-sm text-gray-600">
                          +R${" "}
                          {parseFloat(
                            product.customization.printingPrice
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {product.customization.sublimation && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="sublimation"
                          checked={selectedCustomizations.sublimation || false}
                          onChange={() => toggleCustomization("sublimation")}
                          className="rounded"
                        />
                        <label
                          htmlFor="sublimation"
                          className="text-sm font-medium"
                        >
                          Sublimação
                        </label>
                      </div>
                      {product.customization.sublimationPrice && (
                        <span className="text-sm text-gray-600">
                          +R${" "}
                          {parseFloat(
                            product.customization.sublimationPrice
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {product.customization.paint && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="paint"
                          checked={selectedCustomizations.paint || false}
                          onChange={() => toggleCustomization("paint")}
                          className="rounded"
                        />
                        <label htmlFor="paint" className="text-sm font-medium">
                          Pintura com Tinta
                        </label>
                      </div>
                      {product.customization.paintPrice && (
                        <span className="text-sm text-gray-600">
                          +R${" "}
                          {parseFloat(product.customization.paintPrice).toFixed(
                            2
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quantidade
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInput}
                  className="w-16 h-10 border-2 border-gray-300 rounded-lg text-center text-xl font-semibold"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Adicionar ao Orçamento</span>
            </button>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-black mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Entrega Rápida</h4>
                <p className="text-xs text-gray-600">Em até 15 dias úteis</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-black mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Garantia</h4>
                <p className="text-xs text-gray-600">6 meses de garantia</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-black mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Troca Fácil</h4>
                <p className="text-xs text-gray-600">30 dias para troca</p>
              </div>
            </div>
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Descrição
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Descrição não disponível."}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Especificações Técnicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {product.specifications.fabric && (
                    <div>
                      <span className="font-medium text-gray-700">Tecido:</span>
                      <span className="text-gray-600 ml-2">
                        {product.specifications.fabric}
                      </span>
                    </div>
                  )}
                  {product.specifications.composition && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Composição:
                      </span>
                      <span className="text-gray-600 ml-2">
                        {product.specifications.composition}
                      </span>
                    </div>
                  )}
                  {product.specifications.care && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Cuidados:
                      </span>
                      <span className="text-gray-600 ml-2">
                        {product.specifications.care}
                      </span>
                    </div>
                  )}
                  {product.specifications.origin && (
                    <div>
                      <span className="font-medium text-gray-700">Origem:</span>
                      <span className="text-gray-600 ml-2">
                        {product.specifications.origin}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Produtos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingRelated ? (
              <div className="card p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                <p className="text-gray-500">Carregando produtos...</p>
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="card p-4 text-center">
                <p className="text-gray-500">
                  Não encontramos produtos relacionados para este item.
                </p>
              </div>
            ) : (
              relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/produto/${relatedProduct.id}`}
                  className="block group"
                >
                  <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      <img
                        src={getProductImage(relatedProduct)}
                        alt={relatedProduct.name}
                        className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-black">
                          R$ {relatedProduct.price?.toFixed(2) || "0,00"}
                        </span>
                        <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhe;
