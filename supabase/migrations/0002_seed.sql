-- ============================================================
-- GABI BIJUS — Seed de exemplo (Etapa 3)
-- Produtos fictícios com imagens placeholder do próprio site.
-- Quando as fotos reais forem enviadas pelo admin, as URLs
-- passarão a apontar para o Storage.
-- ============================================================

-- ---------- CATEGORIAS ----------

insert into public.categories (name, slug, sort_order) values
  ('Colares', 'colares', 1),
  ('Chokers', 'chokers', 2),
  ('Brincos', 'brincos', 3),
  ('Pulseiras', 'pulseiras', 4),
  ('Body chains', 'body-chains', 5),
  ('Anéis', 'aneis', 6);

-- ---------- PRODUTOS ----------

insert into public.products
  (name, slug, category_id, price, promo_price, description, materials, size_info, is_new, featured, sold_out, active)
values
  (
    'Colar Sol de Ipanema', 'colar-sol-de-ipanema',
    (select id from public.categories where slug = 'colares'),
    65, null,
    'Um pingente orgânico dourado que parece ter sido moldado pelo próprio sol. Feito à mão, cada peça sai levemente diferente — como as ondas.',
    'Latão com banho dourado, corrente inoxidável. Banho dourado artesanal. Evite contato com água do mar, perfume e cremes.',
    'Corrente de 45 cm com extensor de 5 cm. Pingente de ~2,5 cm.',
    true, true, false, true
  ),
  (
    'Choker Maré Alta', 'choker-mare-alta',
    (select id from public.categories where slug = 'chokers'),
    55, null,
    'Cordão encerado trançado à mão com detalhe central dourado. Justinho no pescoço, do jeito que a maré alta pede.',
    'Cordão encerado, entremeio de latão com banho dourado. Evite contato com água do mar, perfume e cremes.',
    'Ajustável de 30 a 38 cm com fecho corrediço.',
    false, true, false, true
  ),
  (
    'Brinco Estrela do Mar', 'brinco-estrela-do-mar',
    (select id from public.categories where slug = 'brincos'),
    45, 39,
    'Estrelinhas douradas de textura orgânica, leves de usar o dia inteiro. Últimas unidades desta leva.',
    'Latão com banho dourado, tarraxa antialérgica. Evite contato com água do mar, perfume e cremes.',
    'Pingente de ~1,8 cm. Peso: 3 g por brinco.',
    false, true, false, true
  ),
  (
    'Body Chain Arpoador', 'body-chain-arpoador',
    (select id from public.categories where slug = 'body-chains'),
    89, null,
    'Correntes finas que desenham o corpo como o sol desenha a pedra do Arpoador no fim de tarde. Pra usar com biquíni ou decote.',
    'Correntes de latão com banho dourado, fecho lagosta. Evite contato com água do mar, perfume e cremes.',
    'Ajustável em 3 pontos. Comprimento total de até 80 cm.',
    true, true, false, true
  ),
  (
    'Pulseira Pôr do Sol no Leme', 'pulseira-por-do-sol-no-leme',
    (select id from public.categories where slug = 'pulseiras'),
    39, null,
    'Continhas douradas intercaladas à mão, uma a uma. Fica linda sozinha e melhor ainda empilhada.',
    'Contas de latão com banho dourado, fio de silicone resistente. Evite contato com água do mar, perfume e cremes.',
    'Elástica, veste pulsos de 15 a 19 cm.',
    false, false, false, true
  ),
  (
    'Anel Concha Dourada', 'anel-concha-dourada',
    (select id from public.categories where slug = 'aneis'),
    35, null,
    'Uma concha achada na areia e eternizada em dourado. Esgotou — mas volta na próxima leva.',
    'Latão com banho dourado. Evite contato com água do mar, perfume e cremes.',
    'Aro ajustável, veste do 14 ao 22.',
    false, false, true, true
  ),
  (
    'Colar Lua Cheia', 'colar-lua-cheia',
    (select id from public.categories where slug = 'colares'),
    59, null,
    'Medalha martelada à mão que segura a luz como a lua cheia segura o mar. Pro dia e pra noite.',
    'Latão martelado com banho dourado, corrente inoxidável. Evite contato com água do mar, perfume e cremes.',
    'Corrente de 50 cm com extensor de 5 cm. Medalha de ~2 cm.',
    false, false, false, true
  ),
  (
    'Pulseira Calçadão', 'pulseira-calcadao',
    (select id from public.categories where slug = 'pulseiras'),
    42, null,
    'Elos ondulados inspirados no calçadão de Copacabana — o mesmo desenho que corre por este site inteiro.',
    'Latão com banho dourado, fecho lagosta. Evite contato com água do mar, perfume e cremes.',
    '18 cm com extensor de 3 cm.',
    true, false, false, true
  );

-- ---------- IMAGENS DOS PRODUTOS ----------

insert into public.product_images (product_id, url, alt, sort_order)
select p.id, i.url, i.alt, i.sort_order
from (values
  ('colar-sol-de-ipanema', '/placeholders/p1.svg', 'Colar Sol de Ipanema com pingente dourado orgânico', 0),
  ('colar-sol-de-ipanema', '/placeholders/p3.svg', 'Detalhe do pingente do Colar Sol de Ipanema', 1),
  ('colar-sol-de-ipanema', '/placeholders/p7.svg', 'Colar Sol de Ipanema usado com decote', 2),
  ('choker-mare-alta', '/placeholders/p2.svg', 'Choker de cordão Maré Alta com fecho dourado', 0),
  ('choker-mare-alta', '/placeholders/p6.svg', 'Detalhe do fecho do Choker Maré Alta', 1),
  ('brinco-estrela-do-mar', '/placeholders/p3.svg', 'Par de brincos Estrela do Mar dourados', 0),
  ('brinco-estrela-do-mar', '/placeholders/p1.svg', 'Brinco Estrela do Mar em uso', 1),
  ('body-chain-arpoador', '/placeholders/p5.svg', 'Body chain Arpoador dourada sobre pele bronzeada', 0),
  ('body-chain-arpoador', '/placeholders/p8.svg', 'Body chain Arpoador vista de costas', 1),
  ('body-chain-arpoador', '/placeholders/p4.svg', 'Detalhe das correntes da Body Chain Arpoador', 2),
  ('pulseira-por-do-sol-no-leme', '/placeholders/p7.svg', 'Pulseira Pôr do Sol no Leme com contas douradas', 0),
  ('pulseira-por-do-sol-no-leme', '/placeholders/p2.svg', 'Pulseira Pôr do Sol no Leme empilhada com outras', 1),
  ('anel-concha-dourada', '/placeholders/p6.svg', 'Anel Concha Dourada ajustável', 0),
  ('colar-lua-cheia', '/placeholders/p4.svg', 'Colar Lua Cheia com medalha dourada martelada', 0),
  ('colar-lua-cheia', '/placeholders/p5.svg', 'Colar Lua Cheia em uso à noite', 1),
  ('pulseira-calcadao', '/placeholders/p8.svg', 'Pulseira Calçadão com elos ondulados', 0),
  ('pulseira-calcadao', '/placeholders/p1.svg', 'Detalhe dos elos da Pulseira Calçadão', 1)
) as i (product_slug, url, alt, sort_order)
join public.products p on p.slug = i.product_slug;

-- ---------- CAMPANHA ----------

insert into public.campaigns (title, slug, image_url, body, cta_label, active)
values (
  'Edição Verão no Arpoador',
  'verao-no-arpoador',
  '/placeholders/p4.svg',
  'Peças douradas pensadas para o pôr do sol mais famoso do Rio. Poucas unidades, feitas uma a uma.',
  'Ver a coleção',
  true
);

insert into public.campaign_products (campaign_id, product_id)
select c.id, p.id
from public.campaigns c
join public.products p on p.slug in ('body-chain-arpoador', 'colar-sol-de-ipanema', 'brinco-estrela-do-mar')
where c.slug = 'verao-no-arpoador';

-- ---------- CONTEÚDO DO SITE ----------

insert into public.site_content (key, value) values
  ('hero', jsonb_build_object(
    'tagline', 'O verão eterno, feito à',
    'highlight', 'mão',
    'subtitle', 'Bijuterias artesanais feitas no Rio de Janeiro — colares, chokers e dourados orgânicos com cheiro de maresia.'
  )),
  ('marquee', jsonb_build_object(
    'words', jsonb_build_array('RIO DE JANEIRO', 'VERÃO ETERNO', 'FEITO À MÃO', 'AFETO')
  )),
  ('sobre', jsonb_build_object(
    'title', 'A mão da Gabi, o tempo do mar',
    'text', 'Cada peça nasce devagar, feita à mão, uma a uma, entre o barulho da praia e a bancada da Gabi. Não é produção em série: é afeto dobrado em arame, banho dourado e pedra escolhida no olho. Do Rio, com sol, para o seu dia a dia.'
  )),
  ('instagram', jsonb_build_object(
    'handle', '@gabi.bijuss',
    'url', 'https://instagram.com/gabi.bijuss',
    'images', jsonb_build_array(
      jsonb_build_object('src', '/placeholders/p1.svg', 'alt', 'Foto do feed: colar dourado na areia'),
      jsonb_build_object('src', '/placeholders/p4.svg', 'alt', 'Foto do feed: choker de cordão'),
      jsonb_build_object('src', '/placeholders/p3.svg', 'alt', 'Foto do feed: brincos ao sol'),
      jsonb_build_object('src', '/placeholders/p8.svg', 'alt', 'Foto do feed: pulseiras empilhadas'),
      jsonb_build_object('src', '/placeholders/p5.svg', 'alt', 'Foto do feed: body chain na praia'),
      jsonb_build_object('src', '/placeholders/p2.svg', 'alt', 'Foto do feed: pingente orgânico')
    )
  )),
  ('contato', jsonb_build_object(
    'whatsapp', null
  )),
  ('rodape', jsonb_build_object(
    'nota', 'Pagamento e frete combinados direto no WhatsApp 💛',
    'cuidados', 'Suas bijus duram mais longe de água do mar, perfume e cremes. Guarde em saquinho fechado e seco.'
  )),
  ('politica', jsonb_build_object(
    'trocas', 'Deu algo errado com a sua peça? Fala com a gente pelo WhatsApp em até 7 dias após o recebimento que resolvemos juntas. 💛'
  ));

-- ---------- ADMINS (placeholders) ----------
-- As duas contas admin serão criadas manualmente no dashboard
-- (Authentication → Users → Add user) quando os e-mails existirem.
-- Depois, registrar aqui:
--
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email in
--   ('EMAIL_ADMIN_1', 'EMAIL_ADMIN_2');
