import React, { useState, useRef, useEffect } from "react";
// Importando de diferentes pacotes dentro do react-icons
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import './styles.css';

type ShareMenuProps = {
  url: string;
  text?: string;
  image?: string;
};

const ShareMenu: React.FC<ShareMenuProps> = ({ url, text, image, }) => {

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const encodedUrl = encodeURIComponent(url);
  // Se 'text' existir, codifica. Se não, usa string vazia para não sujar o link.
  const encodedText = text ? encodeURIComponent(text) : "";

  const shareLinks = {
    // Formata o link do WhatsApp condicionalmente (com ou sem texto)
    whatsapp: text
      ? `https://wa.me/?text=${encodedText}%20${encodedUrl}`
      : `https://wa.me/?text=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    // Formata o link do Twitter condicionalmente
    twitter: text
      ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
      : `https://twitter.com/intent/tweet?url=${encodedUrl}`,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleNativeShare = async () => {
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: text || "Confira este link", // Fallback seguro
          text: text || "",
          url,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-wrapper" ref={menuRef}>
      <button className="cmmt-action-btn share-trigger-btn" onClick={() => setOpen(!open)} > <FiShare2 size={18} /> </button>

      {open && (
        <div className="share-dropdown">

          {/* APLICAÇÃO DA PROPRIEDADE 'IMAGE' - Preview visual do link condicional */}
          {image && (
            <div className="share-image-preview">
              <img src={image} alt="Preview do compartilhamento" />
            </div>
          )}

          {"share" in navigator && (
            <button className="share-dropdown-item" onClick={handleNativeShare}>
              <FiShare2 size={16} /> Compartilhar no dispositivo
            </button>
          )}

          <a className="share-dropdown-item" href={shareLinks.whatsapp} target="_blank" rel="noreferrer">
            <FaWhatsapp size={16} /> WhatsApp
          </a>

          <a className="share-dropdown-item" href={shareLinks.facebook} target="_blank" rel="noreferrer">
            <FaFacebook size={16} /> Facebook
          </a>

          <a className="share-dropdown-item" href={shareLinks.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedin size={16} /> LinkedIn
          </a>

          <a className="share-dropdown-item" href={shareLinks.twitter} target="_blank" rel="noreferrer">
            <FaTwitter size={16} /> X (Twitter)
          </a>

          <hr className="share-divider" />

          <button className="share-dropdown-item" onClick={handleCopy}>
            {copied ? <FiCheck size={16} className="share-success-icon" /> : <FiCopy size={16} />}
            <span className={copied ? "share-success-text" : ""}>
              {copied ? "Copiado!" : "Copiar link"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;