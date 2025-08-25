import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  Download,
  MessageCircle,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const MeusPedidos = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  const loadOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(
        ordersData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      );
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
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
          icon: X,
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

  const handleWhatsAppContact = (order) => {
    const message = `Olá! Gostaria de consultar sobre o andamento do meu pedido:\n\nID do Pedido: ${
      order.orderId
    }\nValor: R$ ${order.total.toFixed(2)}\nData do Pedido: ${formatDate(
      order.createdAt
    )}\n\nPode me informar como está o status?`;
    const whatsappUrl = `https://wa.me/5579999062401?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          status: "cancelled",
          cancelledAt: new Date(),
        });
        toast.success("Pedido cancelado com sucesso");
        loadOrders();
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        toast.error("Erro ao cancelar pedido");
      }
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
          <img src="/assets/logoOrcamento.png" alt="Cardoso Confecções" style="width: 200px; height: auto; margin-bottom: 20px;" />
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
          <img src="/assets/assinatura.png" alt="Assinatura" style="width: 150px; height: auto; margin-bottom: 10px;" />
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
            Meus Pedidos
          </h1>
          <p className="text-gray-600">
            Acompanhe o status dos seus pedidos e orçamentos
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não fez nenhum pedido. Comece explorando nossos
              produtos!
            </p>
            <Link to="/produtos" className="btn-primary">
              Ver Produtos
            </Link>
          </div>
        ) : (
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Pedido: {formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Entrega: {formatDate(order.deliveryDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>Total: R$ {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleWhatsAppContact(order)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Consultar Status
                      </button>
                      <button
                        onClick={() => generateOrderPDF(order)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar Pedido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusPedidos;
