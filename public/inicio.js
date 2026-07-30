// public/inicio.js

import { inicializarMenuSuperior } from './modulos/modulo_menu_superior.js';
import { inicializarMenuEsquerdo } from './modulos/modulo_menu_esquerdo.js';
import { inicializarMenuDireito } from './modulos/modulo_menu_direito.js';
import { inicializarTelaDeCombate } from './modulos/modulo_tela_de_combate.js';

// 1. Monta e ativa o menu superior azul
inicializarMenuSuperior();

// 2. Monta e ativa o menu esquerdo amarelo (status do herói)
inicializarMenuEsquerdo();

// 3. Monta e ativa a tela de combate central branca
inicializarTelaDeCombate();

// 4. Monta e ativa o menu direito amarelo (inventário/mochila)
inicializarMenuDireito();