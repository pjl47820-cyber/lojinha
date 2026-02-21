// ============================================
// FUNÇÕES DE GERENCIAMENTO DE PRODUTOS
// ============================================

// Array temporário para armazenar as imagens selecionadas
let imagensSelecionadas = [];

// Carregar produtos do localStorage
function carregarProdutos() {
    const produtosStorage = localStorage.getItem('maosDeFadaProdutos');
    if (produtosStorage) {
        return JSON.parse(produtosStorage);
    }
    return [];
}

// Salvar produtos no localStorage
function salvarProdutos(produtos) {
    localStorage.setItem('maosDeFadaProdutos', JSON.stringify(produtos));
}

// Converter imagem para Base64
function converterImagemParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// Processar imagens selecionadas
document.getElementById('imagensProduto').addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    const previewContainer = document.getElementById('previewImagens');
    
    if (files.length === 0) return;
    
    // Mostrar loading
    previewContainer.innerHTML = '<p style="color:#999;">📤 Carregando imagens...</p>';
    
    try {
        // Converter todas as imagens para Base64
        for (const file of files) {
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                alert(`❌ O arquivo "${file.name}" não é uma imagem válida!`);
                continue;
            }
            
            // Validar tamanho (máximo 5MB por imagem)
            if (file.size > 5 * 1024 * 1024) {
                alert(`❌ A imagem "${file.name}" é muito grande! Máximo 5MB por imagem.`);
                continue;
            }
            
            const base64 = await converterImagemParaBase64(file);
            imagensSelecionadas.push({
                nome: file.name,
                data: base64
            });
        }
        
        // Atualizar preview
        atualizarPreviewImagens();
        
    } catch (error) {
        console.error('Erro ao processar imagens:', error);
        alert('❌ Erro ao processar as imagens. Tente novamente.');
        previewContainer.innerHTML = '';
    }
});

// Atualizar preview das imagens
function atualizarPreviewImagens() {
    const previewContainer = document.getElementById('previewImagens');
    
    if (imagensSelecionadas.length === 0) {
        previewContainer.innerHTML = '<p style="color:#999;">Nenhuma imagem selecionada</p>';
        return;
    }
    
    previewContainer.innerHTML = '';
    
    imagensSelecionadas.forEach((imagem, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        div.innerHTML = `
            <img src="${imagem.data}" alt="${imagem.nome}">
            <button type="button" class="btn-remover-preview" onclick="removerImagemPreview(${index})" title="Remover imagem">✖</button>
        `;
        
        previewContainer.appendChild(div);
    });
}

// Remover imagem do preview
function removerImagemPreview(index) {
    imagensSelecionadas.splice(index, 1);
    atualizarPreviewImagens();
    
    // Limpar o input file se não houver mais imagens
    if (imagensSelecionadas.length === 0) {
        document.getElementById('imagensProduto').value = '';
    }
}

// Renderizar lista de produtos no painel admin
function renderizarListaProdutos() {
    const produtos = carregarProdutos();
    const lista = document.getElementById('listaProdutos');
    const totalProdutos = document.getElementById('totalProdutos');
    
    totalProdutos.textContent = produtos.length;
    
    if (produtos.length === 0) {
        lista.innerHTML = `
            <div class="mensagem-vazia">
                <p>📦 Nenhum produto cadastrado ainda</p>
                <p style="font-size:14px;">Use o formulário ao lado para adicionar seu primeiro produto!</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = '';
    
    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'produto-item';
        
        // Criar preview das imagens
        const imagensHTML = produto.imagens.map(img => 
            `<img src="${img}" alt="${produto.nome}">`
        ).join('');
        
        div.innerHTML = `
            <h3>${produto.nome}</h3>
            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            <span class="categoria-badge">${produto.categoria}</span>
            <div class="imagens-preview">
                ${imagensHTML}
            </div>
            <p style="font-size:12px; color:#999;">ID: ${produto.id} | ${produto.imagens.length} imagem(ns)</p>
            <button class="btn-remover" onclick="removerProduto(${produto.id})">🗑️ Remover Produto</button>
        `;
        
        lista.appendChild(div);
    });
}

// Adicionar novo produto
document.getElementById('formProduto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const produtos = carregarProdutos();
    const nome = document.getElementById('nomeProduto').value.trim();
    const preco = parseFloat(document.getElementById('precoProduto').value);
    let categoria = document.getElementById('categoriaProduto').value;
    
    // Validações
    if (!nome) {
        alert('❌ Por favor, digite o nome do produto!');
        return;
    }
    
    if (preco <= 0 || isNaN(preco)) {
        alert('❌ Por favor, digite um preço válido!');
        return;
    }
    
    if (!categoria) {
        alert('❌ Por favor, selecione uma categoria!');
        return;
    }
    
    // Se escolheu "nova categoria"
    if (categoria === 'nova') {
        const novaCategoria = document.getElementById('novaCategoria').value.trim().toLowerCase();
        if (!novaCategoria) {
            alert('❌ Por favor, digite o nome da nova categoria!');
            return;
        }
        // Remover espaços e caracteres especiais
        categoria = novaCategoria.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    
    // Validar imagens
    if (imagensSelecionadas.length === 0) {
        alert('❌ Por favor, selecione pelo menos uma imagem!');
        return;
    }
    
    // Extrair apenas os dados Base64 das imagens
    const imagens = imagensSelecionadas.map(img => img.data);
    
    // Gerar novo ID
    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
    
    // Criar novo produto
    const novoProduto = {
        id: novoId,
        nome: nome,
        preco: preco,
        categoria: categoria,
        imagens: imagens
    };
    
    // Adicionar e salvar
    produtos.push(novoProduto);
    salvarProdutos(produtos);
    
    // Limpar formulário
    document.getElementById('formProduto').reset();
    document.getElementById('novaCategoriaGroup').style.display = 'none';
    imagensSelecionadas = [];
    document.getElementById('previewImagens').innerHTML = '<p style="color:#999;">Nenhuma imagem selecionada</p>';
    
    // Atualizar lista
    renderizarListaProdutos();
    
    // Feedback
    alert(`✅ Produto "${nome}" adicionado com sucesso!\n\nO produto já está disponível no site.`);
});

// Remover produto
function removerProduto(id) {
    const produtos = carregarProdutos();
    const produto = produtos.find(p => p.id === id);
    
    if (!produto) {
        alert('❌ Produto não encontrado!');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja remover o produto:\n\n"${produto.nome}"\n\nEsta ação não pode ser desfeita!`)) {
        return;
    }
    
    // Filtrar removendo o produto
    const produtosAtualizados = produtos.filter(p => p.id !== id);
    salvarProdutos(produtosAtualizados);
    renderizarListaProdutos();
    
    alert(`✅ Produto "${produto.nome}" removido com sucesso!`);
}

// Mostrar/ocultar campo de nova categoria
document.getElementById('categoriaProduto').addEventListener('change', function() {
    const novaCategoriaGroup = document.getElementById('novaCategoriaGroup');
    if (this.value === 'nova') {
        novaCategoriaGroup.style.display = 'block';
        document.getElementById('novaCategoria').required = true;
    } else {
        novaCategoriaGroup.style.display = 'none';
        document.getElementById('novaCategoria').required = false;
    }
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    renderizarListaProdutos();
    
    // Inicializar preview vazio
    document.getElementById('previewImagens').innerHTML = '<p style="color:#999;">Nenhuma imagem selecionada</p>';
    
    console.log('✅ Painel Administrativo carregado com sucesso!');
    console.log('📦 Total de produtos:', carregarProdutos().length);
});
