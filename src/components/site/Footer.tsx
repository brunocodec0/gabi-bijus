import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/types";

import { WaveDivider } from "./WaveDivider";

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="overflow-hidden bg-primary-dark text-bg/80">
      <WaveDivider id="footer-wave" className="text-gold/50" height={40} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl font-semibold text-bg">
            Gabi <em>Bijus</em>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Bijuterias artesanais feitas à mão no Rio de Janeiro. Verão eterno,
            afeto e dourado.
          </p>
          <p className="mt-4 text-sm text-sun">{content.footerNote}</p>
        </div>

        <div>
          <p className="label-caps text-gold">Navegue</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/" className="link-underline">
                Início
              </Link>
            </li>
            <li>
              <Link href="/produtos" className="link-underline">
                Produtos
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?filtro=novidades"
                className="link-underline"
              >
                Novidades
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?filtro=descontos"
                className="link-underline"
              >
                Descontos
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="link-underline">
                Sobre a marca
              </Link>
            </li>
            <li>
              <Link href="/trocas-e-cuidados" className="link-underline">
                Trocas e cuidados
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps text-gold">Fale com a gente</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={content.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                Instagram {content.instagramHandle}
              </a>
            </li>
            <li>
              {content.whatsappNumber ? (
                <a
                  href={`https://wa.me/${content.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  WhatsApp
                </a>
              ) : (
                <span className="opacity-70">WhatsApp em breve</span>
              )}
            </li>
          </ul>
          <p className="mt-6 max-w-xs text-xs leading-relaxed opacity-70">
            {content.careNote}
          </p>
        </div>
      </div>

      {/* Logo original da marca (traço sobre o fundo do footer) */}
      <div className="flex justify-center pb-7">
        <Image
          src="/logo-traco.png"
          alt="Logo Gabi Bijus — desenho do Cristo Redentor e do Pão de Açúcar, handmade"
          width={462}
          height={227}
          className="h-auto w-56 md:w-64"
        />
      </div>

      <div className="relative border-t border-bg/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Gabi Bijus · Feito à mão no Rio de Janeiro
        <span className="mx-2 opacity-40">·</span>
        site por{" "}
        <a
          href="https://codeco-site.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 underline underline-offset-2 hover:opacity-100"
        >
          Bruno Codeco
        </a>
      </div>
    </footer>
  );
}
