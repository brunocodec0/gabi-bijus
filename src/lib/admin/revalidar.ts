import { revalidatePath } from "next/cache";

/**
 * Revalida TODO o site público de uma vez (o layout raiz cobre todas
 * as rotas abaixo dele). Chamar depois de qualquer alteração no
 * painel — assim a loja reflete a mudança na hora, mesmo com as
 * páginas sendo cacheadas.
 */
export function revalidarSitePublico() {
  revalidatePath("/", "layout");
}
