import { openDB } from "idb";


let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    await criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
     
    document.getElementById('btnBuscar').addEventListener('click', () => {
        const busca = document.getElementById('buscas').value;
            buscarAnotacaoPorTitulo(busca);
       
    });
    
});

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
         
                    <h2>Anotação</h2>
                    <p>titulo:${anotacao.titulo}</p>
                    <p>data:${anotacao.data}</p>
                    <p>descrição:${anotacao.descricao}</p>
                    <p>categoria:${anotacao.categoria}</p>
                    <button class="deletar">excluir</button>
                    <button class="editar" titulo="${anotacao.titulo}">Editar</button>
                   </div><br/><br/><br/>`;
        });
        listagem(divLista.join(' '));

            const deletar = document.querySelectorAll(".deletar");
            deletar.forEach((deletar, index) => {
            deletar.addEventListener("click", () => deletarAnotacao(anotacoes[index].titulo));
        });

                const editar = document.querySelectorAll(".editar");
                editar.forEach(edita => {
                edita.addEventListener("click", (event) => {
                const titulo = event.target.getAttribute("titulo");
                editarAnotacao(titulo, anotacoes);

            });
        });     
    
    }
}
async function buscarAnotacaoPorTitulo(titulo) {

    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacao = await store.get(titulo);

    const resultados = document.getElementById('resultados');
    resultados.innerHTML = '';

    if (anotacao) {
       
        const listagem = document.createElement("div")
        listagem.innerHTML= `<div class="item">
         
        <h2>Anotação</h2>
        <p>titulo:${anotacao.titulo}</p>
        <p>data:${anotacao.data}</p>
        <p>descrição:${anotacao.descricao}</p>
        <p>categoria:${anotacao.categoria}</p>
        <button class="deletar">excluir</button>
        <button class="editar" titulo="${anotacao.titulo}">Editar</button>
       </div><br/><br/><br/>`
        resultados.appendChild(listagem);
    } else {
        const mensagem = document.createElement('div');
        mensagem.innerHTML= `
        <p>Nenhum resultado encontrado.</p>`
        resultados.appendChild(mensagem);
    }



}

function editarAnotacao(titulo, anotacoes) {

    const anotacao = anotacoes.find(a => a.titulo === titulo);

    const formulario = document.createElement('div');
    
    formulario.innerHTML = `
        <div class="form">
        <h2 value=${anotacao.titulo}>Editar Anotação de ${anotacao.titulo}</h2>
        <textarea id="novaDescricao" cols="30" rows="10" placeholder="Nova Descrição">${anotacao.descricao}</textarea><br/>
        <input type="date" id="novaData" value="${anotacao.data}"><br/>
        <input type="text" id="novaCategoria" value="${anotacao.categoria}"><br/>
        <button id="btnSalvar">Salvar</button>
        </div>
        `;

    const btnSalvar = formulario.querySelector('#btnSalvar');
    btnSalvar.addEventListener('click', () => salvarAnotacao(titulo));

    document.getElementById('resultados').innerHTML = '';
    document.getElementById('resultados').appendChild(formulario);

}



async function salvarAnotacao(titulo) {

    const tx = await db.transaction('anotacao', 'readwrite');
    const store = await tx.objectStore('anotacao');
    const anotacao = await store.get(titulo);
    

    
    const novaDescricao = document.getElementById('novaDescricao').value;
    const novaData = document.getElementById('novaData').value;
    const novaCategoria = document.getElementById('novaCategoria').value;

    anotacao.descricao = novaDescricao;
    anotacao.data = novaData;
    anotacao.categoria = novaCategoria;


    await store.put(anotacao);
    await tx.done;
  
    document.getElementById('resultados').innerHTML = '';

}



async function adicionarAnotacao() {

    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    let categoria = document.getElementById("categoria").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ titulo: titulo, descricao: descricao, data: data, categoria:categoria });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}


async function deletarAnotacao(titulo) {
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');

    try {
        await store.delete(titulo);
        buscarTodasAnotacoes()
        console.log('Registro excluído com sucesso!');

    } catch (error) {
        console.error('Erro ao EXCLUIR registro:', error);
        tx.abort();
    }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("data").value = '';
    document.getElementById("categoria").value = '';
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
 
}



