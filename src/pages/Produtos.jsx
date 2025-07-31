import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Grid, List } from "lucide-react";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import toast from "react-hot-toast";

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-center">
          <img
            src="https://i.ibb.co/fGrgD53C/logo-Confec2.webp"
            alt="Logo"
            className="w-52"
          />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos Produtos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre o uniforme ideal para sua empresa. Qualidade e conforto em
            todos os nossos produtos.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3  top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="w-9 h-5 text-gray-500 " />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field max-w-xs"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas as categorias" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex hidden lg:block items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} produto
            {filteredProducts.length !== 1 ? "s" : ""} encontrado
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou termos de busca
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="btn-primary"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <img
                src="https://i.ibb.co/N2JDtvsC/Senhorinha.png"
                alt="Senhorinha - Atendimento"
                className="w-32 h-32 object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Não encontrou o que procura?
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                Fale com a gente! Nossa equipe está pronta para ajudar você a
                encontrar o uniforme ideal.
              </p>
              <a
                href="https://wa.me/5579999062401"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, viewMode }) => {
  // Função para obter a primeira imagem do produto
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/300x300?text=Produto";
  };

  const IMAGE_HEIGHT = "h-64"; // 256px
  const CARD_MIN_HEIGHT = "min-h-[256px]";

  if (viewMode === "list") {
    return (
      <Link to={`/produto/${product.id}`} className="block">
        <div
          className={`card hover:shadow-lg transition-shadow duration-300 flex ${CARD_MIN_HEIGHT}`}
        >
          <div
            className={`w-32 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-l-lg ${IMAGE_HEIGHT}`}
          >
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-full h-full object-cover object-center rounded-l-lg"
            />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              {product.category && (
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mb-3">
                  {product.category}
                </span>
              )}
            </div>
            <div className="text-right mt-4">
              <div className="text-2xl font-bold text-black mb-2">
                R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
              </div>
              <span className="text-sm text-gray-500">Ver detalhes →</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/produto/${product.id}`} className="block group">
      <div
        className={`card overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col ${CARD_MIN_HEIGHT}`}
      >
        <div
          className={`w-full flex items-center justify-center bg-gray-100 ${IMAGE_HEIGHT}`}
        >
          <img
            src={getProductImage()}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            {product.category && (
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mb-3">
                {product.category}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-xl font-bold text-black">
              R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
            </span>
            <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
              Ver detalhes →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Produtos;
