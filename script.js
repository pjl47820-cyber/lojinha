// ============================================
// GERENCIAMENTO DE PRODUTOS
// ============================================

// Carregar produtos do localStorage
function carregarProdutos() {
    const produtosStorage = localStorage.getItem('maosDeFadaProdutos');
    if (produtosStorage) {
        return JSON.parse(produtosStorage);
    }
    
    // Produtos iniciais (primeira vez que abre o site)
    const produtosIniciais = [
        {
            id: 1,
            nome: "CANECA PORCELANA - 300ml",
            preco: 39.00,
            categoria: "caneca",
            imagens: ["caneca1.jpeg", "caneca2.jpeg"]
        },
        {
            id: 2,
            nome: "CAIXA PADRINHOS - P",
            preco: 19.00,
            categoria: "caixa-padrinho",
            imagens: ["caixaPadrinhos1.jpeg", "caixaPadrinhos2.jpeg", "caixaPadrinhos3.jpeg"]
        },
        {
            id: 3,
            nome: "QUADRO MADEIRA E ACETATO - TAM 30x20",
            preco: 39.00,
            categoria: "quadro",
            imagens: ["quadromade1.jpeg", "quadromade2.jpeg"]
        },
        {
            id: 4,
            nome: "ADESIVO CIRCULAR PERSONALIZADO",
            preco: 10.00,
            categoria: "adesivo",
            imagens: ["adesivo.jpeg"]
        },
        {
            id: 5,
            nome: "CENTRO DE MESA - DISPLAY",
            preco: 5.50,
            categoria: "centro-mesa",
            imagens: ["centroMesa1.jpeg", "centroMesa2.jpeg"]
        },
        {
            id: 6,
            nome: "PEGUE E MONTE - Mesa cavalete",
            preco: 110.00,
            categoria: "pegue-monte-cavalete",
            imagens: ["PegueMonteCavalete1.jpeg", "PegueMonteCavalete2.jpeg"]
        }
    ];
    
    localStorage.setItem('maosDeFadaProdutos', JSON.stringify(produtosIniciais));
    return produtosIniciais;
}

// Renderizar produtos no catálogo
function renderizarProdutos() {
    const produtos = carregarProdutos();
    const catalogo = document.getElementById("catalogo");
    catalogo.innerHTML = "";

    if (produtos.length === 0) {
        catalogo.innerHTML = '<p style="text-align:center; padding:50px; color:#999;">Nenhum produto cadastrado ainda.</p>';
        return;
    }

    produtos.forEach(produto => {
        const divProduto = document.createElement("div");
        divProduto.className = `produto ${produto.categoria}`;
        
        const idImagem = `img-produto-${produto.id}`;
        
        // Criar miniaturas das imagens
        let variacoesHTML = "";
        produto.imagens.forEach(img => {
            variacoesHTML += `<img src="${img}" style="width:40px; height:40px; cursor:pointer; object-fit:cover; border-radius:5px;" onclick="trocarImagem('${idImagem}','${img}')">`;
        });

        divProduto.innerHTML = `
            <img id="${idImagem}" src="${produto.imagens[0]}" style="width:100%; max-width:200px; cursor:pointer; border-radius:10px;" onclick="abrirModal(this.src)">
            <div class="variacoes" style="display:flex; gap:5px; margin-top:10px; justify-content:center;">
                ${variacoesHTML}
            </div>
            <h3>${produto.nome}</h3>
            <p style="font-size:20px; color:#e03e39; font-weight:bold;">R$ ${produto.preco.toFixed(2)}</p>
            <button onclick="adicionarCarrinho('${produto.nome.replace(/'/g, "\\'")}', ${produto.preco}, document.getElementById('${idImagem}').src)">Adicionar ao Carrinho</button>
        `;
        
        catalogo.appendChild(divProduto);
    });
}

// Trocar imagem principal do produto
function trocarImagem(idImagemPrincipal, novaSrc) {
    const img = document.getElementById(idImagemPrincipal);
    if (img) {
        img.src = novaSrc;
    }
}

// Abrir modal com imagem ampliada
function abrirModal(src) {
    const modal = document.getElementById("modal");
    const imagemModal = document.getElementById("imagemModal");
    imagemModal.src = src;
    modal.style.display = "flex";
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

// Filtrar produtos por categoria
function filtrar(categoria) {
    const produtos = document.querySelectorAll(".produto");

    produtos.forEach(produto => {
        if (categoria === "todos") {
            produto.style.display = "block";
        } else if (produto.classList.contains(categoria)) {
            produto.style.display = "block";
        } else {
            produto.style.display = "none";
        }
    });
}

// ============================================
// GERENCIAMENTO DO CARRINHO
// ============================================

let carrinho = [];

document.addEventListener("DOMContentLoaded", function() {
    // Renderizar produtos ao carregar a página
    renderizarProdutos();
    
    const contador = document.getElementById("contador");
    const painel = document.getElementById("painelCarrinho");
    const lista = document.getElementById("listaCarrinho");
    const totalElemento = document.getElementById("totalCarrinho");
    const botaoCarrinho = document.getElementById("botaoCarrinho");
    const fecharCarrinhoBtn = document.getElementById("fecharCarrinhoBtn");
    const finalizarPedidoBtn = document.getElementById("finalizarPedidoBtn");

    // Abrir e fechar painel do carrinho
    botaoCarrinho.addEventListener("click", () => painel.classList.toggle("ativo"));
    fecharCarrinhoBtn.addEventListener("click", () => painel.classList.remove("ativo"));

    // Adicionar item ao carrinho
    window.adicionarCarrinho = function(nome, preco, imagem) {
        carrinho.push({ nome, preco, imagem });
        contador.innerText = carrinho.length;
        atualizarCarrinho();
    };

    // Atualizar visualização do carrinho
    function atualizarCarrinho() {
        lista.innerHTML = "";
        let total = 0;

        carrinho.forEach((item, index) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            li.style.marginBottom = "10px";
            li.style.padding = "8px";
            li.style.background = "#f9f9f9";
            li.style.borderRadius = "8px";

            li.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    <img src="${item.imagem}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:bold;">${item.nome}</div>
                        <div style="color:#e03e39; font-weight:bold;">R$ ${item.preco.toFixed(2)}</div>
                    </div>
                </div>
                <button onclick="removerItem(${index})" class="btn-remover">✖</button>
            `;
            lista.appendChild(li);
            total += item.preco;
        });

        totalElemento.innerText = "Total: R$ " + total.toFixed(2);
    }

    // Remover item do carrinho
    window.removerItem = function(index) {
        carrinho.splice(index, 1);
        contador.innerText = carrinho.length;
        atualizarCarrinho();
    };

    // Finalizar pedido via WhatsApp
    finalizarPedidoBtn.addEventListener("click", function() {
        if(carrinho.length === 0) { 
            alert("Seu carrinho está vazio!"); 
            return; 
        }

        let mensagem = "🛍️ *Olá! Gostaria de fazer o seguinte pedido:*\n\n";
        let total = 0;

        carrinho.forEach(item => {
            mensagem += `• ${item.nome}\n  💰 R$ ${item.preco.toFixed(2)}\n\n`;
            total += item.preco;
        });

        mensagem += `*Total: R$ ${total.toFixed(2)}*`;
        
        const numero = "5586995630268";
        const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
        window.open(url, "_blank");
    });
});
