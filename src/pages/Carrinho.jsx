import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  FileText,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Carrinho = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    generateOrder,
    clearCart,
  } = useCart();
  const { currentUser } = useAuth();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Função para obter a primeira imagem do produto
  const getProductImage = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    // Fallback para produtos antigos que ainda usam 'image' singular
    if (item.image) {
      return item.image;
    }
    return "https://via.placeholder.com/80x80?text=Produto";
  };

  const handleQuantityChange = async (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId, size);
      toast.success("Item removido do carrinho");
    } else {
      await updateQuantity(productId, size, newQuantity);
    }
  };

  const handleQuantityInput = async (productId, size, e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 1) {
      await updateQuantity(productId, size, value);
    } else if (value === 0) {
      await updateQuantity(productId, size, 1);
    }
  };

  const handleGenerateQuote = async () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    if (!currentUser) {
      setShowCustomerForm(true);
      return;
    }

    await generateQuotePDF();
  };

  const handleCustomerFormSubmit = async (e) => {
    e.preventDefault();

    if (!customerData.name || !customerData.email || !customerData.phone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    await generateQuotePDF();
  };

  const generateQuotePDF = async () => {
    setGeneratingPDF(true);

    try {
      // Generate order in Firebase if user is logged in
      let orderId = null;
      if (currentUser) {
        orderId = await generateOrder(customerData);
      }

      // Create PDF content
      const pdfContent = document.createElement("div");
      pdfContent.style.padding = "40px";
      pdfContent.style.fontFamily = "Arial, sans-serif";
      pdfContent.style.maxWidth = "800px";
      pdfContent.style.margin = "0 auto";
      pdfContent.style.backgroundColor = "white";
      pdfContent.style.color = "black";

      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background-color: black; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <span style="color: white; font-size: 32px; font-weight: bold;">C</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Cardoso Confecções</h1>
          <p style="margin: 5px 0; color: #666;">Fardamentos Industriais de Qualidade</p>
          <p style="margin: 5px 0; color: #666;">WhatsApp: (79) 99906-2401</p>
        </div>

        <div style="border-bottom: 2px solid #000; margin-bottom: 30px;"></div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px; font-size: 20px;">ORÇAMENTO</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Data:</strong> ${new Date().toLocaleDateString(
              "pt-BR"
            )}</p>
            ${
              orderId
                ? `<p><strong>Número do Pedido:</strong> ${orderId}</p>`
                : ""
            }
            <p><strong>Cliente:</strong> ${
              customerData.name || currentUser?.displayName || "Cliente"
            }</p>
            <p><strong>Email:</strong> ${
              customerData.email || currentUser?.email || ""
            }</p>
            <p><strong>Telefone:</strong> ${customerData.phone || ""}</p>
            ${
              customerData.company
                ? `<p><strong>Empresa:</strong> ${customerData.company}</p>`
                : ""
            }
            ${
              customerData.address
                ? `<p><strong>Endereço:</strong> ${customerData.address}</p>`
                : ""
            }
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="margin-bottom: 15px; font-size: 18px;">ITENS SELECIONADOS</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Produto</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Tamanho</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Qtd</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Preço Unit.</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart
                .map(
                  (item) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 12px;">${
                    item.name
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${
                    item.size
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
            <span>Total: R$ ${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin-bottom: 15px; font-size: 18px;">CONDIÇÕES COMERCIAIS</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Prazo de entrega: 15 dias úteis</li>
            <li>Forma de pagamento: 50% na aprovação, 50% na entrega</li>
            <li>Garantia: 6 meses</li>
            <li>Validade do orçamento: 30 dias</li>
          </ul>
        </div>

        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Para confirmar este orçamento, entre em contato conosco:</p>
          <p><strong>WhatsApp: (79) 99906-2401</strong></p>
          <p>Email: contato@cardosoconfeccoes.com</p>
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

      // Save PDF
      const fileName = `orcamento_cardoso_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      // Open WhatsApp with message
      const message = `Olá! Gostaria de confirmar o orçamento de R$ ${getTotalPrice().toFixed(
        2
      )} para ${
        customerData.name || currentUser?.displayName || "meus produtos"
      }.`;
      const whatsappUrl = `https://wa.me/5579999062401?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      toast.success("Orçamento gerado com sucesso!");
      setShowCustomerForm(false);

      if (currentUser) {
        // Clear cart after successful order
        await clearCart();
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar orçamento");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Adicione produtos para gerar seu orçamento
            </p>
            <Link to="/produtos" className="btn-primary">
              Ver Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/produtos"
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seu Orçamento ({getTotalItems()} itens)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Produtos Selecionados
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.size}`} className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover object-center rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Tamanho: {item.size}
                        </p>
                        <p className="text-lg font-bold text-black">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityInput(item.id, item.size, e)
                          }
                          className="w-12 text-center font-semibold border border-gray-300 rounded-lg"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-black">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.size, 0)
                          }
                          className="text-red-500 hover:text-red-700 transition-colors mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumo do Orçamento
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete:</span>
                  <span className="text-green-600 font-semibold">Grátis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-black">
                      R$ {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateQuote}
                disabled={generatingPDF}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5" />
                <span>{generatingPDF ? "Gerando..." : "Gerar Orçamento"}</span>
              </button>

              {!currentUser && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Dica:</strong> Faça login para salvar seus
                        pedidos e repetir orçamentos facilmente.
                      </p>
                      <Link
                        to="/login"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Fazer login →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Entrega em 15 dias úteis</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Garantia de 6 meses</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Orçamento válido por 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Informações do Cliente
              </h3>
              <form onSubmit={handleCustomerFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerData.name}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, name: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerData.email}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        email: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerData.phone}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        phone: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={customerData.company}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        company: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: e.target.value,
                      })
                    }
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={generatingPDF}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {generatingPDF ? "Gerando..." : "Gerar Orçamento"}
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

export default Carrinho;
