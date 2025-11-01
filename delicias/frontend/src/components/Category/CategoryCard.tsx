"use client";
import Link from "next/link";
import Image from "next/image";
import getImageSrc from "@/utils/image";

export type Category = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
};

type Props = {
  categoria: Category;
  href?: string | null; // if null, renders without link; if undefined, defaults to /products?categoria=<id>
};

export default function CategoryCard({ categoria, href }: Props) {
  const link = href === undefined ? `/products?categoria=${categoria.id}` : href;
  const src = getImageSrc(categoria.imagen, { width: 600 });

  const CardInner = (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square relative">
        <Image
          src={src}
          alt={categoria.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-80 transition group-hover:opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="inline-flex items-center rounded-lg bg-white/85 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            {categoria.nombre}
          </div>
        </div>
      </div>
    </div>
  );

  if (link === null) {
    return <div className="group block">{CardInner}</div>;
  }
  return (
    <Link href={link} className="group block">
      {CardInner}
    </Link>
  );
}