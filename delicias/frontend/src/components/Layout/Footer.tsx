import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-secondary)]">Panadería Delicias</h3>
          <p className="text-sm text-black/70 mt-1">Pan artesanal, dulces y tortas con ingredientes de primera calidad.</p>
        </div>
        <div>
          <h4 className="font-semibold">Contacto</h4>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li className="flex items-center gap-2"><MapPin size={16} /> Jr. Parra del Riego #164, El Tambo, Huancayo</li>
            <li className="flex items-center gap-2"><Phone size={16} /> 993560096</li>
            <li className="flex items-center gap-2"><Mail size={16} /> contacto@delicias.com</li>
            <li className="text-black/60">Horarios: Lunes a Domingo, 7:00 AM – 9:00 PM</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Síguenos</h4>
          <div className="mt-2 flex items-center gap-3">
            <a aria-label="Instagram" href="#" className="inline-flex items-center gap-1 text-sm hover:text-[var(--color-secondary)]"><Instagram size={16} /> Instagram</a>
            <a aria-label="Facebook" href="#" className="inline-flex items-center gap-1 text-sm hover:text-[var(--color-secondary)]"><Facebook size={16} /> Facebook</a>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10">
        <div className="container py-4 flex items-center justify-between text-sm">
          <p className="text-black/60">© {new Date().getFullYear()} Delicias. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-black/70">
            <a href="/terms" className="hover:text-black">Términos</a>
            <a href="/privacy" className="hover:text-black">Privacidad</a>
            <a href="/#contacto" className="hover:text-black">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}