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

  const handleQuantityChange = async (
    productId,
    size,
    newQuantity,
    selectedColor = "",
    customizationDetails = []
  ) => {
    if (newQuantity <= 0) {
      await removeFromCart(
        productId,
        size,
        selectedColor,
        customizationDetails
      );
      toast.success("Item removido do carrinho");
    } else {
      await updateQuantity(
        productId,
        size,
        newQuantity,
        selectedColor,
        customizationDetails
      );
    }
  };

  const handleQuantityInput = async (
    productId,
    size,
    e,
    selectedColor = "",
    customizationDetails = []
  ) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 1) {
      await updateQuantity(
        productId,
        size,
        value,
        selectedColor,
        customizationDetails
      );
    } else if (value === 0) {
      await updateQuantity(
        productId,
        size,
        1,
        selectedColor,
        customizationDetails
      );
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

      // Criar o PDF
      const pdf = new jsPDF("p", "mm", "a4");

      // A4 dimensions: 210mm x 297mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 7.5;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Função para adicionar uma página ao PDF
      const addPageToPDF = async (htmlContent, pageNumber = 1) => {
        const pdfContent = document.createElement("div");
        pdfContent.style.padding = `${margin}mm`;
        pdfContent.style.fontFamily = "Arial, sans-serif";
        pdfContent.style.width = `${contentWidth}mm`;
        pdfContent.style.backgroundColor = "white";
        pdfContent.style.color = "black";
        pdfContent.style.fontSize = "12px";
        pdfContent.style.lineHeight = "1.4";
        pdfContent.style.position = "absolute";
        pdfContent.style.left = "-9999px";
        pdfContent.style.top = "0";

        pdfContent.innerHTML = htmlContent;
        document.body.appendChild(pdfContent);

        const canvas = await html2canvas(pdfContent, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: contentWidth * 3.779527559, // Converter mm para pixels (96 DPI)
          height: contentHeight * 3.779527559,
          scrollX: 0,
          scrollY: 0,
          windowWidth: contentWidth * 3.779527559,
          windowHeight: contentHeight * 3.779527559,
          imageTimeout: 0,
          removeContainer: true,
          foreignObjectRendering: false,
        });

        document.body.removeChild(pdfContent);

        const imgData = canvas.toDataURL("image/png");

        if (pageNumber > 1) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          contentWidth,
          contentHeight
        );
      };

      // Página 1: Cabeçalho e informações do cliente
      const headerContent = `
        <div style="text-align: center; margin-bottom: 15mm;">
          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 5mm;">
            <img src="/src/assets/logoOrcamento.png" alt="Cardoso Confecções" style="width: 50mm; height: auto; display: block;" />
          </div>
          <p style="margin: 2mm 0; color: #666; font-size: 10px;">Fardamentos Industriais de Qualidade</p>
          <p style="margin: 1mm 0; color: #666; font-size: 9px;">CNPJ: 34.346.582/0001-84</p>
          <p style="margin: 1mm 0; color: #666; font-size: 9px;">WhatsApp: (79) 9 9906-2401</p>
          <p style="margin: 1mm 0; color: #666; font-size: 9px;">Site: confeccoescardoso.online</p>
        </div>

        <div style="border-bottom: 1px solid #000; margin-bottom: 12mm;"></div>

        <div style="margin-bottom: 12mm;">
          <h2 style="margin-bottom: 4mm; font-size: 14px; font-weight: bold;">ORÇAMENTO</h2>
          <div style="background-color: #f8f9fa; padding: 4mm; border-radius: 2mm; font-size: 10px;">
            <p style="margin: 1mm 0;"><strong>Data:</strong> ${new Date().toLocaleDateString(
              "pt-BR"
            )}</p>
            ${
              orderId
                ? `<p style="margin: 1mm 0;"><strong>Número do Orçamento:</strong> ${orderId}</p>`
                : ""
            }
            <p style="margin: 1mm 0;"><strong>Cliente:</strong> ${
              customerData.name || currentUser?.displayName || "Cliente"
            }</p>
            <p style="margin: 1mm 0;"><strong>Email:</strong> ${
              customerData.email || currentUser?.email || ""
            }</p>
            <p style="margin: 1mm 0;"><strong>Telefone:</strong> ${
              customerData.phone || ""
            }</p>
            ${
              customerData.company
                ? `<p style="margin: 1mm 0;"><strong>Empresa:</strong> ${customerData.company}</p>`
                : ""
            }
            ${
              customerData.address
                ? `<p style="margin: 1mm 0;"><strong>Endereço:</strong> ${customerData.address}</p>`
                : ""
            }
          </div>
        </div>

        <div style="margin-bottom: 12mm;">
          <h3 style="margin-bottom: 4mm; font-size: 12px; font-weight: bold;">ITENS SELECIONADOS</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: left; font-weight: bold;">Produto</th>
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Tamanho</th>
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Cor</th>
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Qtd</th>
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">Preço Unit.</th>
                <th style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
      `;

      await addPageToPDF(headerContent, 1);

      // Dividir itens em grupos para múltiplas páginas
      const itemsPerPage = 15; // Aproximadamente quantos itens cabem por página
      const totalPages = Math.ceil(cart.length / itemsPerPage);

      console.log(
        `PDF Debug: ${cart.length} itens, ${itemsPerPage} por página, ${totalPages} páginas necessárias`
      );

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const startIndex = pageIndex * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, cart.length);
        const pageItems = cart.slice(startIndex, endIndex);

        let pageContent = "";

        if (pageIndex === 0) {
          // Primeira página já tem o cabeçalho, só adicionar os itens
          pageContent = pageItems
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 2mm;">
                <div style="font-weight: bold; margin-bottom: 1mm;">${
                  item.name
                }</div>
                ${
                  item.description
                    ? `<div style="font-size: 8px; color: #666; margin-bottom: 1mm;">${item.description}</div>`
                    : ""
                }
                ${
                  item.customizationDetails &&
                  item.customizationDetails.length > 0
                    ? `<div style="font-size: 8px; color: #666;">Personalizações: ${item.customizationDetails.join(
                        ", "
                      )}</div>`
                    : ""
                }
              </td>
              <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                item.size || "-"
              }</td>
              <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                item.selectedColor || "-"
              }</td>
              <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                item.quantity
              }</td>
              <td style="border: 1px solid #ddd; padding: 2mm; text-align: right;">R$ ${item.price.toFixed(
                2
              )}</td>
              <td style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">R$ ${(
                item.price * item.quantity
              ).toFixed(2)}</td>
            </tr>
          `
            )
            .join("");

          pageContent += `
            </tbody>
          </table>
          </div>`;

          // Substituir o conteúdo da primeira página
          const firstPageContent = headerContent + pageContent;
          await addPageToPDF(firstPageContent, 1);
        } else {
          // Páginas subsequentes
          pageContent = `
            <div style="margin-bottom: 12mm;">
              <h3 style="margin-bottom: 4mm; font-size: 12px; font-weight: bold;">ITENS SELECIONADOS (continuação)</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: left; font-weight: bold;">Produto</th>
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Tamanho</th>
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Cor</th>
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: center; font-weight: bold;">Qtd</th>
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">Preço Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageItems
                    .map(
                      (item) => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 2mm;">
                        <div style="font-weight: bold; margin-bottom: 1mm;">${
                          item.name
                        }</div>
                        ${
                          item.description
                            ? `<div style="font-size: 8px; color: #666; margin-bottom: 1mm;">${item.description}</div>`
                            : ""
                        }
                        ${
                          item.customizationDetails &&
                          item.customizationDetails.length > 0
                            ? `<div style="font-size: 8px; color: #666;">Personalizações: ${item.customizationDetails.join(
                                ", "
                              )}</div>`
                            : ""
                        }
                      </td>
                      <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                        item.size || "-"
                      }</td>
                      <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                        item.selectedColor || "-"
                      }</td>
                      <td style="border: 1px solid #ddd; padding: 2mm; text-align: center;">${
                        item.quantity
                      }</td>
                      <td style="border: 1px solid #ddd; padding: 2mm; text-align: right;">R$ ${item.price.toFixed(
                        2
                      )}</td>
                      <td style="border: 1px solid #ddd; padding: 2mm; text-align: right; font-weight: bold;">R$ ${(
                        item.price * item.quantity
                      ).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`;

          await addPageToPDF(pageContent, pageIndex + 2);
        }
      }

      // Página final: Total, condições e assinatura
      const finalPageContent = `
        <div style="text-align: right; margin-bottom: 12mm;">
          <div style="font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 3mm;">
            <span>Total: R$ ${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 4mm; border-radius: 2mm; margin-bottom: 12mm; font-size: 9px;">
          <h3 style="margin-bottom: 3mm; font-size: 10px; font-weight: bold;">CONDIÇÕES COMERCIAIS</h3>
          <ul style="margin: 0; padding-left: 5mm; line-height: 1.3;">
            <li>Prazo de entrega: 30 dias úteis</li>
            <li>Forma de pagamento: Negociável</li>
            <li>Validade do orçamento: 30 dias</li>
            <li>Dúvidas: (79) 9 9906-2401 - José Cardoso</li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 8mm; font-size: 9px;">
          <p style="color: #666; margin: 1mm 0;">Para confirmar este orçamento, entre em contato conosco:</p>
          <p style="color: #666; margin: 1mm 0;"><strong>WhatsApp: (79) 9 9906-2401</strong></p>
          <p style="color: #666; margin: 1mm 0;">Email: contato@cardosoconfeccoes.com</p>
        </div>

        <div style="text-align: center; margin-top: 15mm;">
          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 3mm;">
            <img src="/src/assets/assinatura.png" alt="Assinatura" style="width: 35mm; height: auto; display: block;" />
          </div>
          <p style="margin: 0; font-weight: bold; font-size: 10px;">Cardoso Confecções</p>
          <p style="margin: 0; color: #666; font-size: 8px;">Responsável Técnico</p>
        </div>
      `;

      await addPageToPDF(finalPageContent, totalPages + 2);

      // Save PDF
      const fileName = `orcamento_${
        orderId || new Date().toISOString().split("T")[0]
      }.pdf`;

      // Abrir PDF em nova aba
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      // Salvar PDF se necessário
      pdf.save(fileName);

      const totalPagesGenerated = totalPages + 2; // +2 para cabeçalho e página final
      toast.success(
        `Orçamento gerado com sucesso! (${totalPagesGenerated} página${
          totalPagesGenerated > 1 ? "s" : ""
        })`
      );
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
                {cart.map((item, index) => {
                  // Criar chave única baseada em todas as características
                  const selectedColor = item.selectedColor || "";
                  const customizationDetails = item.customizationDetails || [];
                  const customizationKey = customizationDetails
                    .sort()
                    .join(",");
                  const uniqueKey = `${item.id}-${item.size}-${selectedColor}-${customizationKey}`;

                  return (
                    <div key={uniqueKey} className="p-6">
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
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Tamanho: {item.size}</p>
                            {item.selectedColor && (
                              <p>Cor: {item.selectedColor}</p>
                            )}
                            {item.customizationDetails &&
                              item.customizationDetails.length > 0 && (
                                <p>
                                  Personalizações:{" "}
                                  {item.customizationDetails.join(", ")}
                                </p>
                              )}
                          </div>
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
                                item.quantity - 1,
                                item.selectedColor,
                                item.customizationDetails
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
                              handleQuantityInput(
                                item.id,
                                item.size,
                                e,
                                item.selectedColor,
                                item.customizationDetails
                              )
                            }
                            className="w-12 text-center font-semibold border border-gray-300 rounded-lg"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.size,
                                item.quantity + 1,
                                item.selectedColor,
                                item.customizationDetails
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
                              handleQuantityChange(
                                item.id,
                                item.size,
                                0,
                                item.selectedColor,
                                item.customizationDetails
                              )
                            }
                            className="text-red-500 hover:text-red-700 transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
