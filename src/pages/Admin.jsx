import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  FileText,
  Settings,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import toast from "react-hot-toast";
import ProductForm from "../components/ProductForm";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    image: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);

      // Load news
      const newsQuery = query(
        collection(db, "news"),
        orderBy("createdAt", "desc")
      );
      const newsSnapshot = await getDocs(newsQuery);
      const newsData = newsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(newsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (productData) => {
    try {
      const dataToSave = {
        ...productData,
        price: parseFloat(productData.price),
        createdAt: editingProduct ? editingProduct.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), dataToSave);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "products"), dataToSave);
        toast.success("Produto adicionado com sucesso!");
      }

      setShowProductForm(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();

    if (!newsForm.title || !newsForm.content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const newsData = {
        ...newsForm,
        createdAt: editingNews ? editingNews.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingNews) {
        await updateDoc(doc(db, "news", editingNews.id), newsData);
        toast.success("Notícia atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "news"), newsData);
        toast.success("Notícia adicionada com sucesso!");
      }

      setShowNewsForm(false);
      setEditingNews(null);
      setNewsForm({
        title: "",
        content: "",
        image: "",
      });
      loadData();
    } catch (error) {
      console.error("Erro ao salvar notícia:", error);
      toast.error("Erro ao salvar notícia");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        toast.success("Produto excluído com sucesso!");
        loadData();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm("Tem certeza que deseja excluir esta notícia?")) {
      try {
        await deleteDoc(doc(db, "news", newsId));
        toast.success("Notícia excluída com sucesso!");
        loadData();
      } catch (error) {
        console.error("Erro ao excluir notícia:", error);
        toast.error("Erro ao excluir notícia");
      }
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const editNews = (news) => {
    setEditingNews(news);
    setNewsForm({
      title: news.title,
      content: news.content,
      image: news.image || "",
    });
    setShowNewsForm(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie produtos, notícias e configurações da loja
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Produtos
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "news"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Notícias
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Settings className="w-5 h-5 inline mr-2" />
                Configurações
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Gerenciar Produtos
                </h2>
                <p className="text-gray-600">
                  {products.length} produto(s) cadastrado(s)
                </p>
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Produto</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "Todas as categorias" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status === "active"
                          ? "Ativo"
                          : product.status === "inactive"
                          ? "Inativo"
                          : "Sem Estoque"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-black">
                        R$ {product.price?.toFixed(2) || "0,00"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2 mb-4">
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500">
                            Tamanhos:
                          </span>
                          {product.sizes.slice(0, 3).map((size) => (
                            <span
                              key={size}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{product.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {product.colors && product.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500">Cores:</span>
                          {product.colors.slice(0, 3).map((color) => (
                            <span
                              key={color}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {color}
                            </span>
                          ))}
                          {product.colors.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{product.colors.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Tente ajustar os filtros"
                    : "Comece adicionando seu primeiro produto"}
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="btn-primary"
                  >
                    Adicionar Primeiro Produto
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div>
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Gerenciar Notícias
                </h2>
                <p className="text-gray-600">
                  {news.length} notícia(s) publicada(s)
                </p>
              </div>
              <button
                onClick={() => setShowNewsForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Notícia</span>
              </button>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* News Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-400">
                        <FileText className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* News Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                      {item.createdAt?.toDate?.().toLocaleDateString("pt-BR") ||
                        "Data não disponível"}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editNews(item)}
                        className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {news.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notícia publicada
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece adicionando sua primeira notícia
                </p>
                <button
                  onClick={() => setShowNewsForm(true)}
                  className="btn-primary"
                >
                  Adicionar Primeira Notícia
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configurações
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informações da Loja
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      defaultValue="Cardoso Confecções"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      defaultValue="+55 79 99906-2401"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estatísticas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {products.length}
                    </div>
                    <div className="text-sm text-gray-600">Produtos</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {news.length}
                    </div>
                    <div className="text-sm text-gray-600">Notícias</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Pedidos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleProductSubmit}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            loading={false}
          />
        )}

        {/* News Form Modal */}
        {showNewsForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNews ? "Editar Notícia" : "Adicionar Nova Notícia"}
                </h2>
              </div>

              <form onSubmit={handleNewsSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, title: e.target.value })
                    }
                    className="input-field"
                    placeholder="Título da notícia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    required
                    value={newsForm.content}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, content: e.target.value })
                    }
                    rows="6"
                    className="input-field"
                    placeholder="Conteúdo da notícia..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={newsForm.image}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, image: e.target.value })
                    }
                    className="input-field"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewsForm(false);
                      setEditingNews(null);
                      setNewsForm({ title: "", content: "", image: "" });
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingNews ? "Atualizar" : "Adicionar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
