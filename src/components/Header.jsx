import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { getTotalItems } = useCart();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-32 h-10 rounded-lg flex items-center justify-center">
              <img
                src="https://i.ibb.co/fGrgD53C/logo-Confec2.webp"
                alt="Logo"
                className=""
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive("/") ? "text-black" : "text-gray-600 hover:text-black"
              }`}
            >
              Home
            </Link>
            <Link
              to="/produtos"
              className={`font-medium transition-colors ${
                isActive("/produtos")
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Produtos
            </Link>
            <Link
              to="/contato"
              className={`font-medium transition-colors ${
                isActive("/contato")
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Contato
            </Link>
          </nav>

          {/* Right side - Cart and Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/carrinho" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-black transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Auth */}
            {currentUser ? (
              <div className="hidden md:flex items-center space-x-4">
                {currentUser.isAdmin && (
                  <Link to="/admin" className="btn-primary text-sm">
                    Admin
                  </Link>
                )}
                <Link
                  to="/meus-pedidos"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Meus Pedidos
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-black transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Login
                </Link>
                <Link to="/cadastro" className="btn-primary text-sm">
                  Cadastro
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`font-medium ${
                  isActive("/") ? "text-black" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/produtos"
                className={`font-medium ${
                  isActive("/produtos") ? "text-black" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link
                to="/contato"
                className={`font-medium ${
                  isActive("/contato") ? "text-black" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>

              {currentUser ? (
                <>
                  {currentUser.isAdmin && (
                    <Link
                      to="/admin"
                      className="btn-primary text-sm w-fit"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/meus-pedidos"
                    className="text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/cadastro"
                    className="btn-primary text-sm w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastro
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
