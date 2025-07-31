import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronRight, ChevronLeft, Play, Star } from "lucide-react";
import { db } from "../firebase/config";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
    loadNews();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeaturedProducts(products);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const loadNews = async () => {
    try {
      const q = query(
        collection(db, "news"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const newsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(newsData);
    } catch (error) {
      console.error("Erro ao carregar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter a primeira imagem do produto
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback para produtos antigos que ainda usam 'image' singular
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/300x300?text=Produto";
  };

  const bannerSlides = [
    {
      id: 1,
      image:
        "https://i.ibb.co/dStJ071/Chat-GPT-Image-31-de-jul-de-2025-11-43-36.png",
      title: "Fardamentos Industriais de Qualidade",
      subtitle: "Conforto e segurança para sua equipe",
      cta: "Ver Produtos",
    },
    {
      id: 2,
      image:
        "https://i.ibb.co/ymTdjxVZ/Whats-App-Image-2025-02-19-at-12-37-25-4-3.jpg",
      title: "Promoção Especial",
      subtitle: "Descontos de até 30% em uniformes corporativos",
      cta: "Aproveitar",
    },
    {
      id: 3,
      image:
        "https://i.ibb.co/jv5k9z8X/Chat-GPT-Image-31-de-jul-de-2025-12-00-42.webp",
      title: "Personalização Completa",
      subtitle: "Bordado e estamparia personalizada",
      cta: "Solicitar Orçamento",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Banner Swiper */}
      <section className="relative h-screen">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="h-full"
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {slide.subtitle}
                    </p>
                    <Link
                      to="/produtos"
                      className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300">
            <ChevronLeft className="w-6 h-6 text-black" />
          </div>
          <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-opacity-80 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300">
            <ChevronRight className="w-6 h-6 text-black" />
          </div>
        </Swiper>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Cardoso Confecções?
            </h2>

            <div className="flex justify-center items-center py-4">
              <img
                src="https://i.ibb.co/fGrgD53C/logo-Confec2.webp"
                alt="Logo"
                className="w-72  flex items-center justify-center"
              />
            </div>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Qualidade, conforto e durabilidade em todos os nossos produtos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualidade Premium</h3>
              <p className="text-gray-600">
                Materiais de primeira linha para máxima durabilidade e conforto
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">
                Produção ágil e entrega pontual para atender suas necessidades
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalização</h3>
              <p className="text-gray-600">
                Bordado e estamparia personalizada para sua marca
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-xl text-gray-600">
              Conheça nossos produtos mais vendidos
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: ".products-next",
                prevEl: ".products-prev",
              }}
              pagination={{ clickable: true }}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="products-swiper"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to={`/produto/${product.id}`} className="block group">
                    <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-black">
                            R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Ver detalhes →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Products Navigation */}
          <div className="flex justify-center mt-8 space-x-4">
            <button className="products-prev bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="products-next bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Algumas das Empresas que confiam em nós
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Grandes empresas escolhem a Cardoso Confecções para seus uniformes
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <img
              src="https://i.ibb.co/5hLQR3GT/logonova.png"
              alt="Natville"
              className="h-8 md:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/9kWWhJSK/santuario.png"
              alt="Santuario da divina misericordia"
              className=" h-8 md:h-8 opacity-50
               hover:opacity-100 transition-opacity 
               duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/sJ6fJ623/Grupo-de-5-objetosourolac.png"
              alt="Santuario da divina misericordia"
              className=" h-8 md:h-8 opacity-50
               hover:opacity-100 transition-opacity 
               duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/rRFH1b20/oliveira-288x.png"
              alt="Santuario da divina misericordia"
              className=" h-8 md:h-8 opacity-50
               hover:opacity-100 transition-opacity 
               duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/FLbDTC7j/Grupo-de-18-objetosnalmilk.png"
              alt="nilmilk laticinios"
              className=" h-8 md:h-8 opacity-50
                hover:opacity-100 transition-opacity 
                duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/n84w9YHQ/images.jpg"
              alt="nilmilk laticinios"
              className=" h-12 md:h-12 opacity-50
                hover:opacity-100 transition-opacity 
                duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/84b1vH6z/Objeto-1dvideira.png"
              alt="dvieira laticinios"
              className=" h-8 md:h-8 opacity-50
                hover:opacity-100 transition-opacity 
                duration-300 cursor-pointer"
            />
            <img
              src="https://i.ibb.co/zTbQDyqB/Grupo-de-15-objetos.png"
              alt="2 irmaos"
              className=" h-8 md:h-8 opacity-50
                hover:opacity-100 transition-opacity 
                duration-300 cursor-pointer"
            />
          </div>
        </div>
        <Link to="/produtos">
          <div className="flex justify-center items-center pt-4">
            <p className="text-gray-600 text-sm">ver mais..</p>
          </div>
        </Link>
      </section>

      {/* News Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Últimas Notícias
            </h2>
            <p className="text-xl text-gray-600">
              Fique por dentro das novidades da Cardoso Confecções
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: ".news-next",
              prevEl: ".news-prev",
            }}
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="news-swiper"
          >
            {news.length > 0 ? (
              news.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="card overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/400x225?text=Notícia"
                        }
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-gray-500 mb-2">
                        {item.createdAt
                          ?.toDate?.()
                          .toLocaleDateString("pt-BR") || "Data não disponível"}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {item.content}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" line-clamp-3 bg-black text-white px-4 py-2 rounded-lg w-fit"
                      >
                        Ler mais →
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="card p-8 text-center">
                  <p className="text-gray-500">
                    Nenhuma notícia disponível no momento.
                  </p>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* News Navigation */}
          <div className="flex justify-center mt-8 space-x-4">
            <button className="news-prev bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="news-next bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para equipar sua equipe?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Solicite um orçamento personalizado e receba condições especiais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/produtos"
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Ver Produtos
            </Link>
            <Link
              to="/contato"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-colors duration-300"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center pt-8">
          <img
            src="https://i.ibb.co/fGrgD53C/logo-Confec2.webp"
            alt="Logo"
            className="w-72"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
