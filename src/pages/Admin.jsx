import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Calendar,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import toast from "react-hot-toast";
import ProductForm from "../components/ProductForm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Admin = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadNews(),
        loadOrders(),
        loadLeads(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const loadNews = async () => {
    try {
      const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const newsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(newsData);
    } catch (error) {
      console.error("Erro ao carregar notícias:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  const loadLeads = async () => {
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const leadsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeads(leadsData);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    }
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...productData,
          updatedAt: new Date(),
        });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
        toast.success("Produto adicionado com sucesso!");
      }
      setShowProductForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleNewsSubmit = async (newsData) => {
    try {
      if (editingNews) {
        await updateDoc(doc(db, "news", editingNews.id), {
          ...newsData,
          updatedAt: new Date(),
        });
        toast.success("Notícia atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "news"), {
          ...newsData,
          createdAt: new Date(),
        });
        toast.success("Notícia adicionada com sucesso!");
      }
      setShowNewsForm(false);
      setEditingNews(null);
      loadNews();
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
        loadProducts();
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
        loadNews();
      } catch (error) {
        console.error("Erro ao excluir notícia:", error);
        toast.error("Erro ao excluir notícia");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success("Status do pedido atualizado com sucesso!");
      loadOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Data não disponível";
    return date.toDate
      ? date.toDate().toLocaleDateString("pt-BR")
      : new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusInfo = (order) => {
    const now = new Date();
    const deliveryDate = order.deliveryDate?.toDate
      ? order.deliveryDate.toDate()
      : new Date(order.deliveryDate);
    const isOverdue = now > deliveryDate && order.status === "pending";

    switch (order.status) {
      case "pending":
        return {
          text: isOverdue ? "Atrasado" : "Em andamento",
          color: isOverdue ? "text-red-600" : "text-yellow-600",
          bgColor: isOverdue ? "bg-red-100" : "bg-yellow-100",
          icon: isOverdue ? AlertCircle : Clock,
        };
      case "completed":
        return {
          text: "Entregue",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          text: "Cancelado",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: XCircle,
        };
      default:
        return {
          text: "Pendente",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          icon: Clock,
        };
    }
  };

  const generateOrderPDF = async (order) => {
    try {
      const pdfContent = document.createElement("div");
      pdfContent.style.padding = "40px";
      pdfContent.style.fontFamily = "Arial, sans-serif";
      pdfContent.style.maxWidth = "800px";
      pdfContent.style.margin = "0 auto";
      pdfContent.style.backgroundColor = "white";
      pdfContent.style.color = "black";

      const getProductImage = (item) => {
        if (
          item.images &&
          Array.isArray(item.images) &&
          item.images.length > 0
        ) {
          return item.images[0];
        }
        if (item.image) {
          return item.image;
        }
        return "https://via.placeholder.com/60x60?text=Produto";
      };

      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="/src/assets/logoOrcamento.png" alt="Cardoso Confecções" style="width: 200px; height: auto; margin-bottom: 20px;" />
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Cardoso Confecções</h1>
          <p style="margin: 5px 0; color: #666;">Fardamentos Industriais de Qualidade</p>
          <p style="margin: 5px 0; color: #666;">CNPJ: 34.346.582/0001-84</p>
          <p style="margin: 5px 0; color: #666;">WhatsApp: (79) 9 9906-2401</p>
          <p style="margin: 5px 0; color: #666;">Site: confeccoescardoso.online</p>
        </div>

        <div style="border-bottom: 2px solid #000; margin-bottom: 30px;"></div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px; font-size: 20px;">PEDIDO</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Data do Pedido:</strong> ${formatDate(
              order.createdAt
            )}</p>
            <p><strong>Número do Pedido:</strong> ${order.orderId}</p>
            <p><strong>Status:</strong> ${getStatusInfo(order).text}</p>
            <p><strong>Data de Entrega Prevista:</strong> ${formatDate(
              order.deliveryDate
            )}</p>
            <p><strong>Cliente:</strong> ${
              order.customer?.name || order.userName || "Cliente"
            }</p>
            <p><strong>Email:</strong> ${
              order.customer?.email || order.userEmail || ""
            }</p>
            <p><strong>Telefone:</strong> ${order.customer?.phone || ""}</p>
            ${
              order.customer?.company
                ? `<p><strong>Empresa:</strong> ${order.customer.company}</p>`
                : ""
            }
            ${
              order.customer?.address
                ? `<p><strong>Endereço:</strong> ${order.customer.address}</p>`
                : ""
            }
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="margin-bottom: 15px; font-size: 18px;">ITENS DO PEDIDO</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Imagem</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Produto</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Tamanho</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Cor</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Qtd</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Preço Unit.</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                    <img src="${getProductImage(item)}" alt="${
                    item.name
                  }" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
                  </td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${
                    item.name
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${
                    item.size || "-"
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${
                    item.selectedColor || "-"
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${
                    item.quantity
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">R$ ${item.price.toFixed(
                    2
                  )}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">R$ ${(
                    item.price * item.quantity
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div style="text-align: right; margin-bottom: 30px;">
          <div style="font-size: 20px; font-weight: bold;">
            <span>Total: R$ ${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 50px;">
          <img src="/src/assets/assinatura.png" alt="Assinatura" style="width: 150px; height: auto; margin-bottom: 10px;" />
          <p style="margin: 0; font-weight: bold;">Cardoso Confecções</p>
          <p style="margin: 0; color: #666; font-size: 12px;">Responsável Técnico</p>
        </div>
      `;

      document.body.appendChild(pdfContent);

      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      document.body.removeChild(pdfContent);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `pedido_${order.orderId}.pdf`;
      pdf.save(fileName);
      toast.success("PDF do pedido gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF do pedido");
    }
  };

  const handleWhatsAppContact = (order) => {
    const message = `Olá! Gostaria de informar sobre o pedido:\n\nID do Pedido: ${
      order.orderId
    }\nCliente: ${
      order.customer?.name || order.userName
    }\nValor: R$ ${order.total.toFixed(2)}\nStatus: ${
      getStatusInfo(order).text
    }`;
    const whatsappUrl = `https://wa.me/5579999062401?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">Gerencie produtos, notícias e pedidos</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "products"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "news"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Notícias
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "leads"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Leads
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const getProductImage = () => {
                  if (product.images && product.images.length > 0) {
                    return product.images[0];
                  }
                  if (product.image) {
                    return product.image;
                  }
                  return "https://via.placeholder.com/300x300?text=Produto";
                };

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      <img
                        src={getProductImage()}
                        alt={product.name}
                        className="h-48 w-full object-cover object-center"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-black">
                          R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
                        </span>
                        {product.category && (
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {product.category}
                          </span>
                        )}
                      </div>
                      {product.status && (
                        <div className="mt-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Notícias</h2>
              <button
                onClick={() => setShowNewsForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Notícia
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {item.image && (
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-48 w-full object-cover object-center"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingNews(item);
                            setShowNewsForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {item.createdAt?.toDate?.().toLocaleDateString("pt-BR")}
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver mais →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
              <div className="text-sm text-gray-600">
                Total: {orders.length} pedidos
              </div>
            </div>

            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order);
                const StatusIcon = statusInfo.icon;
                const isOverdue =
                  new Date() >
                    (order.deliveryDate?.toDate
                      ? order.deliveryDate.toDate()
                      : new Date(order.deliveryDate)) &&
                  order.status === "pending";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.orderId}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-4 h-4 inline mr-1" />
                            {statusInfo.text}
                          </span>
                          {isOverdue && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Pedido: {formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              Entrega: {formatDate(order.deliveryDate)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span>
                              Cliente:{" "}
                              {order.customer?.name || order.userName || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span>Total: R$ {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="pending">Em andamento</option>
                          <option value="completed">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        <button
                          onClick={() => generateOrderPDF(order)}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </button>
                        <button
                          onClick={() => handleWhatsAppContact(order)}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contatar Cliente
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Leads Capturados
              </h2>
              <div className="text-sm text-gray-600">
                Total: {leads.length} leads
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {lead.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.phone ? (
                              <a
                                href={`https://wa.me/55${lead.phone.replace(
                                  /\D/g,
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800"
                              >
                                {lead.phone}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.company || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.orderId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead.orderItems} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {lead.orderTotal?.toFixed(2) || "0,00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(lead.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.hasAccount
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {lead.hasAccount ? "Com Cadastro" : "Sem Cadastro"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leads.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum lead capturado ainda.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Os leads aparecerão aqui quando os clientes gerarem
                    orçamentos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingProduct ? "Editar Produto" : "Adicionar Produto"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={handleProductSubmit}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* News Form Modal */}
        {showNewsForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingNews ? "Editar Notícia" : "Adicionar Notícia"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowNewsForm(false);
                      setEditingNews(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleNewsSubmit({
                      title: formData.get("title"),
                      content: formData.get("content"),
                      image: formData.get("image"),
                      link: formData.get("link"),
                    });
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingNews?.title}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conteúdo
                      </label>
                      <textarea
                        name="content"
                        defaultValue={editingNews?.content}
                        required
                        rows="4"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="url"
                        name="image"
                        defaultValue={editingNews?.image}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link (opcional)
                      </label>
                      <input
                        type="url"
                        name="link"
                        defaultValue={editingNews?.link}
                        className="input-field"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewsForm(false);
                          setEditingNews(null);
                        }}
                        className="flex-1 btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="flex-1 btn-primary">
                        {editingNews ? "Atualizar" : "Adicionar"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
