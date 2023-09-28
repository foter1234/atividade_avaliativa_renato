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
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.descricao}</p>
                    <button class="deletar">excluir</button>
                    <button class="editar" titulo="${anotacao.titulo}">Editar</button>
                   </div>`;
        });
        listagem(divLista.join(' '));

        const deletar = document.querySelectorAll(".deletar");
        deletar.forEach((deletar, index) => {
            deletar.addEventListener("click", () => deletarAnotacao(anotacoes[index].titulo));
        });

        const editarButtons = document.querySelectorAll(".editar");
        editarButtons.forEach(editarButton => {
            editarButton.addEventListener("click", (event) => {
                const titulo = event.target.getAttribute("titulo");
                editarAnotacao(titulo, anotacoes);
            });
        });     
    
    }
}
function editarAnotacao(titulo, anotacoes) {
    const anotacao = anotacoes.find(a => a.titulo === titulo);

    const formulario = document.createElement('div');
    formulario.innerHTML = `
        <h2 value=${anotacao.titulo}>Editar Anotação de ${anotacao.titulo}</h2>
        <textarea id="novaDescricao" cols="30" rows="10" placeholder="Nova Descrição">${anotacao.descricao}</textarea><br/>
        <input type="date" id="novaData" value="${anotacao.data}"><br/>
        <button id="btnSalvar">Salvar</button>
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

    anotacao.descricao = novaDescricao;
    anotacao.data = novaData;


    await store.put(anotacao);
    await tx.done;
  
    document.getElementById('resultados').innerHTML = '';

}



async function adicionarAnotacao() {

    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ titulo: titulo, descricao: descricao, data: data });
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
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
 
}



