
// ⭐ ARQUIVO CENTRAL DE IDs - NEVER HARDCODE IDs ⭐
// Este é o ÚNICO local onde IDs devem ser definidos no projeto
// TODOS os outros arquivos DEVEM importar IDs deste arquivo
// 
// 🚫 NUNCA faça: const id = "res-abc123..."
// ✅ SEMPRE faça: import { RESOURCE_IDS } from '@shared/constants/game-ids'
//
// Este sistema garante consistência total entre backend e frontend

export const RESOURCE_IDS = {
  // === RECURSOS BÁSICOS ===
  FIBRA: "res-fibra-001",
  PEDRA: "res-pedra-001",
  PEDRAS_SOLTAS: "res-pedras-soltas-001",
  GRAVETOS: "res-gravetos-001",
  AGUA_FRESCA: "res-agua-fresca-001",
  BAMBU: "res-bambu-001",
  MADEIRA: "res-madeira-001",
  ARGILA: "res-argila-001",
  FERRO_FUNDIDO: "res-ferro-fundido-001",
  COURO: "res-couro-001",
  CARNE: "res-carne-001",
  OSSOS: "res-ossos-001",
  PELO: "res-pelo-001",
  BARBANTE: "res-barbante-001",

  // === NOVOS RECURSOS BÁSICOS EXPANDIDOS ===
  LINHO: "res-linho-001",
  ALGODAO: "res-algodao-001",
  JUTA: "res-juta-001",
  SISAL: "res-sisal-001",
  CANAMO: "res-canamo-001",
  MADEIRA_CARVALHO: "res-madeira-carvalho-001",
  MADEIRA_PINHO: "res-madeira-pinho-001",
  MADEIRA_CEDRO: "res-madeira-cedro-001",
  MADEIRA_EUCALIPTO: "res-madeira-eucalipto-001",
  MADEIRA_MOGNO: "res-madeira-mogno-001",
  PEDRA_CALCARIA: "res-pedra-calcaria-001",
  PEDRA_GRANITO: "res-pedra-granito-001",
  PEDRA_ARDOSIA: "res-pedra-ardosia-001",
  PEDRA_MARMORE: "res-pedra-marmore-001",
  QUARTZO: "res-quartzo-001",
  AMETISTA: "res-ametista-001",
  TOPAZIO: "res-topazio-001",
  ESMERALDA: "res-esmeralda-001",
  RUBI: "res-rubi-001",
  DIAMANTE: "res-diamante-001",

  // === METAIS E MINERAIS ===
  MINERAL_FERRO: "res-mineral-ferro-001",
  MINERAL_COBRE: "res-mineral-cobre-001",
  MINERAL_ESTANHO: "res-mineral-estanho-001",
  MINERAL_CHUMBO: "res-mineral-chumbo-001",
  MINERAL_ZINCO: "res-mineral-zinco-001",
  MINERAL_PRATA: "res-mineral-prata-001",
  MINERAL_OURO: "res-mineral-ouro-001",
  MINERAL_PLATINA: "res-mineral-platina-001",
  CARVAO: "res-carvao-001",
  CARVAO_VEGETAL: "res-carvao-vegetal-001",
  ENXOFRE: "res-enxofre-001",
  SALITRE: "res-salitre-001",

  // === CONSUMÍVEIS E ISCAS ===
  ISCA_PESCA: "res-isca-pesca-001",
  ISCA_MINHOCA: "res-isca-minhoca-001",
  ISCA_GRILO: "res-isca-grilo-001",
  ISCA_ARTIFICIAL: "res-isca-artificial-001",
  REDE_PESCA: "res-rede-pesca-001",

  // === COMPONENTES DE EQUIPAMENTOS ===
  // Cabos e Hastes
  CABO_MACHADO: "res-cabo-machado-001",
  CABO_PICARETA: "res-cabo-picareta-001", 
  CABO_ESPADA: "res-cabo-espada-001",
  CABO_FACA: "res-cabo-faca-001",
  CABO_LANCA: "res-cabo-lanca-001",
  HASTE_FLECHA: "res-haste-flecha-001",
  CABO_FOICE: "res-cabo-foice-001",
  CABO_PA: "res-cabo-pa-001",
  VARA_BAMBU: "res-vara-bambu-001",
  CABO_MARTELO: "res-cabo-martelo-001",
  CABO_SERRA: "res-cabo-serra-001",
  CABO_ENXADA: "res-cabo-enxada-001",

  // Cabeças e Lâminas
  CABECA_MACHADO: "res-cabeca-machado-001",
  CABECA_PICARETA: "res-cabeca-picareta-001",
  LAMINA_ESPADA: "res-lamina-espada-001",
  LAMINA_FACA: "res-lamina-faca-001",
  PONTA_LANCA: "res-ponta-lanca-001",
  PONTA_FLECHA: "res-ponta-flecha-001",
  LAMINA_FOICE: "res-lamina-foice-001",
  CABECA_PA: "res-cabeca-pa-001",
  CABECA_MARTELO: "res-cabeca-martelo-001",
  LAMINA_SERRA: "res-lamina-serra-001",
  LAMINA_ENXADA: "res-lamina-enxada-001",

  // === MATERIAIS PROCESSADOS ===
  BARRA_FERRO: "res-barra-ferro-001",
  BARRA_COBRE: "res-barra-cobre-001",
  BARRA_BRONZE: "res-barra-bronze-001",
  BARRA_ACO: "res-barra-aco-001",
  BARRA_PRATA: "res-barra-prata-001",
  BARRA_OURO: "res-barra-ouro-001",
  LINGOTE_FERRO: "res-lingote-ferro-001",
  LINGOTE_COBRE: "res-lingote-cobre-001",
  LINGOTE_BRONZE: "res-lingote-bronze-001",
  LINGOTE_ACO: "res-lingote-aco-001",
  CHAPA_FERRO: "res-chapa-ferro-001",
  CHAPA_COBRE: "res-chapa-cobre-001",
  CHAPA_BRONZE: "res-chapa-bronze-001",
  FERRO_FUNDIDO_REFINADO: "res-ferro-fundido-refinado-001",

  // === CORDAS E AMARRAÇÕES ===
  CORDA_RESISTENTE: "res-corda-resistente-001",
  CORDA_NAVAL: "res-corda-naval-001",
  CORDA_ALPINISMO: "res-corda-alpinismo-001",
  FIO_SINEW: "res-fio-sinew-001",
  BARBANTE_REFORÇADO: "res-barbante-reforcado-001",
  CABO_METAL: "res-cabo-metal-001",
  CORRENTE_FERRO: "res-corrente-ferro-001",

  // === TECIDOS E COUROS ===
  COURO_CURTIDO: "res-couro-curtido-001",
  COURO_REFINADO: "res-couro-refinado-001",
  COURO_BOVINO: "res-couro-bovino-001",
  COURO_JAVALI: "res-couro-javali-001",
  COURO_VEADO: "res-couro-veado-001",
  TECIDO_FIBRA: "res-tecido-fibra-001",
  TECIDO_LINHO: "res-tecido-linho-001",
  TECIDO_ALGODAO: "res-tecido-algodao-001",
  TECIDO_SEDA: "res-tecido-seda-001",
  PELE_TRATADA: "res-pele-tratada-001",
  FELTRO: "res-feltro-001",

  // === COMPONENTES ESPECIAIS ===
  GANCHO_FERRO: "res-gancho-ferro-001",
  GANCHO_BRONZE: "res-gancho-bronze-001",
  ARGOLA_FERRO: "res-argola-ferro-001",
  ARGOLA_BRONZE: "res-argola-bronze-001",
  PREGO_FERRO: "res-prego-ferro-001",
  PREGO_BRONZE: "res-prego-bronze-001",
  DOBRADIÇA_FERRO: "res-dobradica-ferro-001",
  DOBRADIÇA_BRONZE: "res-dobradica-bronze-001",
  CORDA_ARCO: "res-corda-arco-001",
  EMPUNHADURA: "res-empunhadura-001",
  EMPUNHADURA_COURO: "res-empunhadura-couro-001",
  BOTOES_OSSO: "res-botoes-osso-001",
  FIVELA_METAL: "res-fivela-metal-001",

  // === MATERIAIS PARA PROCESSAMENTO ===
  FIBRA_ALGODAO: "res-fibra-algodao-001",
  PEDRA_AMOLAR: "res-pedra-amolar-001",
  RESINA_ARVORE: "res-resina-arvore-001",
  COLA_OSSO: "res-cola-osso-001",
  VERNIZ_NATURAL: "res-verniz-natural-001",
  OLEO_LINHAÇA: "res-oleo-linhaca-001",
  CERA_ABELHA: "res-cera-abelha-001",

  // === ANIMAIS TERRESTRES ===
  COELHO: "res-coelho-001",
  LEBRE: "res-lebre-001",
  VEADO: "res-veado-001",
  CERVO: "res-cervo-001",
  JAVALI: "res-javali-001",
  PORCO_SELVAGEM: "res-porco-selvagem-001",
  RAPOSA: "res-raposa-001",
  LOBO: "res-lobo-001",
  URSO: "res-urso-001",
  ALCE: "res-alce-001",
  RENA: "res-rena-001",
  BISAO: "res-bisao-001",
  BOI_SELVAGEM: "res-boi-selvagem-001",
  CABRA_MONTANHA: "res-cabra-montanha-001",
  OVELHA_SELVAGEM: "res-ovelha-selvagem-001",
  ESQUILO: "res-esquilo-001",
  CASTOR: "res-castor-001",
  LONTRA: "res-lontra-001",

  // === AVES ===
  PATO: "res-pato-001",
  GANSO: "res-ganso-001",
  CISNE: "res-cisne-001",
  GALINHA_DANGOLA: "res-galinha-dangola-001",
  PERDIZ: "res-perdiz-001",
  CODORNA: "res-codorna-001",
  FAISAO: "res-faisao-001",
  POMBO: "res-pombo-001",
  ROLINHA: "res-rolinha-001",
  CORUJA: "res-coruja-001",
  FALCAO: "res-falcao-001",
  AGUIA: "res-aguia-001",

  // === PEIXES DE ÁGUA DOCE ===
  PEIXE_PEQUENO: "res-peixe-pequeno-001",
  PEIXE_GRANDE: "res-peixe-grande-001",
  SALMAO: "res-salmao-001",
  TRUTA: "res-truta-001",
  CARPA: "res-carpa-001",
  BAGRE: "res-bagre-001",
  LÚCIO: "res-lucio-001",
  PERCA: "res-perca-001",
  DOURADO: "res-dourado-001",
  PINTADO: "res-pintado-001",
  SURUBIM: "res-surubim-001",
  TRAIRA: "res-traira-001",
  TAMBAQUI: "res-tambaqui-001",
  PIRARUCU: "res-pirarucu-001",

  // === PEIXES DE ÁGUA SALGADA ===
  ATUM: "res-atum-001",
  SARDINHA: "res-sardinha-001",
  ANCHOVA: "res-anchova-001",
  BACALHAU: "res-bacalhau-001",
  LINGUADO: "res-linguado-001",
  ROBALO: "res-robalo-001",
  DOURADA: "res-dourada-001",
  PREGADO: "res-pregado-001",
  MERO: "res-mero-001",
  GAROUPA: "res-garoupa-001",

  // === FRUTOS DO MAR ===
  CAMARAO: "res-camarao-001",
  LAGOSTA: "res-lagosta-001",
  CARANGUEJO: "res-caranguejo-001",
  SIRI: "res-siri-001",
  OSTRA: "res-ostra-001",
  MEXILHAO: "res-mexilhao-001",
  VIEIRA: "res-vieira-001",
  LULA: "res-lula-001",
  POLVO: "res-polvo-001",

  // === PLANTAS E VEGETAIS SELVAGENS ===
  COGUMELOS: "res-cogumelos-001",
  COGUMELOS_SHITAKE: "res-cogumelos-shitake-001",
  COGUMELOS_OSTRA: "res-cogumelos-ostra-001",
  FRUTAS_SILVESTRES: "res-frutas-silvestres-001",
  AMORAS: "res-amoras-001",
  FRAMBOESAS: "res-framboesas-001",
  MIRTILOS: "res-mirtilos-001",
  MORANGOS_SELVAGENS: "res-morangos-selvagens-001",
  MAÇÃS_SELVAGENS: "res-macas-selvagens-001",
  NOZES: "res-nozes-001",
  AVELÃS: "res-avelas-001",
  CASTANHAS: "res-castanhas-001",
  PINHOES: "res-pinhoes-001",
  RAIZES_COMESTIVEIS: "res-raizes-comestiveis-001",
  ERVAS_MEDICINAIS: "res-ervas-medicinais-001",
  FOLHAS_CHA: "res-folhas-cha-001",
  FLORES_COMESTIVEIS: "res-flores-comestiveis-001",

  // === RECURSOS ÚNICOS POR BIOMA ===
  MADEIRA_FLORESTA: "res-madeira-floresta-001",
  AREIA: "res-areia-001",
  AREIA_FINA: "res-areia-fina-001",
  AREIA_GROSSA: "res-areia-grossa-001",
  CRISTAIS: "res-cristais-001",
  CRISTAIS_ENERGIA: "res-cristais-energia-001",
  CONCHAS: "res-conchas-001",
  CONCHAS_GRANDES: "res-conchas-grandes-001",
  CORAL: "res-coral-001",
  ALGAS_MARINHAS: "res-algas-marinhas-001",
  SAL_MARINHO: "res-sal-marinho-001",
  PEROLAS: "res-perolas-001",
  AMBAR: "res-ambar-001",
  GELO_ETERNO: "res-gelo-eterno-001",
  NEVE_PURA: "res-neve-pura-001",

  // === ALIMENTOS PROCESSADOS ===
  SUCO_FRUTAS: "res-suco-frutas-001",
  SUCO_AMORA: "res-suco-amora-001",
  SUCO_FRAMBOESA: "res-suco-framboesa-001",
  COGUMELOS_ASSADOS: "res-cogumelos-assados-001",
  COGUMELOS_REFOGADOS: "res-cogumelos-refogados-001",
  PEIXE_GRELHADO: "res-peixe-grelhado-001",
  PEIXE_DEFUMADO: "res-peixe-defumado-001",
  CARNE_ASSADA: "res-carne-assada-001",
  CARNE_DEFUMADA: "res-carne-defumada-001",
  CARNE_SECA: "res-carne-seca-001",
  ENSOPADO_CARNE: "res-ensopado-carne-001",
  ENSOPADO_PEIXE: "res-ensopado-peixe-001",
  ENSOPADO_VEGETAIS: "res-ensopado-vegetais-001",
  SOPA_COGUMELOS: "res-sopa-cogumelos-001",
  PAO_SELVAGEM: "res-pao-selvagem-001",
  FARINHA_NOZES: "res-farinha-nozes-001",
  OLEO_PEIXE: "res-oleo-peixe-001",
  MANTEIGA_ANIMAL: "res-manteiga-animal-001",

  // === MATERIAIS RAROS ===
  METEORITO: "res-meteorito-001",
  OBSIDIANA: "res-obsidiana-001",
  CRISTAL_LUNAR: "res-cristal-lunar-001",
  ESSENCIA_MAGICA: "res-essencia-magica-001",
  PEDRA_FILOSOFAL: "res-pedra-filosofal-001",
  MITHRIL: "res-mithril-001",
  ADAMANTIUM: "res-adamantium-001"
} as const;

export const EQUIPMENT_IDS = {
  // === FERRAMENTAS BÁSICAS ===
  PICARETA: "eq-tool-picareta-001",
  MACHADO: "eq-tool-machado-001",
  PA: "eq-tool-pa-001",
  VARA_PESCA: "eq-tool-vara-pesca-001",
  FOICE: "eq-tool-foice-001",
  FACA: "eq-tool-faca-001",
  BALDE_MADEIRA: "eq-tool-balde-madeira-001",
  GARRAFA_BAMBU: "eq-tool-garrafa-bambu-001",
  CORDA: "eq-tool-corda-001",
  PANELA_BARRO: "eq-tool-panela-barro-001",
  PANELA: "eq-tool-panela-001",

  // === FERRAMENTAS AVANÇADAS ===
  PICARETA_FERRO: "eq-tool-picareta-ferro-001",
  PICARETA_ACO: "eq-tool-picareta-aco-001",
  PICARETA_MITHRIL: "eq-tool-picareta-mithril-001",
  MACHADO_FERRO: "eq-tool-machado-ferro-001",
  MACHADO_ACO: "eq-tool-machado-aco-001",
  MACHADO_BATALHA: "eq-tool-machado-batalha-001",
  PA_FERRO: "eq-tool-pa-ferro-001",
  PA_ACO: "eq-tool-pa-aco-001",
  FACA_FERRO: "eq-tool-faca-ferro-001",
  FACA_ACO: "eq-tool-faca-aco-001",
  FOICE_FERRO: "eq-tool-foice-ferro-001",
  FOICE_ACO: "eq-tool-foice-aco-001",

  // === FERRAMENTAS ESPECIALIZADAS ===
  MARTELO: "eq-tool-martelo-001",
  MARTELO_FERRO: "eq-tool-martelo-ferro-001",
  SERRA: "eq-tool-serra-001",
  SERRA_FERRO: "eq-tool-serra-ferro-001",
  ENXADA: "eq-tool-enxada-001",
  ENXADA_FERRO: "eq-tool-enxada-ferro-001",
  CINZEL: "eq-tool-cinzel-001",
  LIMA: "eq-tool-lima-001",
  FURADEIRA: "eq-tool-furadeira-001",
  ALICATE: "eq-tool-alicate-001",

  // === EQUIPAMENTOS DE PESCA ===
  VARA_PESCA_BAMBU: "eq-tool-vara-pesca-bambu-001",
  VARA_PESCA_AVANCADA: "eq-tool-vara-pesca-avancada-001",
  VARA_PESCA_MASTER: "eq-tool-vara-pesca-master-001",
  REDE_PESCA_PEQUENA: "eq-tool-rede-pesca-pequena-001",
  REDE_PESCA_GRANDE: "eq-tool-rede-pesca-grande-001",
  ARPAO: "eq-tool-arpao-001",
  LANÇA_PESCA: "eq-tool-lanca-pesca-001",

  // === ARMAS BRANCAS ===
  ARCO_FLECHA: "eq-weap-arco-flecha-001",
  LANCA: "eq-weap-lanca-001",
  ESPADA_PEDRA: "eq-weap-espada-pedra-001",
  ESPADA_FERRO: "eq-weap-espada-ferro-001",
  ESPADA_ACO: "eq-weap-espada-aco-001",
  ESPADA_MITHRIL: "eq-weap-espada-mithril-001",
  LANCA_FERRO: "eq-weap-lanca-ferro-001",
  LANCA_ACO: "eq-weap-lanca-aco-001",
  ARCO_COMPOSTO: "eq-weap-arco-composto-001",
  ARCO_RECURVO: "eq-weap-arco-recurvo-001",
  BESTA: "eq-weap-besta-001",

  // === ARMAS CONTUNDENTES ===
  CLAVA: "eq-weap-clava-001",
  MACA: "eq-weap-maca-001",
  MARTELO_GUERRA: "eq-weap-martelo-guerra-001",
  MACHADO_GUERRA: "eq-weap-machado-guerra-001",
  BASTAO: "eq-weap-bastao-001",

  // === ARMAS DE ARREMESSO ===
  DARDO: "eq-weap-dardo-001",
  AZAGAIA: "eq-weap-azagaia-001",
  MACHADINHA: "eq-weap-machadinha-001",
  BUMERANGUE: "eq-weap-bumerangue-001",
  SHURIKEN: "eq-weap-shuriken-001",

  // === ARMADURAS DE COURO ===
  CAPACETE_COURO: "eq-armor-capacete-couro-001",
  PEITORAL_COURO: "eq-armor-peitoral-couro-001",
  CALCAS_COURO: "eq-armor-calcas-couro-001",
  BOTAS_COURO: "eq-armor-botas-couro-001",
  LUVAS_COURO: "eq-armor-luvas-couro-001",
  CINTO_COURO: "eq-armor-cinto-couro-001",
  BRAÇADEIRAS_COURO: "eq-armor-bracadeiras-couro-001",

  // === ARMADURAS DE FERRO ===
  CAPACETE_FERRO: "eq-armor-capacete-ferro-001",
  PEITORAL_FERRO: "eq-armor-peitoral-ferro-001",
  CALCAS_FERRO: "eq-armor-calcas-ferro-001",
  BOTAS_FERRO: "eq-armor-botas-ferro-001",
  LUVAS_FERRO: "eq-armor-luvas-ferro-001",
  ESCUDO_FERRO: "eq-armor-escudo-ferro-001",
  ELMO_FERRO: "eq-armor-elmo-ferro-001",

  // === ARMADURAS DE AÇO ===
  CAPACETE_ACO: "eq-armor-capacete-aco-001",
  PEITORAL_ACO: "eq-armor-peitoral-aco-001",
  CALCAS_ACO: "eq-armor-calcas-aco-001",
  BOTAS_ACO: "eq-armor-botas-aco-001",
  LUVAS_ACO: "eq-armor-luvas-aco-001",
  ESCUDO_ACO: "eq-armor-escudo-aco-001",
  ELMO_ACO: "eq-armor-elmo-aco-001",

  // === ARMADURAS ESPECIAIS ===
  CAPACETE_MITHRIL: "eq-armor-capacete-mithril-001",
  PEITORAL_MITHRIL: "eq-armor-peitoral-mithril-001",
  ESCUDO_DRAGAO: "eq-armor-escudo-dragao-001",
  CAPA_INVISIBILIDADE: "eq-armor-capa-invisibilidade-001",
  AMULETO_PROTECAO: "eq-armor-amuleto-protecao-001",

  // === CONTAINERS E ARMAZENAMENTO ===
  MOCHILA: "eq-container-mochila-001",
  MOCHILA_GRANDE: "eq-container-mochila-grande-001",
  MOCHILA_GIGANTE: "eq-container-mochila-gigante-001",
  BOLSA_FERRAMENTAS: "eq-container-bolsa-ferramentas-001",
  BARRIL_IMPROVISADO: "eq-container-barril-improvisado-001",
  BARRIL_MADEIRA: "eq-container-barril-madeira-001",
  BAU_MADEIRA: "eq-container-bau-madeira-001",
  BAU_FERRO: "eq-container-bau-ferro-001",
  SACOLA_LINHO: "eq-container-sacola-linho-001",
  ALFORGE: "eq-container-alforge-001",

  // === UTENSÍLIOS DE COZINHA ===
  PANELA_FERRO: "eq-util-panela-ferro-001",
  FRIGIDEIRA: "eq-util-frigideira-001",
  CALDEIRAO: "eq-util-caldeirao-001",
  ESPETO: "eq-util-espeto-001",
  GRELHA: "eq-util-grelha-001",
  DEFUMADOR: "eq-util-defumador-001",
  MOEDOR: "eq-util-moedor-001",
  PENEIRA: "eq-util-peneira-001",

  // === INSTRUMENTOS MUSICAIS ===
  FLAUTA_BAMBU: "eq-music-flauta-bambu-001",
  TAMBOR: "eq-music-tambor-001",
  LIRA: "eq-music-lira-001",
  HARPA: "eq-music-harpa-001",
  OCARINA: "eq-music-ocarina-001",

  // === EQUIPAMENTOS ESPECIAIS ===
  BUSSOLA: "eq-special-bussola-001",
  MAPA: "eq-special-mapa-001",
  LUNETA: "eq-special-luneta-001",
  LANTERNA: "eq-special-lanterna-001",
  TOCHA: "eq-special-tocha-001",
  CORDA_ESCALADA: "eq-special-corda-escalada-001",
  GANCHO_ESCALADA: "eq-special-gancho-escalada-001",
  KIT_SOBREVIVENCIA: "eq-special-kit-sobrevivencia-001",
  KIT_PRIMEIROS_SOCORROS: "eq-special-kit-primeiros-socorros-001"
} as const;

// IDs dos biomas atualizados com IDs do banco de dados
export const BIOME_IDS = {
  FLORESTA: "61b1e6d2-b284-4c11-a5e0-dbc4d46ebd47",
  DESERTO: "1680de81-559a-4115-9bd5-b3ac92e7f678", 
  MONTANHA: "f89038af-b3af-4246-b563-eb992f7b2f50",
  OCEANO: "829bd63f-69f7-49f8-a10e-925c122e32c6",
  TUNDRA: "biome-tundra-001",
  SAVANA: "biome-savana-001",
  PANTANO: "biome-pantano-001",
  CAVERNAS: "biome-cavernas-001",
  VULCAO: "biome-vulcao-001",
  ILHA_TROPICAL: "biome-ilha-tropical-001"
} as const;

export const QUEST_IDS = {
  PRIMEIRO_EXPLORADOR: "8d5b36f3-12cf-47e6-8283-cd73b9e8c85c",
  PRIMEIRO_PASSO: "e5184b00-3c28-4b30-8b64-f16a7f10c49b",
  PRIMEIRO_ARTESAO: "6028baa4-bbdc-4fc4-801c-741ed9c5b3ee",
  CAÇADOR_INICIANTE: "quest-cacador-iniciante-001",
  PESCADOR_EXPERT: "quest-pescador-expert-001",
  EXPLORADOR_BIOMAS: "quest-explorador-biomas-001",
  ARTESAO_MASTER: "quest-artesao-master-001",
  COLETOR_RECURSOS: "quest-coletor-recursos-001",
  SOBREVIVENTE: "quest-sobrevivente-001"
} as const;

export const RECIPE_IDS = {
  // === RECEITAS BÁSICAS ===
  BARBANTE: "rec-barbante-001",
  CORDA: "rec-corda-001",
  BARBANTE_REFORÇADO: "rec-barbante-reforcado-001",
  CORDA_RESISTENTE: "rec-corda-resistente-001",
  CORDA_NAVAL: "rec-corda-naval-001",

  // === RECEITAS DE EQUIPAMENTOS COMPLETOS ===
  MACHADO: "rec-machado-001", 
  PICARETA: "rec-picareta-001",
  FOICE: "rec-foice-001",
  FACA: "rec-faca-001",
  VARA_PESCA: "rec-vara-pesca-001",
  ARCO_FLECHA: "rec-arco-flecha-001",
  LANCA: "rec-lanca-001",
  PA: "rec-pa-001",
  ESPADA_PEDRA: "rec-espada-pedra-001",
  MARTELO: "rec-martelo-001",
  SERRA: "rec-serra-001",
  ENXADA: "rec-enxada-001",

  // === RECEITAS DE EQUIPAMENTOS AVANÇADOS ===
  MACHADO_FERRO: "rec-machado-ferro-001",
  PICARETA_FERRO: "rec-picareta-ferro-001",
  ESPADA_FERRO: "rec-espada-ferro-001",
  LANCA_FERRO: "rec-lanca-ferro-001",
  MACHADO_ACO: "rec-machado-aco-001",
  PICARETA_ACO: "rec-picareta-aco-001",
  ESPADA_ACO: "rec-espada-aco-001",

  // === RECEITAS DE PARTES - CABOS E HASTES ===
  CABO_MACHADO: "rec-cabo-machado-001",
  CABO_PICARETA: "rec-cabo-picareta-001",
  CABO_ESPADA: "rec-cabo-espada-001",
  CABO_FACA: "rec-cabo-faca-001",
  CABO_LANCA: "rec-cabo-lanca-001",
  CABO_FOICE: "rec-cabo-foice-001",
  CABO_PA: "rec-cabo-pa-001",
  CABO_MARTELO: "rec-cabo-martelo-001",
  CABO_SERRA: "rec-cabo-serra-001",
  CABO_ENXADA: "rec-cabo-enxada-001",
  HASTE_FLECHA: "rec-haste-flecha-001",
  VARA_BAMBU: "rec-vara-bambu-001",

  // === RECEITAS DE PARTES - CABEÇAS E LÂMINAS ===
  CABECA_MACHADO: "rec-cabeca-machado-001",
  CABECA_PICARETA: "rec-cabeca-picareta-001",
  LAMINA_ESPADA: "rec-lamina-espada-001",
  LAMINA_FACA: "rec-lamina-faca-001",
  PONTA_LANCA: "rec-ponta-lanca-001",
  PONTA_FLECHA: "rec-ponta-flecha-001",
  LAMINA_FOICE: "rec-lamina-foice-001",
  CABECA_PA: "rec-cabeca-pa-001",
  CABECA_MARTELO: "rec-cabeca-martelo-001",
  LAMINA_SERRA: "rec-lamina-serra-001",
  LAMINA_ENXADA: "rec-lamina-enxada-001",

  // === RECEITAS DE MATERIAIS PROCESSADOS ===
  BARRA_FERRO: "rec-barra-ferro-001",
  BARRA_COBRE: "rec-barra-cobre-001",
  BARRA_BRONZE: "rec-barra-bronze-001",
  BARRA_ACO: "rec-barra-aco-001",
  LINGOTE_FERRO: "rec-lingote-ferro-001",
  LINGOTE_COBRE: "rec-lingote-cobre-001",
  LINGOTE_BRONZE: "rec-lingote-bronze-001",
  CHAPA_FERRO: "rec-chapa-ferro-001",
  CHAPA_COBRE: "rec-chapa-cobre-001",
  FERRO_FUNDIDO_REFINADO: "rec-ferro-fundido-refinado-001",

  // === RECEITAS DE TECIDOS E COUROS ===
  COURO_CURTIDO: "rec-couro-curtido-001",
  COURO_REFINADO: "rec-couro-refinado-001",
  TECIDO_FIBRA: "rec-tecido-fibra-001",
  TECIDO_LINHO: "rec-tecido-linho-001",
  TECIDO_ALGODAO: "rec-tecido-algodao-001",
  PELE_TRATADA: "rec-pele-tratada-001",
  FELTRO: "rec-feltro-001",

  // === RECEITAS DE COMPONENTES ESPECIAIS ===
  GANCHO_FERRO: "rec-gancho-ferro-001",
  GANCHO_BRONZE: "rec-gancho-bronze-001",
  ARGOLA_FERRO: "rec-argola-ferro-001",
  ARGOLA_BRONZE: "rec-argola-bronze-001",
  PREGO_FERRO: "rec-prego-ferro-001",
  PREGO_BRONZE: "rec-prego-bronze-001",
  DOBRADICA_FERRO: "rec-dobradica-ferro-001",
  DOBRADICA_BRONZE: "rec-dobradica-bronze-001",
  CORDA_ARCO: "rec-corda-arco-001",
  EMPUNHADURA: "rec-empunhadura-001",
  EMPUNHADURA_COURO: "rec-empunhadura-couro-001",
  FIO_SINEW: "rec-fio-sinew-001",
  CORRENTE_FERRO: "rec-corrente-ferro-001",

  // === RECEITAS DE CONTAINERS E UTENSÍLIOS ===
  BALDE_MADEIRA: "rec-balde-madeira-001",
  PANELA_BARRO: "rec-panela-barro-001",
  PANELA: "rec-panela-001",
  PANELA_FERRO: "rec-panela-ferro-001",
  GARRAFA_BAMBU: "rec-garrafa-bambu-001",
  MOCHILA: "rec-mochila-001",
  MOCHILA_GRANDE: "rec-mochila-grande-001",
  BARRIL_IMPROVISADO: "rec-barril-improvisado-001",
  BARRIL_MADEIRA: "rec-barril-madeira-001",
  BAU_MADEIRA: "rec-bau-madeira-001",
  BAU_FERRO: "rec-bau-ferro-001",

  // === RECEITAS DE ARMADURAS ===
  CAPACETE_COURO: "rec-capacete-couro-001",
  PEITORAL_COURO: "rec-peitoral-couro-001",
  CALCAS_COURO: "rec-calcas-couro-001",
  BOTAS_COURO: "rec-botas-couro-001",
  CAPACETE_FERRO: "rec-capacete-ferro-001",
  PEITORAL_FERRO: "rec-peitoral-ferro-001",
  CALCAS_FERRO: "rec-calcas-ferro-001",
  BOTAS_FERRO: "rec-botas-ferro-001",
  ESCUDO_FERRO: "rec-escudo-ferro-001",

  // === RECEITAS DE CONSUMÍVEIS ===
  ISCA_PESCA: "rec-isca-pesca-001",
  ISCA_MINHOCA: "rec-isca-minhoca-001",
  ISCA_GRILO: "rec-isca-grilo-001",
  SUCO_FRUTAS: "rec-suco-frutas-001",
  SUCO_AMORA: "rec-suco-amora-001",
  COGUMELOS_ASSADOS: "rec-cogumelos-assados-001",
  COGUMELOS_REFOGADOS: "rec-cogumelos-refogados-001",
  PEIXE_GRELHADO: "rec-peixe-grelhado-001",
  PEIXE_DEFUMADO: "rec-peixe-defumado-001",
  CARNE_ASSADA: "rec-carne-assada-001",
  CARNE_DEFUMADA: "rec-carne-defumada-001",
  CARNE_SECA: "rec-carne-seca-001",
  ENSOPADO_CARNE: "rec-ensopado-carne-001",
  ENSOPADO_PEIXE: "rec-ensopado-peixe-001",
  ENSOPADO_VEGETAIS: "rec-ensopado-vegetais-001",
  SOPA_COGUMELOS: "rec-sopa-cogumelos-001",
  PAO_SELVAGEM: "rec-pao-selvagem-001",

  // === RECEITAS ESPECIAIS ===
  TOCHA: "rec-tocha-001",
  LANTERNA: "rec-lanterna-001",
  CORDA_ESCALADA: "rec-corda-escalada-001",
  KIT_SOBREVIVENCIA: "rec-kit-sobrevivencia-001",
  KIT_PRIMEIROS_SOCORROS: "rec-kit-primeiros-socorros-001",
  BUSSOLA: "rec-bussola-001",
  MAPA: "rec-mapa-001"
} as const;

// Funções helper para validação de tipos
export function isResourceId(id: string): boolean {
  return id.startsWith('res-');
}

export function isEquipmentId(id: string): boolean {
  return id.startsWith('eq-');
}

export function isBiomeId(id: string): boolean {
  return id.startsWith('biome-') || Object.values(BIOME_IDS).includes(id as any);
}

export function isQuestId(id: string): boolean {
  return id.startsWith('quest-') || Object.values(QUEST_IDS).includes(id as any);
}

export function isRecipeId(id: string): boolean {
  return id.startsWith('rec-');
}

// Obter todos os IDs para validação
export const ALL_RESOURCE_IDS = Object.values(RESOURCE_IDS);
export const ALL_EQUIPMENT_IDS = Object.values(EQUIPMENT_IDS);
export const ALL_BIOME_IDS = Object.values(BIOME_IDS);
export const ALL_QUEST_IDS = Object.values(QUEST_IDS);
export const ALL_RECIPE_IDS = Object.values(RECIPE_IDS);

// Validação master de ID  
export function isValidGameId(id: string): boolean {
  const allIds = [
    ...Object.values(RESOURCE_IDS),
    ...Object.values(EQUIPMENT_IDS), 
    ...Object.values(BIOME_IDS),
    ...Object.values(QUEST_IDS),
    ...Object.values(RECIPE_IDS)
  ];
  return allIds.includes(id as any);
}
