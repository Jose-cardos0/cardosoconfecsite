import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Package,
  DollarSign,
  RefreshCw,
  FileText,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

const MeusPedidos = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "in_production":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "in_production":
        return "Em Produção";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregue";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Data não disponível";

    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRepeatOrder = (order) => {
    // Implementar lógica para repetir pedido
    toast.success(
      "Funcionalidade de repetir pedido será implementada em breve!"
    );
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Pedidos
          </h1>
          <p className="text-gray-600">
            Acompanhe todos os seus orçamentos e pedidos
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum pedido encontrado
            </h2>
            <p className="text-gray-600 mb-8">
              Você ainda não fez nenhum pedido. Comece explorando nossos
              produtos!
            </p>
            <Link to="/produtos" className="btn-primary">
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>R$ {order.total?.toFixed(2) || "0,00"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="text-gray-600 hover:text-black transition-colors"
                        title="Repetir pedido"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Itens do Pedido
                  </h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={
                                item.image ||
                                "https://via.placeholder.com/48x48?text=Produto"
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Tamanho: {item.size} | Qtd: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            R$ {item.price.toFixed(2)} cada
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm text-gray-600">
                        <strong>Total:</strong> R${" "}
                        {order.total?.toFixed(2) || "0,00"}
                      </p>
                      {order.customer && (
                        <p className="text-sm text-gray-600">
                          <strong>Cliente:</strong> {order.customer.name}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/5579999062401?text=Olá! Gostaria de informações sobre o pedido ${order.id
                              .slice(-8)
                              .toUpperCase()}`,
                            "_blank"
                          )
                        }
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Consultar Status</span>
                      </button>
                      <button
                        onClick={() => {
                          // Implementar download do PDF do pedido
                          toast.success(
                            "Download do PDF será implementado em breve!"
                          );
                        }}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Baixar PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/produtos"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Package className="w-6 h-6 text-black" />
              <div>
                <p className="font-medium text-gray-900">Ver Produtos</p>
                <p className="text-sm text-gray-500">Explorar catálogo</p>
              </div>
            </Link>

            <button
              onClick={() =>
                window.open("https://wa.me/5579999062401", "_blank")
              }
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
            >
              <Package className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Suporte</p>
                <p className="text-sm text-gray-500">Falar no WhatsApp</p>
              </div>
            </button>

            <Link
              to="/contato"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Package className="w-6 h-6 text-black" />
              <div>
                <p className="font-medium text-gray-900">Contato</p>
                <p className="text-sm text-gray-500">Enviar mensagem</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeusPedidos;
